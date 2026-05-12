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

    // 2. Fetch recent cars from DB (e.g. last 1000) to find matches
    const recentCars = await prisma.listing.findMany({
      where: { isJunk: false, isCar: true },
      orderBy: { postedAt: "desc" },
      take: 1000,
    });

    // 3. Filter to only those that match at least one subscription
    const matchedListings = [];
    for (const car of recentCars) {
      // In-memory match
      const candidates = subs.filter(sub => {
          // make
          if (sub.make && (!car.make || car.make.toLowerCase() !== sub.make.toLowerCase())) return false;
          // model
          if (sub.model && (!car.model || car.model.toLowerCase() !== sub.model.toLowerCase())) return false;
          // year
          if (sub.yearMin != null && car.year < sub.yearMin) return false;
          if (sub.yearMax != null && car.year > sub.yearMax) return false;
          // price
          if (sub.priceMin != null && car.price < sub.priceMin) return false;
          if (sub.priceMax != null && car.price > sub.priceMax) return false;
          // mileage
          if (sub.mileageMin != null && car.mileage != null && car.mileage < sub.mileageMin) return false;
          if (sub.mileageMax != null && car.mileage != null && car.mileage > sub.mileageMax) return false;
          
          // Basic filters
          if (sub.trim && car.trim && !sub.trim.split(',').some(t => car.trim?.toLowerCase().includes(t.trim().toLowerCase()))) return false;
          
          // Keywords (including down payment check logic if added to keywords)
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

      if (candidates.length > 0) {
        matchedListings.push({
          ...car,
          matchedAt: car.postedAt // For UI purposes, pretend the match happened at post time
        });
      }
      if (matchedListings.length >= 100) break; // limit to 100 max matches for performance
    }

    return NextResponse.json({ listings: matchedListings });
  } catch (error) {
    console.error("Matches API Error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
