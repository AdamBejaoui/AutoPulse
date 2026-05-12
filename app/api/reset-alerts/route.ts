import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const newAlerts = [
  { make: 'Mazda', model: 'CX-5', yearMin: 2013, yearMax: 2013, priceMax: 3000 },
  { make: 'Toyota', model: 'Highlander', yearMin: 2007, yearMax: 2010, priceMax: 2000 },
  { make: 'Toyota', model: 'Highlander', yearMin: 2011, yearMax: 2014, priceMax: 3500 },
  { make: 'Toyota', model: 'Corolla', yearMin: 2011, yearMax: 2013, priceMax: 2000 },
  { make: 'Toyota', model: 'Avalon', yearMin: 2011, yearMax: 2011, priceMax: 3000 },
  { make: 'Toyota', model: 'Venza', yearMin: 2011, yearMax: 2011, priceMax: 2000 },
  { make: 'Toyota', model: 'RAV4', yearMin: 2010, yearMax: 2010, priceMax: 2000 },
  { make: 'Lexus', model: 'RX 350', yearMin: 2005, yearMax: 2009, priceMax: 1800 },
  { make: 'Lexus', model: 'RX 350', yearMin: 2010, yearMax: 2010, priceMax: 3500 },
  { make: 'Toyota', yearMin: 2011, mileageMin: 250000 },
  { make: 'Mazda', model: 'CX-5', yearMin: 2011, mileageMin: 250000 },
  { make: 'Lexus', yearMin: 2011, mileageMin: 250000 }
];

export async function GET() {
  try {
    const prefs = await prisma.userPreference.findMany({ select: { email: true } });
    const users = await prisma.subscription.groupBy({ by: ['email'] });
    const allEmails = new Set([...prefs.map(p => p.email), ...users.map(u => u.email)]);
    
    if (allEmails.size === 0) {
      return NextResponse.json({ message: "No users found in database to update." });
    }

    // Delete existing alerts
    const deleted = await prisma.subscription.deleteMany({});
    
    // Create new ones
    let count = 0;
    for (const email of allEmails) {
      for (const alert of newAlerts) {
        await prisma.subscription.create({ data: { email, ...alert } });
        count++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} old alerts and created ${count} new alerts across ${allEmails.size} users.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
