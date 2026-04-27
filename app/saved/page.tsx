"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ListingCard } from "@/components/ListingCard";
import { Star, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function SavedPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadSaved = async () => {
      const saved = localStorage.getItem("saved_listings");
      if (!saved) {
        setLoading(false);
        return;
      }
      
      const ids = JSON.parse(saved);
      setSavedIds(ids);
      
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/listings?ids=${ids.join(",")}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setListings(data.listings);
      } catch (error) {
        console.error("Error fetching saved listings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();

    // Listen for changes from other tabs/actions
    const handleStorageChange = () => {
      loadSaved();
    };
    window.addEventListener("saved_listings_changed", handleStorageChange);
    return () => window.removeEventListener("saved_listings_changed", handleStorageChange);
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-16">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 animate-fade-up">
          <div>
            <Link href="/search" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
              <ArrowLeft size={14} />
              Back to search
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Star className="text-primary fill-primary/20" size={28} />
              Saved Listings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {savedIds.length} vehicle{savedIds.length !== 1 && "s"} saved in your collection.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-primary">
            <Loader2 size={32} className="animate-spin mb-4" />
            <p className="text-sm font-medium animate-pulse">Retrieving your saved vehicles...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-border bg-surface p-16 text-center animate-fade-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised border border-border text-muted-foreground">
                <Star size={32} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No saved listings</h3>
            <p className="max-w-xs text-xs text-muted-foreground leading-relaxed mb-6">
              Start browsing and star the vehicles you&apos;re interested in to keep track of them here.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-blue hover:bg-primary/90 active:scale-95 transition-all"
            >
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-fade-up">
            {listings.map((listing, i) => (
              <div 
                key={listing.id}
                className="animate-spring-in"
                style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
              >
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
