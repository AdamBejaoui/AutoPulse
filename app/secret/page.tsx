"use client";

import * as React from "react";
import { ShieldAlert, Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ListingCard } from "@/components/ListingCard";

export default function SecretMatchesPage() {
  const { data: session, status } = useSession();
  const email = session?.user?.email ?? "";
  const [matches, setMatches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch(`/api/secret?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.listings) setMatches(data.listings);
      })
      .catch((e) => console.error("Failed to fetch matches:", e))
      .finally(() => setLoading(false));
  }, [email]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-primary" size={28} />
              Secret Alert Matches
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              All database cars that match your active alerts — even if they weren&apos;t emailed to you.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-96 rounded-2xl border border-border skeleton" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <EmptyState email={email} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {matches.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function EmptyState({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-border text-center bg-surface/30">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised text-muted-foreground mb-6">
        <Search size={28} />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">No matching database records</h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        We scanned the database and didn&apos;t find any cars that match your active alerts.
      </p>
      <Link
        href="/alerts"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-blue hover:bg-primary/90 transition-all"
      >
        Manage Alerts
      </Link>
    </div>
  );
}
