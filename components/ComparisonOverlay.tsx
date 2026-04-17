"use client";

import React from "react";
import { useComparison } from "@/context/ComparisonContext";
import { X, Check, ArrowRight, Gauge, MapPin, Zap, Info, ShieldCheck, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function ComparisonOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { comparisonList, removeFromComparison } = useComparison();

  if (!isOpen) return null;

  const specs = [
    { label: "Price", key: "price", icon: DollarSign, format: (v: number) => `$${(v / 100).toLocaleString()}` },
    { label: "Mileage", key: "mileage", icon: Gauge, format: (v: number) => v != null ? `${v.toLocaleString()} mi` : "N/A" },
    { label: "Year", key: "year", icon: Check, format: (v: number) => v || "N/A" },
    { label: "City", key: "city", icon: MapPin, format: (v: string) => v || "USA" },
    { label: "Transmission", key: "transmission", icon: Zap, format: (v: string) => v || "N/A" },
    { label: "Title", key: "titleStatus", icon: ShieldCheck, format: (v: string) => v || "Clean" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="relative h-full w-full max-w-7xl overflow-hidden bg-background/80 shadow-2xl ring-1 ring-white/10 sm:h-[90vh] sm:rounded-[3rem] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-foreground italic uppercase">Battle Station</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Side-by-side comparison matrix</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-white/10" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 overflow-x-auto p-8 custom-scrollbar">
          <div className="min-w-[800px] grid grid-cols-4 gap-6 h-full">
            {comparisonList.map((item) => (
              <div key={item.id} className="flex flex-col gap-6 group">
                
                {/* Visual Header */}
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-lg transition-all group-hover:shadow-cyan-500/10">
                   <img src={item.imageUrl} alt={item.make} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                   <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-black text-white leading-tight truncate">
                         {item.year} {item.make} {item.model}
                      </h3>
                      <p className="text-[10px] font-bold text-cyber-blue uppercase tracking-widest mt-0.5">{item.city}, {item.state}</p>
                   </div>
                   <button 
                     onClick={() => removeFromComparison(item.id)}
                     className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition-colors"
                   >
                     <X size={14} />
                   </button>
                </div>

                {/* Spec Slots */}
                <div className="flex flex-col gap-4">
                  {specs.map((spec) => (
                    <div key={spec.key} className="flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-2 text-muted-foreground">
                          <spec.icon size={12} className="text-primary" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{spec.label}</span>
                       </div>
                       <div className={cn(
                         "text-sm font-bold truncate",
                         spec.key === 'price' ? "text-cyber-blue text-lg" : "text-foreground"
                        )}>
                         {(spec.format as any)(item[spec.key])}
                       </div>
                    </div>
                  ))}
                </div>

                {/* Final Action */}
                <Button asChild className="mt-auto h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyber-blue hover:text-black transition-all font-black text-xs tracking-widest group">
                   <a href={item.listingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      OPEN LISTING <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                   </a>
                </Button>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: 4 - comparisonList.length }).map((_, i) => (
               <div key={`empty-${i}`} className="rounded-[2.5rem] border-2 border-dashed border-white/5 bg-white/[0.02] flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-white/10">
                     <PlusCircleIcon size={32} />
                  </div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Slot {comparisonList.length + i + 1} Open</p>
               </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">AutoPulse Comparison Battle Simulation Engine</p>
        </div>
      </div>
    </div>
  );
}

function PlusCircleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
