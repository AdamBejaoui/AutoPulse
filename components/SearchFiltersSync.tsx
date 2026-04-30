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
    } else if (firstLoad.current) {
      // If URL is empty on first load, check localStorage
      const saved = localStorage.getItem("autopulse_last_filters");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Apply saved filters to URL so they are active
          const params = new URLSearchParams();
          Object.entries(parsed).forEach(([k, v]) => {
            if (v) params.set(k, String(v));
          });
          if (params.toString()) {
            router.replace(`/search?${params.toString()}`, { scroll: false });
          }
        } catch (e) {}
      }
    }
    firstLoad.current = false;
  }, [sp, setFilters, router]);

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
