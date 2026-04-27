"use client";

import * as React from "react";
import { useState, useEffect, memo } from "react";
import Image from "next/image";
import { Gauge, MapPin, Star, ExternalLink, Calendar, CheckCircle2, AlertCircle, Sparkles, User, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseListingText } from "@/lib/parser/listingParser";

function formatUsd(cents: number): string {
  if (cents === 0) return "Contact seller";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function timeAgo(dateInput: string | Date): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const placeholderSvg =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="#111113"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#333" font-family="system-ui" font-weight="700" font-size="14" letter-spacing="0.1em">No image</text>
    </svg>`,
  );

export const ListingCard = memo(function ListingCard({ listing }: { listing: any }): React.ReactElement {
  const [imgOk, setImgOk] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const src = (listing.imageUrls && listing.imageUrls.length > 0) && imgOk ? listing.imageUrls[0] : placeholderSvg;

  const hasMake = listing.make && listing.make !== "Unknown";
  const hasModel = listing.model && listing.model !== "Unknown";

  let displayTitle = listing.rawTitle?.trim() || "Vehicle";
  if (hasMake) {
    const year = listing.year > 0 ? `${listing.year} ` : "";
    const model = hasModel ? ` ${listing.model}` : "";
    displayTitle = `${year}${listing.make}${model}`.trim();
  }

  const loc = [listing.city, listing.state].filter(Boolean).join(", ");
  const mileage = listing.mileage != null
    ? (listing.mileage >= 1000 
        ? `${(listing.mileage / 1000).toFixed(0)}k mi` 
        : `${listing.mileage} mi`)
    : null;

  const dealRating = listing.analysis?.rating;

  // Check if saved on mount
  useEffect(() => {
    const saved = localStorage.getItem("saved_listings");
    if (saved) {
      const ids = JSON.parse(saved);
      setIsSaved(ids.includes(listing.id));
    }
  }, [listing.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = localStorage.getItem("saved_listings");
    let ids = saved ? JSON.parse(saved) : [];
    
    if (isSaved) {
      ids = ids.filter((id: string) => id !== listing.id);
      setIsSaved(false);
    } else {
      ids.push(listing.id);
      setIsSaved(true);
    }
    localStorage.setItem("saved_listings", JSON.stringify(ids));
    // Dispatch event for other components to listen
    window.dispatchEvent(new Event("saved_listings_changed"));
  };

  const parsedFallback = parseListingText(listing.rawTitle || "", listing.description || "");

  const specs = [
    { label: "Drive Type", value: listing.driveType || parsedFallback.driveType },
    { label: "Engine", value: listing.engine || parsedFallback.engine },
    { label: "Fuel", value: listing.fuelType || parsedFallback.fuelType },
  ].filter(s => s.value != null && s.value !== "");

  return (
    <article className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl bg-surface border border-border transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 w-full bg-mesh">
      
      {/* Image Section */}
      <div className="relative md:w-2/5 aspect-[16/10] md:aspect-auto overflow-hidden bg-surface-raised shrink-0">
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <Image
          src={src}
          alt={displayTitle}
          fill
          className={cn(
            "object-cover transition-all duration-500 group-hover:scale-[1.02]",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgOk(false); setImgLoaded(true); }}
          sizes="(max-width: 768px) 100vw, 40vw"
        />

        {/* Sold overlay */}
        {listing.isSold && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[4px]">
            <span className="px-5 py-2 rounded-xl bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl border border-white/20 scale-110">
              Vehicle Sold
            </span>
          </div>
        )}

        {/* Deal badge */}
        {dealRating && dealRating !== "unknown" && !listing.isSold && (
          <div className="absolute top-4 left-4 z-10">
            <span className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-md",
              dealRating === "great"
                ? "bg-emerald-500/90 text-white"
                : "bg-surface/90 border border-border text-muted-foreground"
            )}>
              {dealRating === "great" ? <Sparkles size={12} className="fill-current" /> : null}
              {dealRating === "great" ? "Great Deal" : "Good Deal"}
            </span>
          </div>
        )}



        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="inline-block bg-background/90 backdrop-blur-md border border-border px-4 py-1.5 rounded-xl text-lg font-black text-foreground shadow-lg">
            {formatUsd(listing.price)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-6 md:p-8 relative">
        
        {/* Star Button (Top Right of Card) */}
        <button
          onClick={toggleSave}
          className={cn(
            "absolute top-6 right-6 z-20 h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-md transition-all duration-200",
            isSaved
              ? "bg-primary/90 border-primary text-white"
              : "bg-background/80 border-border text-muted-foreground hover:border-primary hover:text-primary"
          )}
          title={isSaved ? "Saved" : "Save Listing"}
        >
          <Star size={18} className={cn(isSaved && "fill-current")} />
        </button>
        
        {/* Header */}
        <div className="flex flex-col mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5 flex-wrap">
            {listing.postedAt && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {timeAgo(listing.postedAt)}
              </span>
            )}
            {loc && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {loc}
              </span>
            )}
            {mileage && (
              <span className="flex items-center gap-1">
                <Gauge size={12} />
                {mileage}
              </span>
            )}
            {listing.sellerName && (
              <span className="flex items-center gap-1">
                <User size={12} />
                {listing.sellerName}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors flex-1">
            {displayTitle}
            {listing.trim && <span className="text-primary font-medium text-base ml-2">({listing.trim})</span>}
          </h2>
        </div>

        {/* Specs Grid */}
        {specs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mb-6 p-4 rounded-xl bg-surface-raised/50 border border-border/50">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0 sm:[&:nth-last-child(-n+3)]:border-0">
                <span className="text-muted-foreground">{spec.label}</span>
                <span className={cn(
                  "font-semibold text-foreground",
                  spec.label === "Accidents" && spec.value === "Yes" && "text-destructive"
                )}>
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        )}



        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {listing.transmission && (
              <Tag>{listing.transmission}</Tag>
            )}
            {listing.bodyStyle && (
              <Tag>{listing.bodyStyle}</Tag>
            )}
          </div>

          <a
            href={listing.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-blue hover:bg-primary/90 active:scale-95 transition-all"
          >
            <ExternalLink size={14} />
            View on Facebook
          </a>
        </div>

      </div>
    </article>
  );
});

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
      {children}
    </span>
  );
}
