"use client";

import { useEffect, useState } from "react";
import { Timer, RefreshCw } from "lucide-react";

type Stats = {
  total24h: number;
  total1h: number;
};

export function ScrapeTimer({ initialStats }: { initialStats: Stats }) {
  const [timeLeft, setTimeLeft] = useState("--:--");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      let nextMinutes = minutes < 30 ? 30 : 60;
      let diffMinutes = nextMinutes - minutes - 1;
      let diffSeconds = 60 - seconds;

      if (diffSeconds === 60) {
        diffSeconds = 0;
        diffMinutes += 1;
      }

      return `${String(diffMinutes).padStart(2, "0")}:${String(diffSeconds).padStart(2, "0")}`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface border border-border/60 shadow-sm mt-12 max-w-xl mx-auto backdrop-blur-sm bg-surface/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Timer size={18} className="text-primary animate-pulse" />
          <span className="text-sm">Local Scraper Sync Timer</span>
        </div>
        <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-mono font-medium">
          {timeLeft} until next sweep
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="rounded-xl bg-background/50 p-4 border border-border/40">
          <div className="text-2xl font-bold font-mono text-foreground">
            {initialStats.total1h.toLocaleString()}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Last hour
          </div>
        </div>
        <div className="rounded-xl bg-background/50 p-4 border border-border/40">
          <div className="text-2xl font-bold font-mono text-foreground">
            {initialStats.total24h.toLocaleString()}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
            Past 24 hours
          </div>
        </div>
      </div>
      
      <div className="text-[10px] text-center text-muted-foreground/60 italic">
        *Paid Apify full-harvests execute asynchronously in continuous ~1 hour intervals.
      </div>
    </div>
  );
}
