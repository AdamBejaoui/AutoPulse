"use client";

import { ListingCard } from "@/components/ListingCard";
import { Archive, SearchX, Activity } from "lucide-react";

export function ListingGrid({
  listings,
}: {
  listings: any[];
}): React.ReactElement {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[3rem] border border-white/[0.05] bg-white/[0.02] p-24 text-center backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-700">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 border border-white/10 text-white/20">
                <SearchX size={48} />
            </div>
        </div>
        <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white mb-4 italic">No Targets Found</h3>
        <p className="max-w-xs text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 leading-relaxed">
            The current parameters returned zero matches from the live index. Broaden the mission parameters or re-initialize the scan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {listings.map((listing, i) => (
        <div 
            key={listing.id} 
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
            style={{ animationDelay: `${i * 50}ms` }}
        >
            <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
}
