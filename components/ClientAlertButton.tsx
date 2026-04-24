"use client";

import { useSearchFilters } from "@/components/SearchFiltersContext";
import { Plus } from "lucide-react";

export function ClientAlertButton() {
  const { setAlertOpen } = useSearchFilters();
  return (
    <button
      onClick={() => setAlertOpen(true)}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-blue hover:bg-primary/90 active:scale-95 transition-all"
    >
      <Plus size={16} />
      <span className="hidden sm:inline">New alert</span>
      <span className="sm:hidden">New</span>
    </button>
  );
}
