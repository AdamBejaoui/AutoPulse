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
  savedListingIds: string[];
  toggleSaved: (id: string) => void;
  syncEmail: string;
  setSyncEmail: (e: string) => void;
  isSyncing: boolean;
  saveToCloud: (email: string, filters: SearchFilterValues, savedIds?: string[]) => Promise<void>;
  loadFromCloud: (email: string) => Promise<{ filters: SearchFilterValues; savedIds: string[] } | null>;
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
  const [savedListingIds, setSavedListingIds] = React.useState<string[]>([]);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [syncEmail, setSyncEmail] = React.useState("");
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Toggle saved logic
  const toggleSaved = (id: string) => {
    setSavedListingIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("saved_listings", JSON.stringify(next));
      // Auto-sync if we have an email
      if (syncEmail) {
        saveToCloud(syncEmail, filters, next);
      }
      return next;
    });
  };

  // Persistence logic
  const saveToCloud = async (email: string, f: SearchFilterValues, savedIds?: string[]) => {
    if (!email) return;
    setIsSyncing(true);
    try {
      const body: any = { email, filters: f };
      if (savedIds) body.savedListingIds = savedIds;

      await fetch("/api/preferences", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setSyncEmail(email);
      localStorage.setItem("autopulse_sync_email", email);
    } catch (e) {
      console.error("Cloud save failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFromCloud = async (email: string): Promise<{ filters: SearchFilterValues; savedIds: string[] } | null> => {
    if (!email) return null;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/preferences?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.filters || data.savedListingIds) {
        setSyncEmail(email);
        localStorage.setItem("autopulse_sync_email", email);
        if (data.savedListingIds) {
          setSavedListingIds(data.savedListingIds);
          localStorage.setItem("saved_listings", JSON.stringify(data.savedListingIds));
        }
        return { 
          filters: data.filters || emptyFilters, 
          savedIds: data.savedListingIds || [] 
        };
      }
    } catch (e) {
      console.error("Cloud load failed", e);
    } finally {
      setIsSyncing(false);
    }
    return null;
  };

  // Load from localStorage on mount
  React.useEffect(() => {
    const localSaved = localStorage.getItem("saved_listings");
    if (localSaved) {
      try {
        setSavedListingIds(JSON.parse(localSaved));
      } catch (e) {}
    }

    const savedEmail = localStorage.getItem("autopulse_sync_email") || "eastcoastlogisticllc@gmail.com";
    setSyncEmail(savedEmail);
    
    // If we're on a search-related page with no params, try to restore
    const hasParams = window.location.search.length > 0;
    loadFromCloud(savedEmail).then(loaded => {
      if (loaded && !hasParams && (window.location.pathname === "/search" || window.location.pathname === "/")) {
        setFilters(loaded.filters);
        if (window.location.pathname === "/search") {
          const params = new URLSearchParams();
          Object.entries(loaded.filters).forEach(([k, v]) => {
            if (v) params.set(k, String(v));
          });
          const q = params.toString();
          if (q) {
            window.location.href = `/search?${q}`;
          }
        }
      }
    });
  }, []);

  const value = React.useMemo(
    () => ({
      filters,
      setFilters,
      savedListingIds,
      toggleSaved,
      syncEmail,
      setSyncEmail,
      isSyncing,
      saveToCloud,
      loadFromCloud,
      alertOpen,
      setAlertOpen,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, savedListingIds, alertOpen, syncEmail, isSyncing],
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

