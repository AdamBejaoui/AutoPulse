"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SEARCH_KEYS = [
  "keywords",
  "make",
  "model",
  "yearMin",
  "yearMax",
  "priceMin",
  "priceMax",
  "mileageMax",
  "city",
  "trim",
  "bodyStyle",
  "driveType",
  "transmission",
  "fuelType",
  "color",
  "titleStatus",
  "maxOwners",
  "noAccidents",
  "features",
] as const;

export function SmartSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [detectedFilters, setDetectedFilters] = useState<Record<string, any>>({});
  const [isParsing, setIsParsing] = useState(false);

  // Debounced parsing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 3) {
        setDetectedFilters({});
        return;
      }

      setIsParsing(true);
      try {
        const res = await fetch(`/api/search/parse?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.filters) {
          setDetectedFilters(data.filters);
        }
      } catch (e) {
        console.error("NL Parse failed", e);
      } finally {
        setIsParsing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    for (const k of SEARCH_KEYS) {
      params.delete(k);
    }
    params.delete("page");

    const hasDetectedFilters = Object.keys(detectedFilters).length > 0;
    if (hasDetectedFilters) {
      Object.entries(detectedFilters).forEach(([key, value]) => {
        params.set(key, String(value));
      });
    } else if (query.trim().length > 0) {
      params.set("keywords", query.trim());
    }

    router.push(`/search?${params.toString()}`);
    setQuery("");
    setDetectedFilters({});
  }, [detectedFilters, query, router, searchParams]);

  const removeFilter = (key: string) => {
    const next = { ...detectedFilters };
    delete next[key];
    setDetectedFilters(next);
  };

  const hasFilters = Object.keys(detectedFilters).length > 0;
  const prettyKey = (key: string): string =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
        </div>
        
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'white automatic civic under 20k'..."
          className="pl-12 pr-12 py-7 text-lg rounded-2xl border-primary/20 bg-primary/5 focus:bg-background focus:ring-primary/20 transition-all shadow-lg"
        />

        <div className="absolute inset-y-0 right-4 flex items-center">
          {isParsing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
          ) : (
            <Sparkles className={cn(
              "h-5 w-5 transition-colors",
              query ? "text-primary animate-pulse" : "text-muted-foreground/30"
            )} />
          )}
        </div>
      </form>

      {hasFilters && (
        <div className="flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Detected:</span>
          {Object.entries(detectedFilters).map(([key, value]) => (
            <Badge 
              key={key} 
              variant="secondary" 
              className="pl-3 pr-1 py-1 gap-1 text-xs font-medium bg-primary/10 text-primary border-primary/20 rounded-lg hover:bg-primary/20"
            >
              <span className="opacity-60">{prettyKey(key)}:</span>
              <span>{String(value)}</span>
              <button 
                onClick={() => removeFilter(key)}
                className="ml-1 p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs font-bold hover:text-primary"
            onClick={handleSearch}
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
}
