"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { SearchFilterValues } from "./SearchFiltersContext";
import { cn } from "@/lib/utils";

type Props = {
  initial: SearchFilterValues;
  onApply?: () => void;
};

export function FilterFields({ initial, onApply }: Props): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setFilters } = require("@/components/SearchFiltersContext").useSearchFilters();
  const firstRender = useRef(true);

  const [keywords, setKeywords] = useState(initial.keywords || "");
  const [make, setMake] = useState(initial.make || "");
  const [model, setModel] = useState(initial.model || "");
  const [yearMin, setYearMin] = useState(initial.yearMin || "");
  const [yearMax, setYearMax] = useState(initial.yearMax || "");
  const [priceMin, setPriceMin] = useState(initial.priceMin || "");
  const [priceMax, setPriceMax] = useState(initial.priceMax || "");
  const [mileageMin, setMileageMin] = useState(initial.mileageMin || "");
  const [mileageMax, setMileageMax] = useState(initial.mileageMax || "");
  const [city, setCity] = useState(initial.city || "");
  const [transmission, setTransmission] = useState(initial.transmission || "");
  const [fuelType, setFuelType] = useState(initial.fuelType || "");
  const [driveType, setDriveType] = useState(initial.driveType || "");
  const [titleStatus, setTitleStatus] = useState(initial.titleStatus || "");
  const [bodyStyle, setBodyStyle] = useState(initial.bodyStyle || "");

  const apply = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (k: string, v: any) => { 
      if (v !== "" && v != null) params.set(k, String(v)); 
      else params.delete(k); 
    };
    setOrDelete("keywords", keywords);
    setOrDelete("make", make);
    setOrDelete("model", model);
    setOrDelete("yearMin", yearMin);
    setOrDelete("yearMax", yearMax);
    setOrDelete("priceMin", priceMin);
    setOrDelete("priceMax", priceMax);
    setOrDelete("mileageMin", mileageMin);
    setOrDelete("mileageMax", mileageMax);
    setOrDelete("city", city);
    setOrDelete("transmission", transmission);
    setOrDelete("fuelType", fuelType);
    setOrDelete("driveType", driveType);
    setOrDelete("titleStatus", titleStatus);
    setOrDelete("bodyStyle", bodyStyle);
    params.delete("page");
    const q = params.toString();
    router.push(q ? `/search?${q}` : "/search", { scroll: false });
    if (onApply) onApply();
  }, [keywords, make, model, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, city, transmission, fuelType, driveType, titleStatus, bodyStyle, router, searchParams, onApply]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const timer = setTimeout(() => apply(), 600);
    return () => clearTimeout(timer);
  }, [keywords, make, model, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, city, transmission, fuelType, driveType, titleStatus, bodyStyle, apply]);

  return (
    <div className="flex flex-col gap-6">

      {/* Keywords */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Search</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="Keywords..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-background border border-border rounded-lg focus:border-primary/50 focus:outline-none transition-colors placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Price */}
      <FilterSection label="Price">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
            <input
              type="number"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              placeholder="Min"
              className="w-full h-10 pl-6 pr-3 text-sm bg-background border border-border rounded-lg focus:border-primary/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="text-muted-foreground text-sm">—</div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
            <input
              type="number"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              placeholder="Max"
              className="w-full h-10 pl-6 pr-3 text-sm bg-background border border-border rounded-lg focus:border-primary/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </FilterSection>

      {/* Make / Model */}
      <FilterSection label="Vehicle">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1.5">Quick Makes</label>
            <div className="flex flex-wrap gap-2">
              {["Toyota", "Honda", "Mazda", "Lexus"].map(m => {
                const selected = make.toLowerCase().includes(m.toLowerCase());
                return (
                  <Chip 
                    key={m} 
                    active={selected} 
                    onClick={() => {
                      const current = make.split(",").map(x => x.trim()).filter(Boolean);
                      const next = selected 
                        ? current.filter(x => x.toLowerCase() !== m.toLowerCase())
                        : [...current, m];
                      setMake(next.join(", "));
                    }}
                  >
                    {m}
                  </Chip>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <InputField label="Make(s)" value={make} onChange={setMake} placeholder="Comma separated" />
            <InputField label="Model(s)" value={model} onChange={setModel} placeholder="Comma separated" />
          </div>
        </div>
      </FilterSection>

      <FilterSection label="Year & Mileage">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <InputField label="From year" value={yearMin} onChange={setYearMin} placeholder="2015" type="number" />
          <InputField label="To year" value={yearMax} onChange={setYearMax} placeholder="2024" type="number" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Min mileage" value={mileageMin} onChange={setMileageMin} placeholder="Any" />
          <InputField label="Max mileage" value={mileageMax} onChange={setMileageMax} placeholder="100k" />
        </div>
      </FilterSection>

      {/* Drivetrain */}
      <FilterSection label="Drivetrain">
        <div className="flex flex-wrap gap-2">
          {["AWD", "4WD", "FWD", "RWD"].map(d => (
            <Chip key={d} active={driveType === d} onClick={() => setDriveType(driveType === d ? "" : d)}>{d}</Chip>
          ))}
        </div>
      </FilterSection>

      {/* Transmission */}
      <FilterSection label="Transmission">
        <div className="flex gap-2">
          {["Automatic", "Manual"].map(t => (
            <Chip key={t} active={transmission === t.toLowerCase()} onClick={() => setTransmission(transmission === t.toLowerCase() ? "" : t.toLowerCase())}>{t}</Chip>
          ))}
        </div>
      </FilterSection>

      {/* Fuel */}
      <FilterSection label="Fuel type">
        <div className="flex flex-wrap gap-2">
          {["Gasoline", "Hybrid", "Electric"].map(f => (
            <Chip key={f} active={fuelType === f.toLowerCase()} onClick={() => setFuelType(fuelType === f.toLowerCase() ? "" : f.toLowerCase())}>{f}</Chip>
          ))}
        </div>
      </FilterSection>

      {/* Body style */}
      <FilterSection label="Body style">
        <div className="flex flex-wrap gap-2">
          {["SUV", "Truck", "Sedan", "Coupe"].map(b => (
            <Chip key={b} active={bodyStyle === b.toLowerCase()} onClick={() => setBodyStyle(bodyStyle === b.toLowerCase() ? "" : b.toLowerCase())}>{b}</Chip>
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection label="Location">
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="City or state..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-background border border-border rounded-lg focus:border-primary/50 focus:outline-none transition-colors placeholder:text-muted-foreground/50"
          />
        </div>
      </FilterSection>

      {/* Reset */}
      <button
        onClick={() => {
          // Clear local state
          setKeywords(""); setMake(""); setModel(""); setYearMin(""); setYearMax("");
          setPriceMin(""); setPriceMax(""); setMileageMin(""); setMileageMax("");
          setCity(""); setTransmission(""); setFuelType(""); setDriveType("");
          setTitleStatus(""); setBodyStyle("");
          
          // Clear global state
          setFilters(require("@/components/SearchFiltersContext").emptyFilters);
          localStorage.removeItem("autopulse_last_filters");
          
          // Force full reload to ensure everything is wiped
          window.location.href = "/search";
        }}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
      >
        Clear all filters
      </button>

      {/* Cloud Sync */}
      <div className="mt-4 pt-6 border-t border-border">
        <CloudSyncSection currentValues={{
          keywords, make, model, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, city, transmission, fuelType, driveType, titleStatus, bodyStyle,
          // Adding these just in case they are added to sidebar later
          maxOwners: initial.maxOwners || "",
          noAccidents: initial.noAccidents || "",
        }} />
      </div>
    </div>
  );
}

function CloudSyncSection({ currentValues }: { currentValues: any }) {
  const { syncEmail, saveToCloud, loadFromCloud, isSyncing, setFilters } = require("@/components/SearchFiltersContext").useSearchFilters();
  const [email, setEmail] = React.useState(syncEmail || "");
  const [msg, setMsg] = React.useState("");

  React.useEffect(() => {
    if (syncEmail) setEmail(syncEmail);
  }, [syncEmail]);

  const handleSave = async () => {
    if (!email.includes("@")) { setMsg("Invalid email"); return; }
    await saveToCloud(email, currentValues);
    setMsg("Filters synced! ✅");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleLoad = async () => {
    if (!email.includes("@")) { setMsg("Invalid email"); return; }
    const loaded = await loadFromCloud(email);
    if (loaded) {
      setFilters(loaded);
      
      // Update URL to trigger a full state refresh
      const params = new URLSearchParams();
      Object.entries(loaded).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
      const q = params.toString();
      window.location.href = q ? `/search?${q}` : "/search";
      
      setMsg("Restored! 🔄");
    } else {
      setMsg("No filters found.");
    }
    setTimeout(() => setMsg(""), 3000);
  };

  // If using the default shared account, hide the sync UI so it feels integrated
  if (syncEmail === "eastcoastlogisticllc@gmail.com") return null;

  return (
    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
      <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        Cloud Sync
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3 leading-tight">
        Enter your email to sync filters across devices.
      </p>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full h-8 px-3 text-xs bg-background border border-border rounded-lg mb-2 focus:border-primary/50 focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSyncing}
          className="flex-1 h-8 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {isSyncing ? "..." : "Save"}
        </button>
        <button
          onClick={handleLoad}
          disabled={isSyncing}
          className="flex-1 h-8 bg-surface border border-border text-foreground text-[10px] font-bold rounded-lg hover:bg-surface-raised transition-all disabled:opacity-50"
        >
          {isSyncing ? "..." : "Restore"}
        </button>
      </div>
      {msg && <p className="text-[10px] text-primary mt-2 font-medium text-center">{msg}</p>}
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full mb-2.5 group"
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
          {label}
        </span>
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 text-sm bg-background border border-border rounded-lg focus:border-primary/50 focus:outline-none transition-colors placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
        active
          ? "bg-primary text-white border-primary shadow-blue"
          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
      )}
    >
      {children}
    </button>
  );
}
