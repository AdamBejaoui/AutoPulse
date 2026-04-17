"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ComparisonContextType {
  comparisonList: any[];
  addToComparison: (listing: any) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isInComparison: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [comparisonList, setComparisonList] = useState<any[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("autopulse_comparison");
    if (saved) {
      try {
        setComparisonList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse comparison list", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("autopulse_comparison", JSON.stringify(comparisonList));
  }, [comparisonList]);

  const addToComparison = (listing: any) => {
    setComparisonList((prev) => {
      if (prev.find((item) => item.id === listing.id)) return prev;
      if (prev.length >= 4) return prev; // Limit to 4
      return [...prev, listing];
    });
  };

  const removeFromComparison = (id: string) => {
    setComparisonList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (id: string) => {
    return comparisonList.some((item) => item.id === id);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
