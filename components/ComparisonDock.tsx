"use client";

import React, { useState } from "react";
import { useComparison } from "@/context/ComparisonContext";
import { X, ArrowRightLeft, Trash2, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";
import { ComparisonOverlay } from "./ComparisonOverlay";
import { cn } from "@/lib/utils";

export function ComparisonDock() {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const [isOpen, setIsOpen] = useState(false);

  if (comparisonList.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-[100] w-full max-w-4xl -translate-x-1/2 px-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="flex items-center gap-4 rounded-[2.5rem] bg-black/60 dark:bg-black/80 p-2 pl-6 backdrop-blur-3xl ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <div className="flex -space-x-3 overflow-hidden py-1">
            {comparisonList.map((item) => (
              <div 
                key={item.id} 
                className="group relative h-12 w-12 shrink-0 rounded-full border-2 border-background bg-muted ring-2 ring-primary/20 overflow-hidden cursor-pointer"
                onClick={() => removeFromComparison(item.id)}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.make} 
                  className="h-full w-full object-cover transition-transform group-hover:scale-125" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <X size={14} className="text-white" />
                </div>
              </div>
            ))}
          </div>

          <div className="ml-2 flex-1 hidden sm:block">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Comparison Engine</h4>
            <p className="text-[11px] font-bold text-white/60">
              {comparisonList.length} of 4 vehicles selected
            </p>
          </div>

          <div className="flex items-center gap-2 pr-1">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 rounded-full text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                onClick={clearComparison}
            >
              <Trash2 size={18} />
            </Button>
            
            <Button 
              onClick={() => setIsOpen(true)}
              className="h-11 rounded-full bg-cyber-gradient px-6 text-xs font-black text-black shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-2"
            >
              COMPARE NOW <ArrowRightLeft size={16} />
            </Button>
          </div>
        </div>
      </div>

      <ComparisonOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
