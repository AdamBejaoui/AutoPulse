import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const totalFromYesterday = await prisma.listing.count({
      where: {
        createdAt: { gte: yesterday }
      }
    });

    const needFixFromYesterday = await prisma.listing.count({
      where: {
        createdAt: { gte: yesterday },
        OR: [
          { make: 'Unknown' },
          { mileage: null },
          { description: { contains: 'pending' } },
          { rawTitle: '' },
          { rawTitle: 'Vehicle' }
        ],
        isJunk: false
      }
    });

    return NextResponse.json({
      totalFromYesterday,
      needFixFromYesterday
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
