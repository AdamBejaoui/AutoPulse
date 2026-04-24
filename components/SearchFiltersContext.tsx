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

  const value = React.useMemo(
    () => ({
      filters,
      setFilters,
      alertOpen,
      setAlertOpen,
    }),
    [filters, alertOpen],
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

