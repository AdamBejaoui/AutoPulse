"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MARKETPLACE_CITIES } from "@/lib/cities";
import { cn } from "@/lib/utils";
import { MapPin, Loader2, Target } from "lucide-react";

export function CityPills(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCity = searchParams.get("city") ?? "";
  const [isPending, startTransition] = React.useTransition();
  const [pendingCity, setPendingCity] = React.useState<string | null>(null);

  function handleCityClick(label: string) {
    setPendingCity(label);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (currentCity === label) {
        params.delete("city");
      } else {
        params.set("city", label);
      }
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center gap-4">

      {/* Label */}
      <div className="hidden sm:flex shrink-0 items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground leading-none">Capture Zone</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Active US Clusters</span>
        </div>
      </div>

      {/* Scrollable pills */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
          {MARKETPLACE_CITIES.map((c) => {
            const isActive = currentCity === c.label;
            const isSearching = isPending && pendingCity === c.label;

            return (
              <button
                key={c.slug}
                onClick={() => handleCityClick(c.label)}
                disabled={isPending}
                className={cn(
                  "shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
                  isActive
                    ? "bg-primary text-white border-primary shadow-blue"
                    : "bg-surface border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-surface-raised",
                  isPending && !isSearching && "opacity-40 cursor-not-allowed"
                )}
              >
                {isSearching && <Loader2 size={10} className="animate-spin" />}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}
