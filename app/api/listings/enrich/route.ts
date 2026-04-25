import { NextResponse } from 'next/server';
import { enrichListingDetails } from '@/lib/scraper/enricher';

export async function POST(req: Request) {
    try {
        const { listingId } = await req.json();
        if (!listingId) return NextResponse.json({ error: "No listingId" }, { status: 400 });

        const updatedListing = await enrichListingDetails(listingId);
        
        if (!updatedListing) {
            return NextResponse.json({ error: "Enrichment failed or already processed" }, { status: 500 });
        }

        return NextResponse.json({ success: true, listing: updatedListing });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
