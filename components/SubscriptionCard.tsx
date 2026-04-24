"use client";

import React, { useState } from "react";
import {
  Car,
  Trash2,
  MapPin,
  DollarSign,
  Calendar,
  Gauge,
  Clock,
  Mail,
  Pencil,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function formatUsdFromCents(cents: number | null): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function SubscriptionCard({ subscription: s }: { subscription: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(s.email);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const title = [s.make, s.model].filter(Boolean).join(" ") || "All vehicles";

  const priceRange = (s.priceMin || s.priceMax)
    ? `${formatUsdFromCents(s.priceMin)} – ${formatUsdFromCents(s.priceMax)}`
    : null;
  const yearRange = (s.yearMin || s.yearMax)
    ? `${s.yearMin || "Any"} – ${s.yearMax || "Any"}`
    : null;

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Stop monitoring for ${title}?`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/subscriptions/${s.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ variant: "success", title: "Alert removed", description: `Monitoring for ${title} has been stopped.` });
      router.refresh();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not remove alert." });
      setIsDeleting(false);
    }
  }

  async function handleUpdateEmail() {
    if (newEmail === s.email) { setIsEditing(false); return; }
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/subscriptions/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      if (!res.ok) throw new Error();
      toast({ variant: "success", title: "Email updated", description: `Alerts will be sent to ${newEmail}` });
      setIsEditing(false);
      router.refresh();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update email." });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className={cn(
      "transition-all duration-200",
      isDeleting && "opacity-40 pointer-events-none scale-[0.99]"
    )}>
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-surface-raised transition-colors cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Car size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{title}</span>
            {/* Live dot */}
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot shrink-0" />
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {[priceRange, yearRange, s.city].filter(Boolean).join(" · ") || "Any vehicle"}
          </div>
        </div>

        {/* Right: delete + expand */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
          <ChevronRight size={16} className={cn("text-muted-foreground transition-transform duration-200", expanded && "rotate-90")} />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 pt-2 bg-surface-raised border-t border-border animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {priceRange && (
              <DetailItem icon={<DollarSign size={13} />} label="Price" value={priceRange} />
            )}
            {yearRange && (
              <DetailItem icon={<Calendar size={13} />} label="Year" value={yearRange} />
            )}
            {s.city && (
              <DetailItem icon={<MapPin size={13} />} label="Location" value={s.city} />
            )}
            {s.mileageMax && (
              <DetailItem icon={<Gauge size={13} />} label="Max mileage" value={`${s.mileageMax.toLocaleString()} mi`} />
            )}
            <DetailItem icon={<Clock size={13} />} label="Created" value={new Date(s.createdAt).toLocaleDateString()} />
          </div>

          {/* Email row */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
            <Mail size={14} className="text-muted-foreground shrink-0" />
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="h-7 text-xs bg-transparent border-b border-border border-t-0 border-x-0 rounded-none px-0 focus-visible:ring-0"
                  autoFocus
                />
                <button onClick={handleUpdateEmail} disabled={isUpdating} className="text-primary hover:text-primary/80">
                  <Check size={14} />
                </button>
                <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1 justify-between">
                <span className="text-xs text-muted-foreground truncate">{s.email}</span>
                <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
