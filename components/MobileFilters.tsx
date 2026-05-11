"use client";

import * as React from "react";
import { FilterFields } from "./FilterFields";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  initial: React.ComponentProps<typeof FilterFields>["initial"];
};

export function MobileFilters({ initial }: Props): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 rounded-xl lg:hidden border-border bg-surface hover:bg-surface/80 shadow-sm active:scale-95 transition-all">
          <SlidersHorizontal size={15} className="text-primary" />
          <span className="text-sm font-semibold">Filters</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border border-border rounded-t-[2rem] sm:rounded-2xl p-0 shadow-modal overflow-hidden animate-spring-in bottom-0 sm:bottom-auto translate-y-0 sm:-translate-y-1/2 flex flex-col h-[85vh] sm:h-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground leading-none">
                Refine Search
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-1">
                Customize your results
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => {
              window.location.href = "/search";
            }}
            className="text-[10px] uppercase font-bold text-primary tracking-widest px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <FilterFields initial={initial} onApply={() => setOpen(false)} />
        </div>

        {/* Fixed Footer Action */}
        <div className="px-6 py-4 border-t border-border bg-surface/50 backdrop-blur-md">
          <Button 
            className="w-full h-12 rounded-xl font-bold shadow-blue" 
            onClick={() => setOpen(false)}
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
