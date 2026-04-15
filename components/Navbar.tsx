"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, Bell, Search, CarFront, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSearchFilters } from "@/components/SearchFiltersContext";

export function Navbar(): React.ReactElement {
  const pathname = usePathname();
  const { setAlertOpen } = useSearchFilters();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: "Find Cars", href: "/search", icon: Search },
    { label: "My Alerts", href: "/alerts", icon: Bell },
  ];

  return (
    <div className="fixed top-6 left-1/2 z-50 w-full max-w-[95%] -translate-x-1/2 sm:max-w-5xl">
      <header className="relative overflow-hidden rounded-full border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/40 px-6 py-3 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-primary/30">
        <div className="flex h-12 items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-glow rounded-xl bg-primary/20 blur-md" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-blue to-cyber-purple text-primary-foreground shadow-lg transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                <CarFront size={22} className="drop-shadow-sm" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-black leading-tight tracking-tighter text-foreground">
                AUTO<span className="text-primary">PULSE</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 leading-none">USA Aggregator</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold tracking-tight transition-all duration-300",
                    isActive 
                      ? "text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 -z-10 rounded-full bg-cyber-gradient shadow-[0_4px_12px_rgba(0,242,254,0.4)]" />
                  )}
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground sm:flex"
            >
              {mounted && (theme === "dark" ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />)}
            </Button>
            
            <Button
              size="sm"
              onClick={() => setAlertOpen(true)}
              className="relative overflow-hidden rounded-full bg-black/10 dark:bg-white/10 px-5 py-5 font-bold text-foreground dark:text-white transition-all hover:bg-black/20 dark:hover:bg-white/20 active:scale-95 group/btn"
            >
              <div className="absolute inset-0 -translate-x-full bg-cyber-gradient transition-transform duration-500 group-hover/btn:translate-x-0" />
              <span className="relative flex items-center gap-2">
                <Bell size={16} className="group-hover/btn:animate-bounce" />
                Notify Me
              </span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground md:hidden"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 flex flex-col gap-2 rounded-3xl bg-white/60 dark:bg-black/40 backdrop-blur-2xl p-4 border border-black/10 dark:border-white/5 md:hidden animate-in fade-in zoom-in duration-300">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-5 py-4 text-lg font-black transition-all",
                  pathname === item.href 
                    ? "bg-cyber-gradient text-primary-foreground" 
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon size={22} />
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-white/5">
              <Button
                className="w-full rounded-2xl bg-cyber-gradient py-7 text-lg font-black text-primary-foreground shadow-lg active:scale-[0.98]"
                onClick={() => {
                  setAlertOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                Set AI Alert
              </Button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
