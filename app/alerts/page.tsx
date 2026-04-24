import type { ReactElement } from "react";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { ClientAlertButton } from "@/components/ClientAlertButton";

export const dynamic = "force-dynamic";

export default async function AlertsPage(): Promise<ReactElement> {
  const { prisma } = await import("@/lib/db");
  let subscriptions: any[] = [];

  try {
    subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("[alerts/page]", e);
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              My Alerts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {subscriptions.length > 0
                ? `${subscriptions.length} active alert${subscriptions.length > 1 ? "s" : ""}`
                : "No alerts yet"}
            </p>
          </div>
          <ClientAlertButton />
        </div>

        {/* List */}
        {subscriptions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
            {subscriptions.map((s) => (
              <SubscriptionCard key={s.id} subscription={s} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Bell size={24} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">No alerts yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Set your first search alert and we&apos;ll email you instantly when a matching car is listed.
      </p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-blue hover:bg-primary/90 transition-colors"
      >
        Browse cars to get started
      </Link>
    </div>
  );
}
