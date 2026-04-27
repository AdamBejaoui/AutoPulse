"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchFiltersSync } from "@/components/SearchFiltersSync";
import { CityPills } from "@/components/CityPills";
import { SearchAlertBanner } from "@/components/SearchAlertBanner";
import { FilterSidebar } from "@/components/FilterSidebar";
import { MobileFilters } from "@/components/MobileFilters";
import { SearchSort } from "@/components/SearchSort";
import { ActiveFilters } from "@/components/ActiveFilters";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchLayout({
  total,
  sidebarInitial,
  children,
}: {
  total: number;
  sidebarInitial: any;
  children: React.ReactNode;
}): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <SearchFiltersSync />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Find Cars
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total.toLocaleString()} listings nationwide
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <SearchSort />
            {/* Mobile filter button */}
            <div className="lg:hidden">
              <MobileFilters initial={sidebarInitial} />
            </div>
          </div>
        </div>

        {/* City Pills */}
        <div className="mb-6">
          <CityPills />
        </div>

        {/* Main layout */}
        <div className="flex gap-8 items-start">

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
            <div className="rounded-xl bg-surface border border-border overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal size={16} className="text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Filters</h2>
                </div>
                <button
                  onClick={() => router.push("/search")}
                  className={cn(
                    "text-[10px] uppercase tracking-wider font-bold transition-all px-2 py-0.5 rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10",
                    hasFilters ? "text-primary opacity-100" : "text-muted-foreground/30 opacity-0 pointer-events-none"
                  )}
                >
                  Clear all
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar initial={sidebarInitial} />
              </div>
            </div>

            <div className="mt-4">
              <SearchAlertBanner />
            </div>
          </aside>

          {/* Results grid */}
          <div className="flex-1 min-w-0">
            <ActiveFilters />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
