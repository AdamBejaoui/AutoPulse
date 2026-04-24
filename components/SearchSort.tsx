"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
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
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const currentSortId = searchParams.get("sort") || "newest";
  const currentLabel = SORT_OPTIONS.find(o => o.id === currentSortId)?.label || "Sort";

  const handleSort = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", id);
    }
    params.delete("page"); 
    router.push(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  // Close on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 px-4 rounded-xl border border-border bg-surface flex items-center gap-2.5 transition-all outline-none",
          "hover:border-primary/40 hover:bg-surface-raised",
          isOpen && "border-primary ring-2 ring-primary/10 bg-surface-raised"
        )}
      >
        <ArrowUpDown size={14} className={cn("text-muted-foreground transition-colors", isOpen && "text-primary")} />
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
          {currentLabel}
        </span>
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-[100] min-w-[200px] p-1.5 rounded-xl bg-background border border-border shadow-modal animate-in fade-in zoom-in-95 duration-150">
          {SORT_OPTIONS.map((option) => {
            const isActive = option.id === currentSortId;
            return (
              <button
                key={option.id}
                onClick={() => handleSort(option.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-primary/5 text-primary font-semibold" 
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                {option.label}
                {isActive && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
