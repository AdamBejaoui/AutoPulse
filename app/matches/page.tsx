"use client";

import * as React from "react";
import { Zap, Bell, Mail, Search } from "lucide-react";
import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { useSearchFilters } from "@/components/SearchFiltersContext";

export default function MatchesPage() {
  const { syncEmail } = useSearchFilters();
  const [matches, setMatches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [emailInput, setEmailInput] = React.useState(syncEmail || "eastcoastlogisticllc@gmail.com");

  const fetchMatches = React.useCallback(async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.listings) {
        setMatches(data.listings);
      }
    } catch (e) {
      console.error("Failed to fetch matches:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const emailToUse = syncEmail || "eastcoastlogisticllc@gmail.com";
    setEmailInput(emailToUse);
    fetchMatches(emailToUse);
  }, [syncEmail, fetchMatches]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.includes("@")) {
      fetchMatches(emailInput);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Zap className="text-primary fill-current" size={28} />
              Recent Matches
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              These are the cars that triggered your email alerts. We save them here so you can browse your history.
            </p>
          </div>

          {syncEmail !== "eastcoastlogisticllc@gmail.com" && (
            <form onSubmit={handleManualSearch} className="flex items-center gap-2">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="Enter your email..."
                  className="h-10 pl-9 pr-4 text-sm bg-surface border border-border rounded-xl focus:border-primary/50 focus:outline-none w-64"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold shadow-blue hover:bg-primary/90 transition-all"
              >
                Check
              </button>
            </form>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl border border-border skeleton" />
            ))}
          </div>
        ) : !emailInput ? (
          <PromptState />
        ) : matches.length === 0 ? (
          <EmptyState email={emailInput} />
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {matches.map(listing => (
              <div key={listing.id} className="relative">
                <div className="absolute -top-3 left-6 z-30 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg flex items-center gap-1">
                  <Bell size={10} />
                  Matched {new Date(listing.matchedAt).toLocaleDateString()}
                </div>
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function PromptState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-border text-center bg-surface/30">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
        <Mail size={28} />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">View your matches</h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        Enter the email address you use for alerts to see all the cars we&apos;ve found for you.
      </p>
    </div>
  );
}

function EmptyState({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-border text-center bg-surface/30">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised text-muted-foreground mb-6">
        <Search size={28} />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">No matches found for {email}</h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        We haven&apos;t found any cars matching your alerts yet. As soon as we do, they&apos;ll show up here!
      </p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-blue hover:bg-primary/90 transition-all"
      >
        Adjust your search filters
      </Link>
    </div>
  );
}
