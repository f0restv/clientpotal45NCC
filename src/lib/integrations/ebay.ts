import { db } from "../db";
import type { Product, ProductImage } from "@prisma/client";

interface EbayConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sandbox: boolean;
}

interface EbayTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

const getConfig = (): EbayConfig => ({
  clientId: process.env.EBAY_CLIENT_ID!,
  clientSecret: process.env.EBAY_CLIENT_SECRET!,
  redirectUri: process.env.EBAY_REDIRECT_URI!,
  sandbox: process.env.EBAY_SANDBOX === "true",
});

const getBaseUrl = (sandbox: boolean) =>
  sandbox ? "https://api.sandbox.ebay.com" : "https://api.ebay.com";

const getAuthUrl = (sandbox: boolean) =>
  sandbox ? "https://auth.sandbox.ebay.com" : "https://auth.ebay.com";

export function getEbayAuthUrl(): string {
  const config = getConfig();
  const scopes = [
    "https://api.ebay.com/oauth/api_scope",
    "https://api.ebay.com/oauth/api_scope/sell.inventory",
    "https://api.ebay.com/oauth/api_scope/sell.marketing",
    "https://api.ebay.com/oauth/api_scope/sell.account",
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
  ];

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: scopes.join(" "),
  });

  return `${getAuthUrl(config.sandbox)}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeEbayCode(code: string): Promise<EbayTokens> {
  const config = getConfig();
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

  const response = await fetch(`${getAuthUrl(config.sandbox)}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`eBay token exchange failed: ${response.status}`);
  }

  const data = await response.json();

  const tokens: EbayTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };

  // Store tokens in database
  await db.platformConnection.upsert({
    where: { platform: "EBAY" },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      isActive: true,
    },
    create: {
      platform: "EBAY",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      isActive: true,
    },
  });

  return tokens;
}

async function getAccessToken(): Promise<string> {
  const connection = await db.platformConnection.findUnique({
    where: { platform: "EBAY" },
  });

  if (!connection || !connection.accessToken) {
    throw new Error("eBay not connected");
  }

  // Check if token needs refresh
  if (connection.expiresAt && connection.expiresAt < new Date()) {
    return refreshEbayToken(connection.refreshToken!);
  }

  return connection.accessToken;
}

async function refreshEbayToken(refreshToken: string): Promise<string> {
  const config = getConfig();
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

  const response = await fetch(`${getAuthUrl(config.sandbox)}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`eBay token refresh failed: ${response.status}`);
  }

  const data = await response.json();

  await db.platformConnection.update({
    where: { platform: "EBAY" },
    data: {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });

  return data.access_token;
}

export async function createEbayListing(
  product: Product & { images: ProductImage[] }
): Promise<{ listingId: string; url: string }> {
  const config = getConfig();
  const accessToken = await getAccessToken();

  // Create inventory item
  const sku = product.sku;
  const inventoryItem = {
    availability: {
      shipToLocationAvailability: {
        quantity: product.quantity,
      },
    },
    condition: mapCondition(product.condition),
    product: {
      title: product.title,
      description: product.description,
      imageUrls: product.images.map((img) => img.url),
      aspects: buildAspects(product),
    },
  };

  // Create/Update inventory item
  await fetch(`${getBaseUrl(config.sandbox)}/sell/inventory/v1/inventory_item/${sku}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Content-Language": "en-US",
    },
    body: JSON.stringify(inventoryItem),
  });

  // Create offer
  const offer = {
    sku,
    marketplaceId: "EBAY_US",
    format: product.listingType === "AUCTION" ? "AUCTION" : "FIXED_PRICE",
    listingPolicies: {
      fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID,
      paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID,
      returnPolicyId: process.env.EBAY_RETURN_POLICY_ID,
    },
    pricingSummary: {
      price: {
        value: product.price?.toString() || "0",
        currency: "USD",
      },
    },
    categoryId: await getCategoryId(product),
  };

  const offerResponse = await fetch(`${getBaseUrl(config.sandbox)}/sell/inventory/v1/offer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Content-Language": "en-US",
    },
    body: JSON.stringify(offer),
  });

  if (!offerResponse.ok) {
    const error = await offerResponse.text();
    throw new Error(`Failed to create eBay offer: ${error}`);
  }

  const offerData = await offerResponse.json();

  // Publish offer
  const publishResponse = await fetch(
    `${getBaseUrl(config.sandbox)}/sell/inventory/v1/offer/${offerData.offerId}/publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const publishData = await publishResponse.json();
  const listingId = publishData.listingId;

  // Store in database
  const connection = await db.platformConnection.findUnique({
    where: { platform: "EBAY" },
  });

  await db.platformListing.create({
    data: {
      productId: product.id,
      connectionId: connection!.id,
      externalId: listingId,
      externalUrl: `https://www.ebay.com/itm/${listingId}`,
      status: "ACTIVE",
      lastSyncAt: new Date(),
    },
  });

  return {
    listingId,
    url: `https://www.ebay.com/itm/${listingId}`,
  };
}

export async function endEbayListing(listingId: string): Promise<void> {
  const config = getConfig();
  const accessToken = await getAccessToken();

  await fetch(
    `${getBaseUrl(config.sandbox)}/sell/inventory/v1/offer/${listingId}/withdraw`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  await db.platformListing.updateMany({
    where: { externalId: listingId },
    data: { status: "REMOVED" },
  });
}

function mapCondition(condition?: string | null): string {
  const conditionMap: Record<string, string> = {
    new: "NEW",
    "like new": "LIKE_NEW",
    "very good": "VERY_GOOD",
    good: "GOOD",
    acceptable: "ACCEPTABLE",
    used: "USED_EXCELLENT",
  };
  return conditionMap[condition?.toLowerCase() || ""] || "USED_EXCELLENT";
}

function buildAspects(product: Product): Record<string, string[]> {
  const aspects: Record<string, string[]> = {};

  if (product.year) aspects["Year"] = [product.year.toString()];
  if (product.mint) aspects["Mint Location"] = [product.mint];
  if (product.grade) aspects["Grade"] = [product.grade];
  if (product.certification) aspects["Certification"] = [product.certification];

  return aspects;
}

async function getCategoryId(product: Product): Promise<string> {
  // Default to "Coins & Paper Money" category
  // In production, this would map to specific eBay categories
  return "11116"; // US Coins category
}
