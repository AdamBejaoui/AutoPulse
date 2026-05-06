"use client";

import * as React from "react";
import {
  X,
  Gauge,
  MapPin,
  Calendar,
  Fuel,
  Zap,
  Info,
  ExternalLink,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Settings,
  Car,
  Palette,
  Loader2,
  Share2,
  History,
  TrendingUp,
  FileText,
  AlertTriangle,
  Facebook,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatUsd(cents: number): string {
  if (cents === 0) return "Contact seller";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function timeAgo(date: Date | null | undefined): string {
  if (!date) return "Recently listed";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 7) return past.toLocaleDateString();
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "Just now";
}

export function ListingDetailModal({
  listing: initialListing,
  children,
}: {
  listing: any;
  children: React.ReactNode;
}) {
  const [listing, setListing] = React.useState<any>(initialListing);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<"idle" | "syncing" | "busy" | "error">("idle");

  React.useEffect(() => {
    const isFallback =
      !listing.condition ||
      listing.rawDescription?.includes("AutoPulse local capture") ||
      listing.rawDescription?.toLowerCase().includes("connectez-vous") ||
      listing.rawDescription?.toLowerCase().includes("log in to") ||
      listing.description?.toLowerCase().includes("connectez-vous") ||
      (listing.description?.length || 0) < 100;

    if (isFallback && !isRefreshing) {
      let retryTimer: NodeJS.Timeout;
      const triggerSync = async () => {
        setIsRefreshing(true);
        setSyncStatus("syncing");
        try {
          const response = await fetch("/api/listings/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listingId: listing.id, url: listing.listingUrl }),
          });
          if (response.status === 202) { retryTimer = setTimeout(triggerSync, 3000); return; }
          if (response.status === 503) { setSyncStatus("busy"); retryTimer = setTimeout(triggerSync, 10000); return; }
          if (!response.ok) throw new Error(`Status ${response.status}`);
          const data = await response.json();
          if (data?.listing) { setListing(data.listing); setIsRefreshing(false); setSyncStatus("idle"); }
        } catch (err: any) {
          console.log("On-demand sync skipped:", err.message);
          setIsRefreshing(false);
          setSyncStatus("error");
        }
      };
      const initialTimer = setTimeout(triggerSync, 1200);
      return () => { clearTimeout(initialTimer); if (retryTimer) clearTimeout(retryTimer); };
    }
  }, [listing.id, listing.condition, listing.listingUrl, listing.rawDescription, listing.description, isRefreshing]);

  const hasMake = listing.make && listing.make !== "Unknown";
  const hasModel = listing.model && listing.model !== "Unknown";
  const isGeneric = (listing.rawTitle || "").toLowerCase().includes("marketplace listing");

  const title = (hasMake || listing.year > 0)
    ? `${listing.year > 0 ? listing.year + " " : ""}${hasMake ? listing.make : "Vehicle"}${hasModel ? " " + listing.model : ""}`
    : (isGeneric ? "Vehicle Details" : (listing.rawTitle?.trim() || "Vehicle"));

  const loc = [listing.city, listing.state].filter(Boolean).join(", ");
  const mileage = listing.mileage != null ? `${listing.mileage.toLocaleString()} mi` : null;

  const specs = [
    { label: "Condition", value: listing.condition, icon: ShieldCheck },
    { label: "Title", value: listing.titleStatus || null, icon: FileText },
    { label: "Transmission", value: listing.transmission, icon: Settings },
    { label: "Drive type", value: listing.driveType, icon: Car },
    { label: "Fuel", value: listing.fuelType, icon: Fuel },
    { label: "Engine", value: listing.engine, icon: Zap },
    { label: "Body style", value: listing.bodyStyle, icon: Car },
    { label: "Trim", value: listing.trim, icon: CheckCircle2 },
    { label: "VIN", value: listing.vin, icon: ShieldCheck },
    { label: "Color", value: listing.color, icon: Palette },
    { label: "Owners", value: listing.owners ? `${listing.owners} owner${listing.owners > 1 ? "s" : ""}` : null, icon: User },
    { label: "Accidents", value: listing.accidents === false ? "Accident free" : listing.accidents === true ? "Reported" : null, icon: AlertTriangle },
  ].filter((s) => s.value);

  const fbUrl = listing.listingUrl || `https://www.facebook.com/marketplace/item/${listing.externalId}/`;

  const description = (() => {
    const desc = listing.rawDescription || listing.description || "";
    if (desc.toLowerCase().includes("connectez-vous") || desc.toLowerCase().includes("log in to")) {
      return "Seller description is loading — deep scan in progress...";
    }
    return desc
      .split(/--- FULL PAGE SPECS ---|--- SPECS ---/i)[0]
      .replace(/AutoPulse (local capture|v8 captured):\s*/i, "")
      .trim() || "No description available.";
  })();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[100vw] sm:max-w-[960px] h-[100dvh] sm:h-[680px] p-0 overflow-hidden border border-border bg-background shadow-modal flex flex-col sm:flex-row rounded-none sm:rounded-2xl">

        {/* LEFT: Image + CTA */}
        <div className="w-full sm:w-[42%] h-[240px] sm:h-full relative shrink-0 bg-surface overflow-hidden">
          <img
            src={(listing.imageUrls?.length > 0) ? listing.imageUrls[0] : ""}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />

          {/* Source badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-background/80 backdrop-blur-md border border-border rounded-full px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            <span className="text-[10px] font-semibold text-foreground">{listing.source || "Facebook"} Live</span>
          </div>

          {/* Mobile price */}
          <div className="absolute bottom-4 left-5 z-10 sm:hidden">
            <p className="text-2xl font-bold text-foreground drop-shadow-lg">{formatUsd(listing.price)}</p>
          </div>

          {/* Desktop CTA area */}
          <div className="absolute bottom-6 left-6 right-6 z-10 hidden sm:block">
            <p className="text-xs text-muted-foreground mb-1">Listed price</p>
            <p className="text-4xl font-bold text-foreground mb-5">{formatUsd(listing.price)}</p>
            <a
              href={listing.isSold ? "#" : fbUrl}
              target={listing.isSold ? undefined : "_blank"}
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-semibold transition-all",
                listing.isSold 
                  ? "bg-surface-raised text-muted-foreground cursor-not-allowed border border-border" 
                  : "bg-primary text-white shadow-blue hover:bg-primary/90 active:scale-95"
              )}
            >
              {listing.isSold ? <X size={16} /> : <ExternalLink size={16} />}
              {listing.isSold ? "Listing Unavailable" : "View on Facebook"}
            </a>
          </div>
        </div>

        {/* RIGHT: Data panel */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-7">

            {/* Header */}
            <header>
              <div className="flex items-center gap-2 mb-3">
                {isRefreshing && <Loader2 size={13} className="animate-spin text-primary" />}
                <span className="text-xs text-muted-foreground font-medium">Vehicle details</span>
              </div>
              <DialogTitle className="text-xl sm:text-3xl font-bold text-foreground leading-tight mb-4">
                {title}
              </DialogTitle>
              <div className="flex flex-wrap gap-2">
                {loc && (
                  <Chip icon={<MapPin size={11} />}>{loc}</Chip>
                )}
                {mileage && (
                  <Chip icon={<Gauge size={11} />}>{mileage}</Chip>
                )}
                <Chip icon={<Clock size={11} />}>{timeAgo(listing.postedAt)}</Chip>
              </div>
            </header>

            {/* Sold Warning */}
            {listing.isSold && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
                <AlertTriangle className="text-red-500 shrink-0" size={18} />
                <div>
                  <p className="text-sm font-semibold text-red-500 mb-0.5">This vehicle has been sold</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This listing is no longer active on Facebook Marketplace. 
                    Search updated to show current available options.
                  </p>
                </div>
              </div>
            )}

            {/* Market analysis */}
            {listing.analysis && (
              <section>
                <SectionLabel>Market analysis</SectionLabel>
                <div className="rounded-xl bg-surface border border-border p-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Market median</p>
                      <p className="text-2xl font-bold text-foreground tabular-nums">
                        ${(listing.analysis.medianPrice / 100).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deal rating</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        listing.analysis.rating === "great" ? "text-emerald-500" :
                        listing.analysis.rating === "good" ? "text-primary" : "text-muted-foreground"
                      )}>
                        {listing.analysis.rating === "great" ? "🔥 Great" :
                         listing.analysis.rating === "good" ? "✓ Good" : "Fair"}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This listing is{" "}
                      <span className="font-semibold text-foreground">
                        {Math.abs(listing.analysis.diffPercent)}% {listing.analysis.diffAmount > 0 ? "below" : "above"}
                      </span>{" "}
                      the national median — a potential saving of{" "}
                      <span className="font-semibold text-foreground">
                        ${(Math.abs(listing.analysis.diffAmount) / 100).toLocaleString()}
                      </span>.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Specs grid */}
            {specs.length > 0 && (
              <section>
                <SectionLabel>Specifications</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {specs.map((s, idx) => (
                    <div key={idx} className="flex flex-col gap-1 p-3 rounded-lg bg-surface border border-border">
                      <div className="flex items-center gap-1.5">
                        <s.icon size={11} className="text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">{s.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Features */}
            {listing.features?.length > 0 && (
              <section>
                <SectionLabel>Features</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {listing.features.map((feat: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-surface border border-border text-xs text-muted-foreground">
                      {feat}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Description */}
            <section>
              <SectionLabel>Seller description</SectionLabel>
              <div className={cn(
                "rounded-xl bg-surface border border-border p-5 transition-all duration-500",
                isRefreshing && "opacity-40 blur-sm"
              )}>
                <p className={cn(
                  "text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap",
                  !isExpanded && "line-clamp-4"
                )}>
                  {description}
                </p>
                {description.length > 250 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            </section>

          </div>

          {/* Mobile sticky footer */}
          <div className="sm:hidden p-4 border-t border-border bg-background/95 backdrop-blur-xl">
            <a
              href={listing.isSold ? "#" : fbUrl}
              target={listing.isSold ? undefined : "_blank"}
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-semibold transition-all",
                listing.isSold 
                  ? "bg-surface-raised text-muted-foreground cursor-not-allowed border border-border" 
                  : "bg-primary text-white shadow-blue hover:bg-primary/90 active:scale-95"
              )}
            >
              <ExternalLink size={16} />
              {listing.isSold ? "Unavailable" : `View on Facebook — ${formatUsd(listing.price)}`}
            </a>
          </div>

          {/* Desktop footer */}
          <div className="hidden sm:flex items-center justify-between px-8 py-4 border-t border-border bg-surface">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck size={13} />
              <span className="text-xs">Verified by AutoPulse</span>
            </div>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors">
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </h3>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-xs text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}
