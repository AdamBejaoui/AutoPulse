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
import { useToast } from "@/components/ui/use-toast";
import { Bell, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditAlertModalProps {
  subscription: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAlertModal({
  subscription,
  open,
  onOpenChange,
}: EditAlertModalProps): React.ReactElement {
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = React.useState(subscription.email || "");
  const [make, setMake] = React.useState(subscription.make || "");
  const [model, setModel] = React.useState(subscription.model || "");
  const [priceMin, setPriceMin] = React.useState(
    subscription.priceMin ? (subscription.priceMin / 100).toString() : ""
  );
  const [priceMax, setPriceMax] = React.useState(
    subscription.priceMax ? (subscription.priceMax / 100).toString() : ""
  );
  const [yearMin, setYearMin] = React.useState(
    subscription.yearMin ? subscription.yearMin.toString() : ""
  );
  const [yearMax, setYearMax] = React.useState(
    subscription.yearMax ? subscription.yearMax.toString() : ""
  );
  const [mileageMin, setMileageMin] = React.useState(
    subscription.mileageMin ? subscription.mileageMin.toString() : ""
  );
  const [mileageMax, setMileageMax] = React.useState(
    subscription.mileageMax ? subscription.mileageMax.toString() : ""
  );
  const [city, setCity] = React.useState(subscription.city || "");
  const [keywords, setKeywords] = React.useState(
    subscription.keywords && subscription.keywords.length > 0
      ? subscription.keywords.join(", ")
      : ""
  );

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setEmail(subscription.email || "");
      setMake(subscription.make || "");
      setModel(subscription.model || "");
      setPriceMin(subscription.priceMin ? (subscription.priceMin / 100).toString() : "");
      setPriceMax(subscription.priceMax ? (subscription.priceMax / 100).toString() : "");
      setYearMin(subscription.yearMin ? subscription.yearMin.toString() : "");
      setYearMax(subscription.yearMax ? subscription.yearMax.toString() : "");
      setMileageMin(subscription.mileageMin ? subscription.mileageMin.toString() : "");
      setMileageMax(subscription.mileageMax ? subscription.mileageMax.toString() : "");
      setCity(subscription.city || "");
      setKeywords(
        subscription.keywords && subscription.keywords.length > 0
          ? subscription.keywords.join(", ")
          : ""
      );
    }
  }, [open, subscription]);

  async function onSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        email,
        make: make || null,
        model: model || null,
        yearMin: yearMin ? Number(yearMin) : null,
        yearMax: yearMax ? Number(yearMax) : null,
        priceMin: priceMin ? Number(priceMin) : null,
        priceMax: priceMax ? Number(priceMax) : null,
        mileageMin: mileageMin ? Number(mileageMin) : null,
        mileageMax: mileageMax ? Number(mileageMax) : null,
        city: city || null,
        keywords: keywords ? keywords.split(",").map((k: string) => k.trim()).filter(Boolean) : [],
      };

      const res = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data?.error || "Could not update alert",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Alert updated",
        description: "Your search filters have been updated.",
      });
      onOpenChange(false);
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border border-border rounded-2xl p-0 shadow-modal overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell size={18} />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Edit search alert
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Update the filters for this alert.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={onSave} className="px-6 pb-6 pt-4 space-y-4">
          <Field
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Make" value={make} onChange={setMake} placeholder="e.g. BMW" />
            <Field label="Model" value={model} onChange={setModel} placeholder="e.g. M3" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Min price ($)"
              value={priceMin}
              onChange={setPriceMin}
              placeholder="5000"
              type="number"
            />
            <Field
              label="Max price ($)"
              value={priceMax}
              onChange={setPriceMax}
              placeholder="30000"
              type="number"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Min Year"
              value={yearMin}
              onChange={setYearMin}
              placeholder="2010"
              type="number"
            />
            <Field
              label="Max Year"
              value={yearMax}
              onChange={setYearMax}
              placeholder="2024"
              type="number"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Min mileage"
              value={mileageMin}
              onChange={setMileageMin}
              placeholder="0"
              type="number"
            />
            <Field
              label="Max mileage"
              value={mileageMax}
              onChange={setMileageMax}
              placeholder="100000"
              type="number"
            />
          </div>

          <Field label="City" value={city} onChange={setCity} placeholder="e.g. Philadelphia" />

          <Field
            label="Keywords (comma separated)"
            value={keywords}
            onChange={setKeywords}
            placeholder='e.g. clean title, sunroof'
          />

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-surface"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-blue hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-10 text-sm bg-surface border-border focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-lg"
      />
    </div>
  );
}
