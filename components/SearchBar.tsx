"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SearchBar(): React.ReactElement {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [mileageMax, setMileageMax] = useState("");
  const [city, setCity] = useState("");

  function onSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keywords) params.set("keywords", keywords);
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (yearMin) params.set("yearMin", yearMin);
    if (yearMax) params.set("yearMax", yearMax);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (mileageMax) params.set("mileageMax", mileageMax);
    if (city) params.set("city", city);
    const q = params.toString();
    router.push(q ? `/search?${q}` : "/search");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-5xl rounded-[2.5rem] border border-border/50 bg-card/60 p-6 backdrop-blur-xl shadow-2xl sm:p-10"
    >
      <div className="mb-8 space-y-2">
        <Label htmlFor="keywords" className="text-sm font-bold tracking-tight text-primary/80 uppercase ml-1">Main Search</Label>
        <Input
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g. 2022 Silver Porsche 911 Turbo"
          autoComplete="off"
          className="h-14 rounded-2xl border-primary/10 bg-background/50 text-lg shadow-inner focus:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="make" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Make</Label>
          <Input
            id="make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Toyota…"
            autoComplete="off"
            className="rounded-xl border-border/50 bg-background/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Model</Label>
          <Input
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Camry…"
            autoComplete="off"
            className="rounded-xl border-border/50 bg-background/40"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="yearMin" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Year Min</Label>
            <Input
              id="yearMin"
              type="number"
              value={yearMin}
              onChange={(e) => setYearMin(e.target.value)}
              placeholder="2010"
              className="rounded-xl border-border/50 bg-background/40"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearMax" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max</Label>
            <Input
              id="yearMax"
              type="number"
              value={yearMax}
              onChange={(e) => setYearMax(e.target.value)}
              placeholder="2024"
              className="rounded-xl border-border/50 bg-background/40"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="priceMin" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">$ Min</Label>
            <Input
              id="priceMin"
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0"
              className="rounded-xl border-border/50 bg-background/40"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priceMax" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max</Label>
            <Input
              id="priceMax"
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="50k+"
              className="rounded-xl border-border/50 bg-background/40"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="max-w-xs text-xs font-medium leading-relaxed text-muted-foreground">
          Index results across all 50+ major US metropolitan areas. 
          Combine any fields to refine your search.
        </p>
        <Button type="submit" className="h-14 w-full rounded-2xl bg-primary px-12 text-lg font-black shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-primary/40 sm:w-auto">
          Start Searching
        </Button>
      </div>
    </form>
  );
}
