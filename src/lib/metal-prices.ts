import { db } from "./db";
import type { MetalType } from "@prisma/client";

interface MetalPriceData {
  metal: MetalType;
  spotPrice: number;
  askPrice?: number;
  bidPrice?: number;
  change?: number;
  changePct?: number;
  timestamp: Date;
}

// Cache for metal prices (5 minute TTL)
const priceCache: Map<MetalType, { data: MetalPriceData; expires: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchMetalPrices(): Promise<MetalPriceData[]> {
  const apiKey = process.env.METALS_API_KEY;
  const apiUrl = process.env.METALS_API_URL || "https://metals-api.com/api";

  if (!apiKey) {
    console.warn("METALS_API_KEY not configured, using fallback prices");
    return getFallbackPrices();
  }

  try {
    const response = await fetch(`${apiUrl}/latest?access_key=${apiKey}&base=USD&symbols=XAU,XAG,XPT,XPD`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const now = new Date();

    // Metals API returns rates as 1/oz, so we need to invert
    const prices: MetalPriceData[] = [
      {
        metal: "GOLD",
        spotPrice: data.rates?.XAU ? 1 / data.rates.XAU : 0,
        timestamp: now,
      },
      {
        metal: "SILVER",
        spotPrice: data.rates?.XAG ? 1 / data.rates.XAG : 0,
        timestamp: now,
      },
      {
        metal: "PLATINUM",
        spotPrice: data.rates?.XPT ? 1 / data.rates.XPT : 0,
        timestamp: now,
      },
      {
        metal: "PALLADIUM",
        spotPrice: data.rates?.XPD ? 1 / data.rates.XPD : 0,
        timestamp: now,
      },
    ];

    // Store in database
    await Promise.all(
      prices.map((price) =>
        db.metalPrice.create({
          data: {
            metalType: price.metal,
            spotPrice: price.spotPrice,
            askPrice: price.askPrice,
            bidPrice: price.bidPrice,
            change: price.change,
            changePct: price.changePct,
          },
        })
      )
    );

    // Update cache
    prices.forEach((price) => {
      priceCache.set(price.metal, { data: price, expires: Date.now() + CACHE_TTL });
    });

    return prices;
  } catch (error) {
    console.error("Error fetching metal prices:", error);
    return getFallbackPrices();
  }
}

export async function getMetalPrice(metal: MetalType): Promise<MetalPriceData | null> {
  // Check cache first
  const cached = priceCache.get(metal);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  // Try to get from database (most recent)
  const dbPrice = await db.metalPrice.findFirst({
    where: { metalType: metal },
    orderBy: { timestamp: "desc" },
  });

  if (dbPrice) {
    const data: MetalPriceData = {
      metal: dbPrice.metalType,
      spotPrice: Number(dbPrice.spotPrice),
      askPrice: dbPrice.askPrice ? Number(dbPrice.askPrice) : undefined,
      bidPrice: dbPrice.bidPrice ? Number(dbPrice.bidPrice) : undefined,
      change: dbPrice.change ? Number(dbPrice.change) : undefined,
      changePct: dbPrice.changePct ? Number(dbPrice.changePct) : undefined,
      timestamp: dbPrice.timestamp,
    };

    // Update cache
    priceCache.set(metal, { data, expires: Date.now() + CACHE_TTL });
    return data;
  }

  // Fetch fresh prices
  const prices = await fetchMetalPrices();
  return prices.find((p) => p.metal === metal) || null;
}

export async function getAllMetalPrices(): Promise<MetalPriceData[]> {
  const metals: MetalType[] = ["GOLD", "SILVER", "PLATINUM", "PALLADIUM"];
  const prices = await Promise.all(metals.map((metal) => getMetalPrice(metal)));
  return prices.filter((p): p is MetalPriceData => p !== null);
}

export function calculateDynamicPrice(
  metalType: MetalType,
  weightOz: number,
  purity: number,
  spotPrice: number,
  premiumPercent: number = 0,
  premiumFlat: number = 0
): number {
  const metalValue = weightOz * purity * spotPrice;
  const percentPremium = metalValue * (premiumPercent / 100);
  return Math.round((metalValue + percentPremium + premiumFlat) * 100) / 100;
}

function getFallbackPrices(): MetalPriceData[] {
  const now = new Date();
  // Fallback prices (approximate market values - should be updated)
  return [
    { metal: "GOLD", spotPrice: 2350, timestamp: now },
    { metal: "SILVER", spotPrice: 28.5, timestamp: now },
    { metal: "PLATINUM", spotPrice: 980, timestamp: now },
    { metal: "PALLADIUM", spotPrice: 1050, timestamp: now },
  ];
}

// Update products with dynamic pricing based on spot prices
export async function updateDynamicPricing(): Promise<number> {
  const prices = await getAllMetalPrices();
  const priceMap = new Map(prices.map((p) => [p.metal, p.spotPrice]));

  // Get all products with metal content that need dynamic pricing
  const products = await db.product.findMany({
    where: {
      metalType: { not: null },
      metalWeight: { not: null },
      status: "ACTIVE",
    },
  });

  let updatedCount = 0;

  for (const product of products) {
    if (!product.metalType || !product.metalWeight) continue;

    const spotPrice = priceMap.get(product.metalType);
    if (!spotPrice) continue;

    const newPrice = calculateDynamicPrice(
      product.metalType,
      Number(product.metalWeight),
      Number(product.metalPurity) || 1,
      spotPrice,
      Number(product.premiumPercent) || 0,
      Number(product.premiumFlat) || 0
    );

    if (newPrice !== Number(product.price)) {
      await db.product.update({
        where: { id: product.id },
        data: { price: newPrice },
      });

      // Log price history
      await db.priceHistory.create({
        data: {
          productId: product.id,
          price: newPrice,
          reason: "spot_update",
        },
      });

      updatedCount++;
    }
  }

  return updatedCount;
}
