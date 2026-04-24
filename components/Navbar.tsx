"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, Bell, Search, CarFront, Zap, Activity } from "lucide-react";
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
    { label: "Market Alerts", href: "/alerts", icon: Bell },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full sm:top-6 sm:left-1/2 sm:w-auto sm:max-w-4xl sm:-translate-x-1/2 px-2 sm:px-0">
      <header className="relative overflow-hidden rounded-2xl sm:rounded-full border border-foreground/10 bg-background/80 p-1.5 backdrop-blur-2xl shadow-2xl transition-all duration-500">
        <div className="flex h-11 items-center justify-between px-3 sm:h-12 sm:px-1">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 pl-2 sm:pl-4 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background transition-all duration-500 group-hover:opacity-80 sm:h-9 sm:w-9 sm:rounded-xl">
              <Zap size={18} className="fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-black leading-none tracking-[0.1em] text-foreground uppercase sm:text-lg">
                AUTO<span className="opacity-40">PULSE</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 mx-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                    isActive 
                      ? "text-background" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 -z-10 rounded-full bg-foreground" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 pr-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            >
              {mounted && (theme === "dark" ? <Sun size={16} /> : <Moon size={16} />)}
            </Button>
            
            <Button
              size="sm"
              onClick={() => setAlertOpen(true)}
              className="rounded-full bg-foreground h-9 px-4 sm:px-6 text-[10px] font-black uppercase tracking-widest text-background border border-foreground/10 hover:opacity-90 active:scale-95 transition-all shadow-xl"
            >
              <Activity size={14} className="mr-2" />
              <span className="hidden sm:inline">Initialize Sentinel</span>
              <span className="sm:hidden">Alerts</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-9 w-9 rounded-full text-muted-foreground hover:bg-foreground/5 md:hidden"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-2 flex flex-col gap-1.5 p-1 sm:hidden animate-in fade-in slide-in-from-top-2 duration-300">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                  pathname === item.href 
                    ? "bg-foreground text-background" 
                    : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                )}
              >
                {item.label}
                <item.icon size={14} />
              </Link>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}
