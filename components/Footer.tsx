import * as React from "react";
import { Activity } from "lucide-react";

export function Footer(): React.ReactElement {
  return (
    <footer className="mt-auto border-t border-border bg-surface/50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-6">
        
        <div className="flex items-center gap-2 grayscale brightness-50 opacity-50">
          <Activity size={18} className="text-primary" />
          <span className="font-bold tracking-tighter uppercase text-base">AutoPulse</span>
        </div>

        <div className="max-w-2xl text-center">
            <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-[0.2em] leading-relaxed">
                AutoPulse is an independent search tool utilizing proprietary parsing technology. 
                Our platform is not affiliated with, endorsed by, or connected to Meta, 
                Facebook, or any vehicle manufacturers.
            </p>
        </div>

        <p className="text-[10px] text-muted-foreground/30 font-medium">
          &copy; {new Date().getFullYear()} Precision Data Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
