"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchFilters } from "@/components/SearchFiltersContext";
import { useToast } from "@/components/ui/use-toast";
import { Bell, ChevronLeft, Loader2 } from "lucide-react";

export function SaveSearchModal(): React.ReactElement {
  const { filters, alertOpen, setAlertOpen } = useSearchFilters();
  const { toast } = useToast();

  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState("eastcoastlogisticllc@gmail.com");
  const [loading, setLoading] = React.useState(false);

  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");
  const [priceMin, setPriceMin] = React.useState("");
  const [priceMax, setPriceMax] = React.useState("");
  const [mileageMin, setMileageMin] = React.useState("");
  const [mileageMax, setMileageMax] = React.useState("");
  const [yearMin, setYearMin] = React.useState("");
  const [yearMax, setYearMax] = React.useState("");
  const [keywords, setKeywords] = React.useState("");

  React.useEffect(() => {
    if (alertOpen) {
      setMake(filters.make || "");
      setModel(filters.model || "");
      setPriceMin(filters.priceMin || "");
      setPriceMax(filters.priceMax || "");
      setMileageMin(filters.mileageMin || "");
      setMileageMax(filters.mileageMax || "");
      setYearMin(filters.yearMin || "");
      setYearMax(filters.yearMax || "");
      setKeywords(filters.keywords || "");
    }
  }, [alertOpen, filters]);

  // Load sync email if present, otherwise fallback to default
  React.useEffect(() => {
    const saved = localStorage.getItem("autopulse_sync_email") || "eastcoastlogisticllc@gmail.com";
    setEmail(saved);
  }, []);

  async function onSave(e: React.FormEvent): Promise<void> {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const body = {
        email: email || "eastcoastlogisticllc@gmail.com",
        make: make || undefined,
        model: model || undefined,
        yearMin: yearMin ? Number(yearMin) : undefined,
        yearMax: yearMax ? Number(yearMax) : undefined,
        priceMin: priceMin ? parseInt(priceMin.replace(/,/g, '').replace(/k/i, '000'), 10) : undefined,
        priceMax: priceMax ? parseInt(priceMax.replace(/,/g, '').replace(/k/i, '000'), 10) : undefined,
        mileageMin: mileageMin ? parseInt(mileageMin.replace(/,/g, '').replace(/k/i, '000'), 10) : undefined,
        mileageMax: mileageMax ? parseInt(mileageMax.replace(/,/g, '').replace(/k/i, '000'), 10) : undefined,
        city: filters.city || undefined,
        keywords: keywords ? [keywords] : undefined,
      };

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ variant: "destructive", title: "Error", description: (data as any)?.error || "Could not save alert" });
        return;
      }

      toast({ variant: "success", title: "Alert activated!", description: `Success! We're monitoring your search now.` });
      setAlertOpen(false);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  // Summary chips for step 2
  const chips = [
    make && `Make: ${make}`,
    model && `Model: ${model}`,
    priceMin && `Min: $${priceMin}`,
    priceMax && `Max: $${priceMax}`,
    yearMin && `Min Yr: ${yearMin}`,
    yearMax && `Max Yr: ${yearMax}`,
    mileageMin && `Min Mi: ${mileageMin}`,
    mileageMax && `Max Mi: ${mileageMax}`,
    keywords && `"${keywords}"`,
  ].filter(Boolean);

  return (
    <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
      <DialogContent className="sm:max-w-md bg-background border border-border rounded-2xl p-0 shadow-modal overflow-hidden animate-spring-in">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell size={18} />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Create search alert
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              We&apos;ll notify you the moment a match appears.
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <form onSubmit={onSave} className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Make" value={make} onChange={setMake} placeholder="e.g. BMW" />
              <Field label="Model" value={model} onChange={setModel} placeholder="e.g. M3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min price ($)" value={priceMin} onChange={setPriceMin} placeholder="5,000" type="number" />
              <Field label="Max price ($)" value={priceMax} onChange={setPriceMax} placeholder="30,000" type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min Year" value={yearMin} onChange={setYearMin} placeholder="2009" type="number" />
              <Field label="Max Year" value={yearMax} onChange={setYearMax} placeholder="2024" type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min mileage" value={mileageMin} onChange={setMileageMin} placeholder="0" />
              <Field label="Max mileage" value={mileageMax} onChange={setMileageMax} placeholder="100k" />
            </div>
            <Field label="Keywords" value={keywords} onChange={setKeywords} placeholder='e.g. "clean title"' />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-blue hover:bg-primary/90 disabled:opacity-60 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
              {loading ? "Activating..." : "Activate alert"}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", autoComplete, required }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="h-10 text-sm bg-surface border-border focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-lg"
      />
    </div>
  );
}
