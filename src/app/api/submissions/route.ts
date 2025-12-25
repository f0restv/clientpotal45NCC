import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { analyzeMarketValue } from "@/lib/claude";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    // Admin/Staff can see all, clients only see their own
    if (!["ADMIN", "STAFF"].includes(session.user.role || "")) {
      where.userId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    const submissions = await db.submission.findMany({
      where,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      estimatedValue,
      images = [],
      aiAnalysis,
    } = body;

    // Create the submission
    const submission = await db.submission.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category,
        estimatedValue,
        aiAnalysis: aiAnalysis || undefined,
        suggestedPrice: aiAnalysis?.estimatedValue?.mid,
        estimatedDays: aiAnalysis?.avgDaysToSell,
        status: "PENDING",
        images: {
          create: images.map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
