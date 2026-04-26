"use client";

import { useEffect, useState, useRef } from "react";

export function LiveListingCounter({ initialCount }: { initialCount: number }) {
  const [displayCount, setDisplayCount] = useState(initialCount);
  const targetCountRef = useRef(initialCount);

  useEffect(() => {
    const fetchLatestCount = async () => {
      try {
        const res = await fetch("/api/listings/count");
        const data = await res.json();
        if (data.count && data.count > 0) {
          targetCountRef.current = data.count;
        }
      } catch (e) {
        console.error("Failed to poll live count:", e);
      }
    };

    // Poll for the actual number every 30 seconds
    const pollInterval = setInterval(fetchLatestCount, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    // Smooth stepping animation towards target
    const animationInterval = setInterval(() => {
      if (displayCount < targetCountRef.current) {
        const diff = targetCountRef.current - displayCount;
        const step = Math.max(1, Math.floor(diff / 4)); 
        setDisplayCount((prev) => Math.min(prev + step, targetCountRef.current));
      } else if (displayCount > targetCountRef.current) {
        const diff = displayCount - targetCountRef.current;
        const step = Math.max(1, Math.floor(diff / 4));
        setDisplayCount((prev) => Math.max(prev - step, targetCountRef.current));
      }
    }, 150);

    return () => clearInterval(animationInterval);
  }, [displayCount]);

  return (
    <div className="animate-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-primary animate-pulse relative">
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
      </span>
      <span className="font-mono text-sm tracking-tight font-bold">
        {displayCount.toLocaleString()}
      </span>
      <span>live listings nationwide</span>
    </div>
  );
}
