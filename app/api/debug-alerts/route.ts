import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findMatchingSubscriptions } from '@/lib/alertMatcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany();
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    const logs = await prisma.notificationLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 10
    });

    const matches: any[] = [];
    for (const listing of listings) {
      const subs = await findMatchingSubscriptions(listing);
      if (subs.length > 0) {
        matches.push({
          listingId: listing.id,
          title: listing.rawTitle,
          make: listing.make,
          model: listing.model,
          year: listing.year,
          price: listing.price,
          matchedSubs: subs.map(s => s.email)
        });
      }
    }

    return NextResponse.json({
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        email: s.email,
        make: s.make,
        model: s.model,
        year: `${s.yearMin}-${s.yearMax}`,
        price: `${s.priceMin}-${s.priceMax}`
      })),
      recentLogs: logs,
      potentialMatches: matches
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
