"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { id: "newest", label: "Recently Added" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "year_desc", label: "Year: Newest First" },
  { id: "year_asc", label: "Year: Oldest First" },
] as const;

export function SearchSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (id === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", id);
    }
    params.delete("page"); 
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden sm:block">
        Sort:
      </span>
      <div className="relative group">
        <select
          value={currentSort}
          onChange={handleSort}
          className={cn(
            "appearance-none h-10 pl-4 pr-10 rounded-xl border-black/10 dark:border-white/10 glass",
            "text-sm font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5",
            "bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id} className="bg-background text-foreground">
              {option.label}
            </option>
          ))}
        </select>
        <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}
