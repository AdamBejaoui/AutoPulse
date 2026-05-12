import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // 1. Fetch user's active subscriptions
    const subs = await prisma.subscription.findMany({
      where: {
        email: { equals: email, mode: 'insensitive' }
      }
    });

    if (subs.length === 0) {
      return NextResponse.json({ listings: [] });
    }

    // 2. Build DB query conditions for each subscription
    const orConditions = subs.map(sub => {
      const cond: any = { isJunk: false, isCar: true };
      if (sub.make) cond.make = { equals: sub.make.trim(), mode: 'insensitive' };
      if (sub.model) cond.model = { equals: sub.model.trim(), mode: 'insensitive' };
      
      if (sub.yearMin != null || sub.yearMax != null) {
        cond.year = {};
        if (sub.yearMin != null) cond.year.gte = sub.yearMin;
        if (sub.yearMax != null) cond.year.lte = sub.yearMax;
      }
      
      if (sub.priceMin != null || sub.priceMax != null) {
        cond.price = {};
        if (sub.priceMin != null) cond.price.gte = sub.priceMin;
        if (sub.priceMax != null) cond.price.lte = sub.priceMax;
      }

      if (sub.mileageMin != null || sub.mileageMax != null) {
        cond.mileage = {};
        if (sub.mileageMin != null) cond.mileage.gte = sub.mileageMin;
        if (sub.mileageMax != null) cond.mileage.lte = sub.mileageMax;
      }
      return cond;
    });

    // 3. Fetch candidate cars from DB that match the broad criteria
    const candidateCars = await prisma.listing.findMany({
      where: {
        OR: orConditions.length > 0 ? orConditions : [{ id: 'none' }]
      },
      orderBy: { postedAt: "desc" },
      take: 500, // Look at the top 500 matches
    });

    // 4. In-memory filter for complex conditions (trim, keywords)
    const matchedListings = [];
    for (const car of candidateCars) {
      const isMatch = subs.some(sub => {
          // Double check basic criteria just in case
          if (sub.make && (!car.make || car.make.toLowerCase() !== sub.make.toLowerCase())) return false;
          if (sub.model && (!car.model || car.model.toLowerCase() !== sub.model.toLowerCase())) return false;
          if (sub.yearMin != null && car.year < sub.yearMin) return false;
          if (sub.yearMax != null && car.year > sub.yearMax) return false;
          if (sub.priceMin != null && car.price < sub.priceMin) return false;
          if (sub.priceMax != null && car.price > sub.priceMax) return false;
          
          // Basic filters
          if (sub.trim && car.trim && !sub.trim.split(',').some(t => car.trim?.toLowerCase().includes(t.trim().toLowerCase()))) return false;
          
          // Keywords (down payment, negative keywords, etc)
          if (sub.keywords && sub.keywords.length > 0) {
            const haystack = `${car.description || ''} ${car.rawTitle || ''}`.toLowerCase();
            for (const kw of sub.keywords) {
              if (kw.startsWith('!')) {
                if (haystack.includes(kw.substring(1).toLowerCase())) return false;
              } else {
                if (!haystack.includes(kw.toLowerCase())) return false;
              }
            }
          }
          return true;
      });

      if (isMatch) {
        matchedListings.push({
          ...car,
          matchedAt: car.postedAt // For UI purposes
        });
      }
      if (matchedListings.length >= 100) break;
    }

    return NextResponse.json({ listings: matchedListings });
  } catch (error) {
    console.error("Matches API Error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
