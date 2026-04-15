"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  filtersFromSearchParams,
  useSearchFilters,
} from "@/components/SearchFiltersContext";

export function SearchFiltersSync(): null {
  const sp = useSearchParams();
  const { setFilters } = useSearchFilters();

  React.useEffect(() => {
    const raw: Record<string, string | string[] | undefined> = {};
    sp.forEach((value, key) => {
      raw[key] = value;
    });
    setFilters(filtersFromSearchParams(raw));
  }, [sp, setFilters]);

  return null;
}
