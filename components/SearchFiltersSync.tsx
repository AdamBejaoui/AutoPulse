"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  filtersFromSearchParams,
  useSearchFilters,
} from "@/components/SearchFiltersContext";

export function SearchFiltersSync(): null {
  const sp = useSearchParams();
  const { filters, setFilters } = useSearchFilters();
  const router = require("next/navigation").useRouter();
  const firstLoad = React.useRef(true);

  // Sync FROM URL to Context
  React.useEffect(() => {
    const raw: Record<string, string | string[] | undefined> = {};
    let count = 0;
    sp.forEach((value, key) => {
      raw[key] = value;
      count++;
    });

    if (count > 0) {
      setFilters(filtersFromSearchParams(raw));
    } else {
      // URL is empty. Should we apply what's in context/localStorage?
      const saved = localStorage.getItem("autopulse_last_filters");
      const filtersToApply = firstLoad.current && saved ? JSON.parse(saved) : filters;
      
      const hasValues = Object.values(filtersToApply).some(v => v !== "");
      if (hasValues) {
        const params = new URLSearchParams();
        Object.entries(filtersToApply).forEach(([k, v]) => {
          if (v) params.set(k, String(v));
        });
        if (params.toString()) {
          router.replace(`/search?${params.toString()}`, { scroll: false });
        }
      }
    }
    firstLoad.current = false;
  }, [sp, setFilters, router, filters]);

  // Sync FROM Context to LocalStorage
  React.useEffect(() => {
    // Only save if there's actually something to save
    const hasValues = Object.values(filters).some(v => v !== "");
    if (hasValues) {
      localStorage.setItem("autopulse_last_filters", JSON.stringify(filters));
    }
  }, [filters]);

  return null;
}
