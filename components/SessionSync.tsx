"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchFilters } from "@/components/SearchFiltersContext";

/**
 * Invisible component that syncs the logged-in user's email
 * into SearchFiltersContext.syncEmail as soon as the session is known.
 * Rendered once in the root layout, inside both AuthProvider and SearchFiltersProvider.
 */
export function SessionSync() {
  const { data: session } = useSession();
  const { setSyncEmail } = useSearchFilters();

  useEffect(() => {
    if (session?.user?.email) {
      setSyncEmail(session.user.email);
    }
  }, [session?.user?.email, setSyncEmail]);

  return null;
}
