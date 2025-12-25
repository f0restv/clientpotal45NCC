import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateSKU } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const listingType = searchParams.get("listingType");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { slug: category };
    }

    if (status) {
      where.status = status;
    } else {
      where.status = "ACTIVE";
    }

    if (listingType) {
      where.listingType = listingType;
    }

    if (featured === "true") {
      where.featured = true;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
          category: true,
          auction: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      shortDescription,
      categoryId,
      listingType = "BUY_NOW",
      price,
      metalType,
      metalWeight,
      metalPurity,
      premiumPercent,
      premiumFlat,
      year,
      mint,
      grade,
      certification,
      certNumber,
      population,
      quantity = 1,
      condition,
      images = [],
      featured = false,
      submissionId,
      isConsignment = false,
      consignmentRate,
    } = body;

    const product = await db.product.create({
      data: {
        sku: generateSKU(),
        title,
        description,
        shortDescription,
        categoryId,
        listingType,
        price,
        metalType,
        metalWeight,
        metalPurity,
        premiumPercent,
        premiumFlat,
        year,
        mint,
        grade,
        certification,
        certNumber,
        population,
        quantity,
        condition,
        featured,
        submissionId,
        isConsignment,
        consignmentRate,
        status: "DRAFT",
        images: {
          create: images.map((img: { url: string; alt?: string }, index: number) => ({
            url: img.url,
            alt: img.alt,
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
