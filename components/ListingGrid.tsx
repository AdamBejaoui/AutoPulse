import type { Listing } from "@prisma/client";
import { ListingCard } from "@/components/ListingCard";

export function ListingGrid({
  listings,
}: {
  listings: Listing[];
}): React.ReactElement {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center text-muted-foreground">
        No listings match your filters yet. Try widening your search or run a
        scrape to index the latest Facebook Marketplace vehicles.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
