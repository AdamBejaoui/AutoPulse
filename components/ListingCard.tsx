"use client";

import * as React from "react";
import { useState, memo } from "react";
import Image from "next/image";
import { Gauge, MapPin, Sparkles, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Listing } from "@prisma/client";
import { ListingDetailModal } from "./ListingDetailModal";
import { useComparison } from "@/context/ComparisonContext";
import { ArrowRightLeft, Check } from "lucide-react";

function formatUsd(cents: number): string {
  if (cents === 0) return "FREE";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}


const placeholderSvg =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0A0C0F;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16191D;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g)"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#00D8FF" opacity="0.3" font-family="system-ui" font-weight="900" font-size="40" letter-spacing="0.2em">AUTOPULSE</text>
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#888" opacity="0.5" font-family="system-ui" font-weight="500" font-size="14" letter-spacing="0.1em">VISUAL CAPTURE PENDING</text>
    </svg>`,
  );

export const ListingCard = memo(function ListingCard({ listing }: { listing: any }): React.ReactElement {
  const [imgOk, setImgOk] = useState(true);
  const src = listing.imageUrl && imgOk ? listing.imageUrl : placeholderSvg;

  const hasParsedMake = listing.make !== "Unknown";
  const hasParsedModel = listing.model !== "Unknown";

  const fallbackTitle =
    (listing.rawTitle && listing.rawTitle.trim().length > 0
      ? listing.rawTitle.trim()
      : "Marketplace Listing");

  let title = fallbackTitle;
  if (hasParsedMake) {
    const yearPrefix = listing.year > 0 ? `${listing.year} · ` : "";
    const modelSuffix = hasParsedModel ? ` · ${listing.model}` : "";
    title = `${yearPrefix}${listing.make}${modelSuffix}`;
  }

  const loc = [listing.city, listing.state].filter(Boolean).join(", ");
  const mileage = listing.mileage != null
    ? `${(listing.mileage / 1000).toFixed(1)}k mi`
    : "N/A";

  return (
    <ListingDetailModal listing={listing}>
      <article className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-card/60 backdrop-blur-3xl ring-1 ring-black/10 dark:ring-white/10 transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,216,255,0.15)] hover:-translate-y-2 hover:ring-cyber-blue/30 cursor-pointer active:scale-[0.98]">
        
        {/* Visual Header */}
        <div className="relative aspect-[16/10] w-full overflow-hidden shrink-0">
          <Image
            src={src}
            alt={title}
            fill
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.15]"
            onError={() => setImgOk(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* DEAL Intel Overlay */}
          {listing.analysis && listing.analysis.rating !== 'unknown' && (
            <div className="absolute left-4 top-4 z-20">
              <div className={cn(
                "flex h-7 items-center justify-center rounded-lg px-3 text-[10px] font-black tracking-widest shadow-lg backdrop-blur-md border uppercase italic",
                listing.analysis.rating === 'great' ? "bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/20" :
                listing.analysis.rating === 'good' ? "bg-cyber-blue/90 text-black border-cyan-400 shadow-cyan-500/20" :
                "bg-orange-500/80 text-white border-orange-400"
              )}>
                {listing.analysis.rating === 'great' ? "🔥 GREAT DEAL" : 
                 listing.analysis.rating === 'good' ? "✨ GOOD VALUE" : "FAIR PRICE"}
                {listing.analysis.diffAmount > 50000 && (
                  <span className="ml-2 border-l border-white/20 pl-2">
                    SAVE ${(listing.analysis.diffAmount / 100).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90 transition-opacity group-hover:opacity-60" />
          
          {/* Top Right NEW Tag */}
          <div className="absolute right-4 top-4">
             <div className="flex h-6 items-center justify-center rounded-full bg-cyber-blue px-3 text-[10px] font-black tracking-widest text-background shadow-[0_0_15px_rgba(0,216,255,0.6)] animate-pulse">
                NEW
             </div>
          </div>

          {/* Floating Badges Bottom Left (Over Image) */}
          <div className="absolute left-4 bottom-4 flex flex-col gap-2">
            <span className="inline-flex w-fit items-center rounded-full bg-black/40 dark:bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
              <MapPin size={12} className="mr-1.5 text-cyber-blue" />
              {loc || "USA"}
            </span>
            <span className="inline-flex w-fit items-center rounded-full bg-black/40 dark:bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
              <Gauge size={12} className="mr-1.5 text-cyber-blue" />
              {mileage}
            </span>

            {listing.color && (
              <span className="inline-flex w-fit items-center rounded-full bg-black/40 dark:bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                <div className={cn("mr-1.5 h-2 w-2 rounded-full", `bg-${listing.color.toLowerCase()}-500`)} style={{ backgroundColor: listing.color.toLowerCase() }} />
                {listing.color}
              </span>
            )}
            
            {listing.titleStatus && listing.titleStatus !== 'clean' && (
              <span className="inline-flex w-fit items-center rounded-full bg-red-500/20 backdrop-blur-xl border border-red-500/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 shadow-lg">
                ⚠️ {listing.titleStatus}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ComparisonToggle listing={listing} />
            <ButtonIcon icon={PlusCircle} />
          </div>
        </div>

        {/* Content Body */}
        <div className="relative z-10 flex flex-1 flex-col px-6 pb-6 pt-5 bg-gradient-to-b from-background/50 to-background">
          <div className="mb-3">
            <h2 className="line-clamp-2 font-display text-xl font-black leading-tight tracking-tight text-foreground group-hover:text-cyber-blue transition-colors duration-300 drop-shadow-md">
              {title}
            </h2>
            
            {/* Short Description Snippet */}
            {listing.description && (
              <p className="mt-1 line-clamp-2 text-[11px] font-medium text-muted-foreground/80 leading-relaxed">
                {listing.description.replace(/AutoPulse local capture:\s*/, "")}
              </p>
            )}

            {listing.trim && (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                 {listing.trim}
              </p>
            )}
          </div>

          <div className="mt-auto pt-4 flex items-end justify-between border-t border-black/5 dark:border-white/5">
            <div className="flex flex-col">
              <p className="text-3xl font-black tracking-tighter text-cyber-blue drop-shadow-[0_0_10px_rgba(0,216,255,0.3)] leading-none">
                {formatUsd(listing.price)}
              </p>
              {listing.condition && (
                <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-primary opacity-80">
                  {listing.condition}
                </span>
              )}
            </div>
            {listing.transmission && (
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-cyber-blue transition-colors">
                {listing.transmission}
              </span>
            )}
          </div>
        </div>

        {/* Shimmer Effect on Hover */}
        <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-[150%]" />
      </article>
    </ListingDetailModal>
  );
});

function ButtonIcon({ icon: Icon }: { icon: any }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyber-gradient p-[1px] shadow-neon-blue">
       <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
          <Icon size={18} className="text-foreground" />
       </div>
    </div>
  );
}

function ComparisonToggle({ listing }: { listing: any }) {
  const { addToComparison, removeFromComparison, isInComparison, comparisonList } = useComparison();
  const active = isInComparison(listing.id);
  const isFull = comparisonList.length >= 4 && !active;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (active) {
      removeFromComparison(listing.id);
    } else if (!isFull) {
      addToComparison(listing);
    }
  };

  return (
    <button 
      onClick={toggle}
      disabled={isFull}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 border-2",
        active 
          ? "bg-cyber-blue border-white shadow-[0_0_20px_rgba(0,216,255,0.6)] animate-pulse" 
          : "bg-black/60 backdrop-blur-md border-white/20 hover:border-cyber-blue hover:text-cyber-blue text-white",
        isFull && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      {active ? <Check size={18} className="text-black" /> : <ArrowRightLeft size={18} />}
    </button>
  );
}
