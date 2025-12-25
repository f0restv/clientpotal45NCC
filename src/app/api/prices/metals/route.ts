import { NextResponse } from "next/server";
import { getAllMetalPrices } from "@/lib/metal-prices";

export async function GET() {
  try {
    const prices = await getAllMetalPrices();

    return NextResponse.json({
      prices: prices.map((p) => ({
        metal: p.metal,
        spotPrice: p.spotPrice,
        askPrice: p.askPrice,
        bidPrice: p.bidPrice,
        change: p.change,
        changePct: p.changePct,
        timestamp: p.timestamp,
      })),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching metal prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
