import { db } from "../db";
import type { Product, ProductImage } from "@prisma/client";

interface EtsyConfig {
  apiKey: string;
  sharedSecret: string;
  redirectUri: string;
}

interface EtsyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

const getConfig = (): EtsyConfig => ({
  apiKey: process.env.ETSY_API_KEY!,
  sharedSecret: process.env.ETSY_SHARED_SECRET!,
  redirectUri: process.env.ETSY_REDIRECT_URI!,
});

const ETSY_API_BASE = "https://openapi.etsy.com/v3";

export function getEtsyAuthUrl(state: string): string {
  const config = getConfig();
  const scopes = [
    "listings_r",
    "listings_w",
    "listings_d",
    "shops_r",
    "shops_w",
    "transactions_r",
  ];

  const params = new URLSearchParams({
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: scopes.join(" "),
    client_id: config.apiKey,
    state,
    code_challenge: generateCodeChallenge(),
    code_challenge_method: "S256",
  });

  return `https://www.etsy.com/oauth/connect?${params.toString()}`;
}

function generateCodeChallenge(): string {
  // In production, use proper PKCE flow
  return "challenge";
}

export async function exchangeEtsyCode(
  code: string,
  codeVerifier: string
): Promise<EtsyTokens> {
  const config = getConfig();

  const response = await fetch("https://api.etsy.com/v3/public/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.apiKey,
      redirect_uri: config.redirectUri,
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error(`Etsy token exchange failed: ${response.status}`);
  }

  const data = await response.json();

  const tokens: EtsyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };

  // Store tokens and shop info
  await db.platformConnection.upsert({
    where: { platform: "ETSY" },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      isActive: true,
    },
    create: {
      platform: "ETSY",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      isActive: true,
    },
  });

  return tokens;
}

async function getAccessToken(): Promise<{ token: string; shopId: string }> {
  const connection = await db.platformConnection.findUnique({
    where: { platform: "ETSY" },
  });

  if (!connection || !connection.accessToken) {
    throw new Error("Etsy not connected");
  }

  // Check if token needs refresh
  if (connection.expiresAt && connection.expiresAt < new Date()) {
    const newToken = await refreshEtsyToken(connection.refreshToken!);
    return { token: newToken, shopId: connection.storeId || "" };
  }

  return { token: connection.accessToken, shopId: connection.storeId || "" };
}

async function refreshEtsyToken(refreshToken: string): Promise<string> {
  const config = getConfig();

  const response = await fetch("https://api.etsy.com/v3/public/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.apiKey,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Etsy token refresh failed: ${response.status}`);
  }

  const data = await response.json();

  await db.platformConnection.update({
    where: { platform: "ETSY" },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });

  return data.access_token;
}

export async function createEtsyListing(
  product: Product & { images: ProductImage[] }
): Promise<{ listingId: string; url: string }> {
  const { token, shopId } = await getAccessToken();
  const config = getConfig();

  // Create draft listing
  const listing = {
    title: product.title.slice(0, 140), // Etsy title limit
    description: product.description,
    price: Number(product.price) || 0,
    quantity: product.quantity,
    taxonomy_id: await getTaxonomyId(product),
    who_made: "someone_else",
    when_made: product.year ? getWhenMade(product.year) : "2020_2024",
    is_supply: false,
    should_auto_renew: false,
    shipping_profile_id: await getShippingProfileId(shopId, token),
  };

  const response = await fetch(`${ETSY_API_BASE}/application/shops/${shopId}/listings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
    },
    body: JSON.stringify(listing),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Etsy listing: ${error}`);
  }

  const listingData = await response.json();
  const listingId = listingData.listing_id.toString();

  // Upload images
  for (let i = 0; i < product.images.length && i < 10; i++) {
    await uploadEtsyImage(shopId, listingId, product.images[i].url, token);
  }

  // Publish the listing
  await fetch(
    `${ETSY_API_BASE}/application/shops/${shopId}/listings/${listingId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify({ state: "active" }),
    }
  );

  const connection = await db.platformConnection.findUnique({
    where: { platform: "ETSY" },
  });

  await db.platformListing.create({
    data: {
      productId: product.id,
      connectionId: connection!.id,
      externalId: listingId,
      externalUrl: `https://www.etsy.com/listing/${listingId}`,
      status: "ACTIVE",
      lastSyncAt: new Date(),
    },
  });

  return {
    listingId,
    url: `https://www.etsy.com/listing/${listingId}`,
  };
}

async function uploadEtsyImage(
  shopId: string,
  listingId: string,
  imageUrl: string,
  token: string
): Promise<void> {
  const config = getConfig();

  // Fetch the image
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();

  const formData = new FormData();
  formData.append("image", new Blob([imageBuffer]), "image.jpg");

  await fetch(
    `${ETSY_API_BASE}/application/shops/${shopId}/listings/${listingId}/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": config.apiKey,
      },
      body: formData,
    }
  );
}

async function getTaxonomyId(product: Product): Promise<number> {
  // Map to Etsy's Coins & Money taxonomy
  // In production, map based on product category
  return 1030; // Coins & Money > Coins
}

async function getShippingProfileId(shopId: string, token: string): Promise<number> {
  const config = getConfig();

  const response = await fetch(
    `${ETSY_API_BASE}/application/shops/${shopId}/shipping-profiles`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": config.apiKey,
      },
    }
  );

  const data = await response.json();
  return data.results?.[0]?.shipping_profile_id || 0;
}

function getWhenMade(year: number): string {
  if (year >= 2020) return "2020_2024";
  if (year >= 2010) return "2010_2019";
  if (year >= 2000) return "2000_2009";
  if (year >= 1990) return "1990_1999";
  if (year >= 1980) return "1980s";
  if (year >= 1970) return "1970s";
  if (year >= 1960) return "1960s";
  if (year >= 1950) return "1950s";
  if (year >= 1940) return "1940s";
  if (year >= 1930) return "1930s";
  if (year >= 1920) return "1920s";
  if (year >= 1910) return "1910s";
  if (year >= 1900) return "1900s";
  return "before_1900";
}

export async function endEtsyListing(listingId: string): Promise<void> {
  const { token, shopId } = await getAccessToken();
  const config = getConfig();

  await fetch(
    `${ETSY_API_BASE}/application/shops/${shopId}/listings/${listingId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": config.apiKey,
      },
    }
  );

  await db.platformListing.updateMany({
    where: { externalId: listingId },
    data: { status: "REMOVED" },
  });
}
