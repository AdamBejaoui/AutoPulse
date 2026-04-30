"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { ListingCard } from "@/components/ListingCard";
import { SearchX, Loader2 } from "lucide-react";

interface InfiniteListingGridProps {
  initialListings: any[];
  initialTotal: number;
  queryWithoutPage: string;
}

export function InfiniteListingGrid({
  initialListings,
  initialTotal,
  queryWithoutPage,
}: InfiniteListingGridProps): React.ReactElement {
  const [items, setItems] = useState(initialListings);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialListings.length < initialTotal);
  const [loading, setLoading] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset state when query changes
  useEffect(() => {
    setItems(initialListings);
    setPage(1);
    setHasMore(initialListings.length < initialTotal);
  }, [initialListings, initialTotal]);

  const loadMore = React.useCallback(async () => {
    setLoading(true);
    const nextPage = page + 1;
    const url = `/api/listings?page=${nextPage}&${queryWithoutPage}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      setItems((prev) => [...prev, ...data.listings]);
      setPage(nextPage);
      setHasMore(items.length + data.listings.length < data.total);
    } catch (error) {
      console.error("Error loading more listings:", error);
    } finally {
      setLoading(false);
    }
  }, [items.length, page, queryWithoutPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          await loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-border bg-surface p-16 text-center animate-fade-up">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised border border-border text-muted-foreground">
            <SearchX size={32} />
          </div>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">No cars found</h3>
        <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
          Try broadening your search criteria or setting up an alert to be notified when a match arrives.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-up">
      <div className="flex flex-col gap-8 w-full">
        {items.map((listing, i) => (
          <div 
            key={`${listing.id}-${i}`}
            className="w-full animate-spring-in"
            style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
          >
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>

      {/* Sentinel / Loader */}
      <div 
        ref={observerTarget} 
        className="flex items-center justify-center p-8 w-full"
      >
        {loading && (
          <div className="flex items-center gap-2 text-primary font-medium text-sm animate-pulse">
            <Loader2 size={18} className="animate-spin" />
            Loading more vehicles...
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            — You&apos;ve viewed all matching vehicles —
          </p>
        )}
      </div>
    </div>
  );
}
