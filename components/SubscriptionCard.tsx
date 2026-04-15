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
  Zap,
  Mail,
  Pencil,
  Check,
  X 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

function formatUsdFromCents(cents: number | null): string {
  if (cents == null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function ConfigRow({ icon: Icon, value }: { icon: any, value: string }) {
  return (
    <div className="flex items-center gap-3">
       <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-gray-500 transition-colors group-hover:text-cyber-blue">
          <Icon size={14} />
       </div>
       <span className="text-xs font-bold text-gray-300 truncate tracking-tight">{value}</span>
    </div>
  );
}

export function SubscriptionCard({ subscription: s }: { subscription: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(s.email);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const title = [s.make, s.model].filter(Boolean).join(" ") || "All Vehicles";

  async function handleDelete() {
    if (!confirm(`Stop monitoring for ${title}?`)) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/subscriptions/${s.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Deletion failed");

      toast({
        variant: "success",
        title: "Sentinel Deactivated",
        description: `Monitoring for ${title} has been terminated.`,
      });
      router.refresh();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "System Error",
        description: "Could not terminate Sentinel signal.",
      });
      setIsDeleting(false);
    }
  }

  async function handleUpdateEmail() {
    if (newEmail === s.email) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/subscriptions/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast({
        variant: "success",
        title: "Protocol Updated",
        description: `Uplink target changed to ${newEmail}`,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uplink Error",
        description: "Failed to update transmission target.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <article className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A0C0F]/80 p-8 backdrop-blur-3xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1 hover:border-cyber-blue/50 hover:shadow-[0_0_40px_rgba(0,216,255,0.2)] ${isDeleting ? "opacity-40 grayscale pointer-events-none scale-95" : ""}`}>
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 h-[300px] w-[300px] -translate-y-1/2 translate-x-1/3 rounded-full bg-cyber-blue/10 blur-[80px] pointer-events-none opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/50 border border-white/10 text-cyber-blue shadow-inner transition-transform group-hover:scale-110 group-hover:border-cyber-blue/40">
             <Car size={26} strokeWidth={1.5} />
          </div>
          <button 
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="h-10 w-10 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-full flex items-center justify-center transition-all bg-black/20 border border-transparent hover:border-red-500/30 disabled:opacity-50"
          >
             <Trash2 size={16} />
          </button>
        </div>

        <h3 className="text-2xl font-black font-display tracking-tight text-white mb-2 line-clamp-1 group-hover:text-cyber-blue transition-colors">{title}</h3>
        <div className="flex items-center gap-2 mb-8">
           <div className="h-2 w-2 rounded-full bg-cyber-blue animate-pulse shadow-[0_0_8px_rgba(0,216,255,1)]" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Monitoring Active</span>
        </div>

        {/* Config Summary */}
        <div className="space-y-4 mb-4 bg-black/30 p-5 rounded-2xl border border-white/5">
           <ConfigRow icon={DollarSign} value={s.priceMin || s.priceMax ? `${formatUsdFromCents(s.priceMin)} - ${formatUsdFromCents(s.priceMax)}` : "Any price"} />
           <ConfigRow icon={Calendar} value={s.yearMin || s.yearMax ? `${s.yearMin || "Any"} - ${s.yearMax || "Any"}` : "Any year"} />
           <ConfigRow icon={MapPin} value={s.city || "All 50+ Hubs"} />
           {s.mileageMax && (
             <ConfigRow icon={Gauge} value={`Max ${s.mileageMax.toLocaleString()} mi`} />
           )}
        </div>

        {/* Email Row */}
        <div className="mb-8 px-5 py-3 rounded-xl bg-cyber-blue/5 border border-cyber-blue/10 flex items-center justify-between group/email">
           <div className="flex items-center gap-3 overflow-hidden">
              <Mail size={14} className="text-cyber-blue flex-shrink-0" />
              {isEditing ? (
                <Input 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="h-7 bg-transparent border-b border-primary/50 border-t-0 border-x-0 rounded-none px-0 text-xs font-bold text-white focus-visible:ring-0"
                  autoFocus
                />
              ) : (
                <span className="text-xs font-bold text-cyber-blue/80 truncate">{s.email}</span>
              )}
           </div>
           
           <div className="flex items-center gap-1">
             {isEditing ? (
               <>
                 <button onClick={handleUpdateEmail} disabled={isUpdating} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-md transition-colors">
                    <Check size={14} />
                 </button>
                 <button onClick={() => setIsEditing(false)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                    <X size={14} />
                 </button>
               </>
             ) : (
               <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-500 hover:text-white opacity-0 group-hover/email:opacity-100 transition-all">
                  <Pencil size={14} />
               </button>
             )}
           </div>
        </div>

        {/* Footer Info */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <Clock size={14} className="text-cyber-blue/60" />
              Created {new Date(s.createdAt).toLocaleDateString()}
           </div>
           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyber-blue/10 text-cyber-blue shadow-[0_0_15px_rgba(0,216,255,0.2)] hover:scale-110 transition-transform">
              <Zap size={14} className="fill-cyber-blue animate-pulse" />
           </div>
        </div>
      </div>
    </article>
  );
}
