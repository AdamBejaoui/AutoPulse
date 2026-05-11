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

  // SYNC local state with props (e.g. when URL changes from outside)
  useEffect(() => {
    setKeywords(initial.keywords || "");
    setMake(initial.make || "");
    setModel(initial.model || "");
    setYearMin(initial.yearMin || "");
    setYearMax(initial.yearMax || "");
    setPriceMin(initial.priceMin || "");
    setPriceMax(initial.priceMax || "");
    setMileageMin(initial.mileageMin || "");
    setMileageMax(initial.mileageMax || "");
    setCity(initial.city || "");
    setTransmission(initial.transmission || "");
    setFuelType(initial.fuelType || "");
    setDriveType(initial.driveType || "");
    setTitleStatus(initial.titleStatus || "");
    setBodyStyle(initial.bodyStyle || "");
  }, [initial]);

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
    const currentFilters = {
      keywords, make, model, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, city, transmission, fuelType, driveType, titleStatus, bodyStyle,
      maxOwners: initial.maxOwners || "",
      noAccidents: initial.noAccidents || "",
      trim: initial.trim || "",
    };
    setFilters(currentFilters);

    const q = params.toString();
    router.push(q ? `/search?${q}` : "/search", { scroll: false });
    if (onApply) onApply();
  }, [keywords, make, model, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, city, transmission, fuelType, driveType, titleStatus, bodyStyle, router, searchParams, onApply, setFilters, initial.maxOwners, initial.noAccidents, initial.trim]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const timer = setTimeout(() => apply(), 600);
    return () => clearTimeout(timer);
  }, [keywords, make, model, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, city, transmission, fuelType, driveType, titleStatus, bodyStyle, apply]);

  return (
    <div className="flex flex-col gap-6">

      {/* Keywords */}
      <div>
        <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest opacity-60">Quick Search</label>
        <div className="relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <input
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="Keywords (e.g. AWD, Leather)..."
            className="w-full h-11 pl-10 pr-4 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/40 focus:outline-none transition-all placeholder:text-muted-foreground/30"
          />
        </div>
      </div>

      {/* Price */}
      <FilterSection label="Price Range">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-xs">$</span>
            <input
              type="number"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              placeholder="Min"
              className="w-full h-10 pl-7 pr-3 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/40 focus:outline-none transition-all"
            />
          </div>
          <div className="text-muted-foreground/30 text-xs font-bold uppercase tracking-tighter">to</div>
          <div className="relative flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-xs">$</span>
            <input
              type="number"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              placeholder="Max"
              className="w-full h-10 pl-7 pr-3 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/40 focus:outline-none transition-all"
            />
          </div>
        </div>
      </FilterSection>

      {/* Make / Model */}
      <FilterSection label="Vehicle">
        <div className="flex flex-col gap-2.5">
          <div>
            <div className="flex flex-wrap gap-1.5">
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
          <div className="grid grid-cols-2 gap-1.5">
            <InputField label="Make(s)" value={make} onChange={setMake} placeholder="Toyota..." />
            <InputField label="Model(s)" value={model} onChange={setModel} placeholder="Camry..." />
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

    </div>
  );
}

function FilterSection({ label, children, initialOpen = true }: { label: string; children: React.ReactNode; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div className="border-b border-border/50 pb-5 last:border-0 last:pb-0 animate-in fade-in slide-in-from-top-1">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full mb-3.5 group"
      >
        <span className="text-[11px] font-bold text-foreground uppercase tracking-[0.1em] group-hover:text-primary transition-colors">
          {label}
        </span>
        <ChevronDown size={14} className={cn("text-muted-foreground/40 transition-transform duration-300", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-tight">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/40 focus:outline-none transition-all placeholder:text-muted-foreground/30"
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
        "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
        active
          ? "bg-primary text-white border-primary shadow-blue scale-105"
          : "bg-background border-border text-muted-foreground hover:text-primary hover:border-primary/30 active:scale-95"
      )}
    >
      {children}
    </button>
  );
}
