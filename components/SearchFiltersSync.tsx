"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  filtersFromSearchParams,
  useSearchFilters,
} from "@/components/SearchFiltersContext";

export function SearchFiltersSync(): null {
  const sp = useSearchParams();
  const { filters, setFilters, saveToCloud, syncEmail } = useSearchFilters();
  const router = require("next/navigation").useRouter();
  const firstLoad = React.useRef(true);

  // 1. Sync FROM URL to Context
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
      // ONLY on initial mount/page load: if URL is empty, try to restore from localStorage
      const saved = localStorage.getItem("autopulse_last_filters");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const hasValues = Object.values(parsed).some(v => v !== "");
          if (hasValues) {
            const params = new URLSearchParams();
            Object.entries(parsed).forEach(([k, v]) => {
              if (v) params.set(k, String(v));
            });
            if (params.toString()) {
              router.replace(`/search?${params.toString()}`, { scroll: false });
            }
          }
        } catch (e) {}
      }
    }
    firstLoad.current = false;
  }, [sp, setFilters, router]);

  // 2. Sync FROM Context to LocalStorage & Cloud
  React.useEffect(() => {
    localStorage.setItem("autopulse_last_filters", JSON.stringify(filters));
    
    // Auto-sync to cloud for the default shared account to keep everyone in sync
    if (syncEmail === "eastcoastlogisticllc@gmail.com") {
      // We wrap in a small timeout to avoid double-syncing on mount
      const timer = setTimeout(() => {
        saveToCloud(syncEmail, filters);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filters, syncEmail, saveToCloud]);

  return null;
}
