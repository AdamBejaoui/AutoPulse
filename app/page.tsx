import * as React from "react";
export const dynamic = 'force-dynamic';
import type { ReactElement } from "react";
import Link from "next/link";
import { StructuredSearchBar } from "@/components/StructuredSearchBar";
import { Search, Bell, ShieldCheck, Activity, ArrowRight } from "lucide-react";
import { unstable_cache } from "next/cache";

const getCachedListingCount = unstable_cache(
  async () => {
    const { prisma } = await import("@/lib/db");
    return prisma.listing.count({ where: { isCar: true, isJunk: false } });
  },
  ["listing-count"],
  { revalidate: 300, tags: ["listing-count"] }
);

export default async function HomePage(): Promise<ReactElement> {
  const totalListings = await getCachedListingCount().catch(() => 0);

  return (
    <div className="relative min-h-screen bg-background">
      
      {/* Subtle gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 pt-24 pb-16 sm:pt-36 sm:pb-28 px-4">
        <div className="mx-auto max-w-4xl text-center">

          {/* Eyebrow */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
            {totalListings.toLocaleString()} live listings nationwide
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-delay font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-5">
            Find your next car,{" "}
            <span className="text-primary">faster.</span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-up-delay-2 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            We continuously monitor Facebook Marketplace across the entire USA — so you don&apos;t have to.
            Set alerts and we&apos;ll notify you instantly.
          </p>

          {/* Search Bar — relative+z-50 so dropdowns float above feature cards */}
          <div className="animate-fade-up-delay-2 max-w-3xl mx-auto relative z-50">
            <React.Suspense
              fallback={
                <div className="h-16 rounded-2xl bg-surface border border-border animate-pulse" />
              }
            >
              <StructuredSearchBar />
            </React.Suspense>
          </div>

          {/* Sublinks */}
          <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
            <Link
              href="/search"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse all listings
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/alerts"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              My alerts
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID — z-0 keeps it below the search dropdowns */}
      <section className="relative z-0 px-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Search size={20} />}
              title="Nationwide search"
              description="Search 50+ major US metro areas simultaneously with powerful filters."
            />
            <FeatureCard
              icon={<Bell size={20} />}
              title="Instant alerts"
              description="Get emailed the second a matching vehicle enters our database."
            />
            <FeatureCard
              icon={<ShieldCheck size={20} />}
              title="Smart filtering"
              description="Our parser verifies condition, title status, and specs automatically."
            />
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group flex flex-col gap-3 p-5 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
