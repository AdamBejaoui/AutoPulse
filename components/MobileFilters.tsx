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
        <Button variant="outline" className="flex items-center gap-2 rounded-xl lg:hidden">
          <SlidersHorizontal size={16} />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-t-3xl sm:rounded-3xl glass shadow-2xl border-black/10 dark:border-white/10">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold font-display">Refine Search</DialogTitle>
            <DialogDescription className="sr-only">
               Adjust vehicle filters to refine your search results.
            </DialogDescription>
          </div>
          <button
            onClick={() => {
              window.location.href = "/search";
            }}
            className="text-[10px] uppercase font-bold text-primary tracking-widest"
          >
            Clear all filters
          </button>
        </DialogHeader>
        <div className="mt-4 max-h-[70vh] overflow-y-auto px-1">
          <FilterFields initial={initial} onApply={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
