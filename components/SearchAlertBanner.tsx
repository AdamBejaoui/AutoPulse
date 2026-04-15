"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useSearchFilters } from "@/components/SearchFiltersContext";

export function SearchAlertBanner(): React.ReactElement {
  const { setAlertOpen } = useSearchFilters();

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-foreground">Want first dibs on new listings?</p>
        <p className="text-sm text-muted-foreground">
          Save this search and we&apos;ll email you when matching cars hit the
          index.
        </p>
      </div>
      <Button
        type="button"
        className="shrink-0 rounded-full"
        onClick={() => setAlertOpen(true)}
      >
        Set Alert
      </Button>
    </div>
  );
}
