"use client";

import * as React from "react";

export type SearchFilterValues = {
  keywords: string;
  make: string;
  model: string;
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  mileageMin: string;
  mileageMax: string;
  city: string;
  // NEW Fields
  trim: string;
  bodyStyle: string;
  driveType: string;
  transmission: string;
  fuelType: string;
  color: string;
  titleStatus: string;
  maxOwners: string;
  noAccidents: string;
};

const emptyFilters: SearchFilterValues = {
  keywords: "",
  make: "",
  model: "",
  yearMin: "",
  yearMax: "",
  priceMin: "",
  priceMax: "",
  mileageMin: "",
  mileageMax: "",
  city: "",
  trim: "",
  bodyStyle: "",
  driveType: "",
  transmission: "",
  fuelType: "",
  color: "",
  titleStatus: "",
  maxOwners: "",
  noAccidents: "",
};

type SearchFiltersContextValue = {
  filters: SearchFilterValues;
  setFilters: (f: SearchFilterValues) => void;
  syncEmail: string;
  setSyncEmail: (e: string) => void;
  isSyncing: boolean;
  saveToCloud: (email: string, filters: SearchFilterValues) => Promise<void>;
  loadFromCloud: (email: string) => Promise<SearchFilterValues | null>;
  alertOpen: boolean;
  setAlertOpen: (open: boolean) => void;
};

const SearchFiltersContext = React.createContext<
  SearchFiltersContextValue | undefined
>(undefined);

export function SearchFiltersProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [filters, setFilters] = React.useState<SearchFilterValues>(emptyFilters);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [syncEmail, setSyncEmail] = React.useState("");
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Persistence logic
  const saveToCloud = async (email: string, f: SearchFilterValues) => {
    if (!email) return;
    setIsSyncing(true);
    try {
      await fetch("/api/preferences", {
        method: "POST",
        body: JSON.stringify({ email, filters: f }),
      });
      setSyncEmail(email);
      localStorage.setItem("autopulse_sync_email", email);
    } catch (e) {
      console.error("Cloud save failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFromCloud = async (email: string): Promise<SearchFilterValues | null> => {
    if (!email) return null;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/preferences?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.filters) {
        setSyncEmail(email);
        localStorage.setItem("autopulse_sync_email", email);
        return data.filters;
      }
    } catch (e) {
      console.error("Cloud load failed", e);
    } finally {
      setIsSyncing(false);
    }
    return null;
  };

  // Load email from localStorage on mount and sync if needed
  React.useEffect(() => {
    const savedEmail = localStorage.getItem("autopulse_sync_email");
    if (savedEmail) {
      setSyncEmail(savedEmail);
      
      // If we're on a search-related page with no params, try to restore
      const hasParams = window.location.search.length > 0;
      if (!hasParams && (window.location.pathname === "/search" || window.location.pathname === "/")) {
        loadFromCloud(savedEmail).then(loaded => {
          if (loaded) {
            setFilters(loaded);
            // Optionally redirect to apply them to URL if on search page
            if (window.location.pathname === "/search") {
              const params = new URLSearchParams();
              Object.entries(loaded).forEach(([k, v]) => {
                if (v) params.set(k, String(v));
              });
              const q = params.toString();
              if (q) {
                window.location.href = `/search?${q}`;
              }
            }
          }
        });
      }
    }
  }, []);

  const value = React.useMemo(
    () => ({
      filters,
      setFilters,
      syncEmail,
      setSyncEmail,
      isSyncing,
      saveToCloud,
      loadFromCloud,
      alertOpen,
      setAlertOpen,
    }),
    [filters, alertOpen, syncEmail, isSyncing],
  );

  return (
    <SearchFiltersContext.Provider value={value}>
      {children}
    </SearchFiltersContext.Provider>
  );
}

export function useSearchFilters(): SearchFiltersContextValue {
  const ctx = React.useContext(SearchFiltersContext);
  if (!ctx) {
    throw new Error("useSearchFilters must be used within SearchFiltersProvider");
  }
  return ctx;
}

export function filtersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): SearchFilterValues {
  const g = (k: string): string => {
    const v = sp[k];
    if (Array.isArray(v)) return v[0] ?? "";
    return v ?? "";
  };
  return {
    keywords: g("keywords"),
    make: g("make"),
    model: g("model"),
    yearMin: g("yearMin"),
    yearMax: g("yearMax"),
    priceMin: g("priceMin"),
    priceMax: g("priceMax"),
    mileageMin: g("mileageMin"),
    mileageMax: g("mileageMax"),
    city: g("city"),
    trim: g("trim"),
    bodyStyle: g("bodyStyle"),
    driveType: g("driveType"),
    transmission: g("transmission"),
    fuelType: g("fuelType"),
    color: g("color"),
    titleStatus: g("titleStatus"),
    maxOwners: g("maxOwners"),
    noAccidents: g("noAccidents"),
  };
}

