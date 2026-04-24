"use client";

import * as React from "react";
import { SearchFiltersSync } from "@/components/SearchFiltersSync";
import { CityPills } from "@/components/CityPills";
import { SearchAlertBanner } from "@/components/SearchAlertBanner";
import { FilterSidebar } from "@/components/FilterSidebar";
import { MobileFilters } from "@/components/MobileFilters";
import { SearchSort } from "@/components/SearchSort";
import { ListFilter, LayoutGrid, Activity, ShieldCheck, Zap } from "lucide-react";

export function SearchLayout({
  total,
  sidebarInitial,
  children,
}: {
  total: number;
  sidebarInitial: any;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen bg-background bg-mesh-dark pt-20 pb-20 sm:pt-32">
      <SearchFiltersSync />
      
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        
        {/* CONCIERGE HUD HEADER */}
        <div className="relative mb-12 overflow-hidden rounded-[2.5rem] sm:rounded-[4rem] border border-foreground/[0.05] bg-foreground/[0.02] p-8 sm:p-16 backdrop-blur-3xl shadow-2xl">
           <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-foreground/[0.03] blur-[120px]" />
           
           <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between relative z-10">
              <div className="max-w-3xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/5 bg-foreground/5 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                   <div className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                   High-Volume Data Capture Active
                </div>
                <h1 className="font-display text-5xl font-black leading-[0.9] tracking-tighter text-foreground sm:text-8xl md:text-9xl italic uppercase">
                  Target <br className="hidden sm:block" />
                  <span className="text-muted-foreground">Inventory</span>
                </h1>
                <p className="mt-8 text-sm sm:text-lg font-medium text-muted-foreground max-w-xl leading-relaxed uppercase tracking-widest">
                   Currently analyzing <span className="text-foreground font-black">{total.toLocaleString()}</span> live vehicle records across US sectors. Intelligence filters engaged.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between rounded-3xl bg-foreground/[0.03] p-1.5 border border-foreground/5">
                    <SearchSort />
                    <div className="lg:hidden ml-2">
                       <MobileFilters initial={sidebarInitial} />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Components Area */}
        <div className="mb-12 flex flex-col gap-6">
          <CityPills />
        </div>

        {/* Main Operating Terminal */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          
          {/* CONTROL SIDEBAR */}
          <aside className="hidden lg:block w-[340px] sticky top-32">
             <div className="group relative overflow-hidden rounded-[3rem] border border-foreground/5 bg-foreground/[0.02] p-10 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-foreground/10">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-foreground">
                   <ListFilter size={120} />
                </div>
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
                      <ListFilter size={20} />
                   </div>
                   <h2 className="text-xs font-black uppercase tracking-[0.4em] text-foreground">Manual Parameters</h2>
                </div>
                
                <FilterSidebar initial={sidebarInitial} />
             </div>
             
             {/* Alert Integration Widget */}
             <div className="mt-6">
                <SearchAlertBanner />
             </div>
          </aside>

          {/* INTELLIGENCE FEEDArea */}
          <div className="min-w-0 flex-1">
             <div className="flex items-center gap-4 mb-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground">
                   <Activity size={20} />
                </div>
                <div className="flex flex-col">
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-foreground">Live Intelligence Feed</h3>
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time Nationwide Capture</span>
                </div>
                <div className="h-px flex-1 bg-foreground/5" />
             </div>
             
             {children}
          </div>

        </div>
      </div>
    </div>
  );
}
