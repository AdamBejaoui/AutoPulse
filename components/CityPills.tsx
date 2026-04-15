"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { MARKETPLACE_CITIES } from "@/lib/cities";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";

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
      params.set("city", label);
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    });
  }

  return (
    <div className="relative group/pills">
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 items-center justify-center h-10 w-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-cyber-blue shadow-neon-blue/20">
           {isPending ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
        </div>
        
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-4 -mb-4 scrollbar-none snap-x snap-mandatory">
            {MARKETPLACE_CITIES.map((c) => {
              const isActive = currentCity === c.label;
              const isSearching = isPending && pendingCity === c.label;
              
              return (
                <button
                  key={c.slug}
                  onClick={() => handleCityClick(c.label)}
                  disabled={isPending}
                  className={cn(
                    "shrink-0 rounded-xl border px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all snap-start flex items-center gap-2",
                    isActive
                      ? "bg-foreground text-background border-foreground shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-neon-white"
                      : "bg-black/5 dark:bg-white/5 text-muted-foreground border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground",
                    isPending && !isSearching && "opacity-50 grayscale cursor-not-allowed",
                  )}
                >
                  {isSearching && <Loader2 size={10} className="animate-spin" />}
                  {c.label}
                </button>
              );
            })}
          </div>


          {/* Edge Fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent opacity-100" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent opacity-100" />
        </div>
      </div>
    </div>
  );
}

