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
      params.set("city", label);
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    });
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-6">
        <div className="flex shrink-0 items-center gap-3">
           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Target size={18} />}
           </div>
           <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Capture Zone</span>
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Active US Clusters</span>
           </div>
        </div>
        
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-6 -mb-6 scrollbar-none snap-x">
            {MARKETPLACE_CITIES.map((c) => {
              const isActive = currentCity === c.label;
              const isSearching = isPending && pendingCity === c.label;
              
              return (
                <button
                  key={c.slug}
                  onClick={() => handleCityClick(c.label)}
                  disabled={isPending}
                  className={cn(
                    "shrink-0 rounded-lg border px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all snap-start flex items-center gap-3 active:scale-95",
                    isActive
                      ? "bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                      : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5",
                    isPending && !isSearching && "opacity-30 grayscale cursor-not-allowed",
                  )}
                >
                  {isSearching && <Loader2 size={10} className="animate-spin" />}
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black via-black/20 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black via-black/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}

