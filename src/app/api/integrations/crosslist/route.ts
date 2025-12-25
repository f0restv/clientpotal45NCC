import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { crossListProduct, getActiveConnections } from "@/lib/integrations";
import type { Platform } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, platforms, auctionFlexEventId } = body;

    if (!productId || !platforms || !Array.isArray(platforms)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the product with all relations
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        auction: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Cross-list to selected platforms
    const results = await crossListProduct(
      product,
      platforms as Platform[],
      auctionFlexEventId
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error cross-listing product:", error);
    return NextResponse.json(
      { error: "Cross-listing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeConnections = await getActiveConnections();

    return NextResponse.json({
      connections: activeConnections,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}
