"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter out page, limit, and order from the chips
  const ignore = ["page", "limit", "order"];
  const activeParams = Array.from(searchParams.entries()).filter(([key]) => !ignore.includes(key));
  
  if (activeParams.length === 0) return null;

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    const q = params.toString();
    router.push(q ? `/search?${q}` : "/search");
  };

  const clearAll = () => {
    router.push("/search");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1 tracking-wider">Active:</span>
      
      {activeParams.map(([key, value]) => (
        <div 
          key={key}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full text-xs font-medium text-foreground group hover:border-primary/50 transition-colors"
        >
          <span className="text-muted-foreground opacity-60 font-normal capitalize">{key}:</span>
          <span>{value}</span>
          <button 
            onClick={() => removeParam(key)}
            className="hover:text-primary transition-colors ml-1"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      <button
        onClick={clearAll}
        className="text-xs font-bold text-primary hover:underline ml-2"
      >
        Clear all filters
      </button>
    </div>
  );
}
