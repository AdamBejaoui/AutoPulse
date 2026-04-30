import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Fetch notifications for this user's subscriptions
    const logs = await prisma.notificationLog.findMany({
      where: {
        subscription: {
          email: { equals: email, mode: 'insensitive' }
        }
      },
      include: {
        listing: true
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 50 // Limit to last 50 matches
    });

    const listings = logs.map(log => ({
      ...log.listing,
      matchedAt: log.sentAt
    }));

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Matches API Error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
