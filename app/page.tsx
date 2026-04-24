import * as React from "react";
export const dynamic = 'force-dynamic';
import type { ReactElement } from "react";
import Link from "next/link";
import { StructuredSearchBar } from "@/components/StructuredSearchBar";
import { Search, Bell, Globe, ChevronRight, Zap, ShieldCheck, Activity } from "lucide-react";
import { unstable_cache } from "next/cache";

const getCachedListingCount = unstable_cache(
  async () => {
    const { prisma } = await import("@/lib/db");
    return prisma.listing.count();
  },
  ["listing-count"],
  { revalidate: 300, tags: ["listing-count"] }
);

export default async function HomePage(): Promise<ReactElement> {
  const totalListings = await getCachedListingCount().catch(() => 0);
  return (
    <div className="flex flex-col relative bg-black min-h-screen">
      <div className="absolute inset-0 z-0 bg-mesh-dark pointer-events-none opacity-50" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-40 lg:pb-48">
        <div className="container relative z-10 px-4 sm:px-6 mx-auto">
          <div className="mx-auto max-w-6xl text-center">
            
            <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-white/50 backdrop-blur-3xl shadow-2xl">
               <Activity size={14} className="text-primary animate-pulse" />
               Live Intel: {totalListings.toLocaleString()} Active Nodes
            </div>
            
            <h1 className="font-display text-6xl font-black tracking-tighter sm:text-[140px] lg:text-[180px] drop-shadow-2xl italic uppercase leading-[0.8] mb-12">
               <span className="text-white">FORCE</span> <br />
               <span className="text-white/10">MULTIPLIER</span>
            </h1>
            
            <p className="mx-auto mt-12 max-w-2xl text-sm sm:text-xl font-medium text-white/40 uppercase tracking-[0.2em] leading-relaxed px-4">
              Continuous high-volume data capture across Facebook Marketplace USA. 
              Find arbitrage opportunities with specialized metadata parsing.
            </p>
            
            <div className="mx-auto mt-16 sm:mt-24 max-w-5xl relative z-20 px-4 sm:px-0">
               <div className="relative glass-card border border-white/5 bg-white/[0.01] rounded-[2.5rem] sm:rounded-[4rem] p-1.5 sm:p-3 shadow-[0_50px_100px_rgba(0,0,0,0.8)] transition-all hover:border-white/10">
                  <React.Suspense fallback={<div className="h-[100px] w-full animate-pulse bg-white/5 rounded-full" />}>
                     <StructuredSearchBar />
                  </React.Suspense>
               </div>
            </div>

            <div className="mt-16 flex items-center justify-center gap-8">
               <Link
                 href="/search"
                 className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all"
               >
                 Access Search Terminal
                 <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 group-hover:border-white/20 transition-all">
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                 </div>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="container mx-auto px-4 py-32 sm:px-6 max-w-7xl">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard 
            icon={<Search />}
            title="Sectored Aggregation"
            description="Search across 50+ major US metropolitan areas simultaneously with advanced filtering parameters."
          />
          <FeatureCard 
            icon={<Bell />}
            title="Search Sentinel"
            description="Get notified via encrypted email the moment a vehicle matching your exact criteria enters the index."
          />
          <FeatureCard 
            icon={<ShieldCheck />}
            title="Metadata Integrity"
            description="Our specialized NLP parsers verify condition, title status, and specs before delivery."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string, description: string }) {
  return (
    <article className="group relative flex flex-col rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-10 transition-all hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-1">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black transition-all group-hover:scale-110 group-hover:bg-primary">
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <h2 className="text-xl font-black uppercase tracking-tighter text-white italic">
        {title}
      </h2>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-widest leading-relaxed text-white/30">
        {description}
      </p>
    </article>
  );
}
