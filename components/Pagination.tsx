import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  /** Serialized query string without `page` (may be empty). */
  queryWithoutPage: string;
};

export function Pagination({
  page,
  totalPages,
  queryWithoutPage,
}: Props): React.ReactElement {
  function hrefForPage(target: number): string {
    const params = new URLSearchParams(
      queryWithoutPage ? queryWithoutPage : undefined,
    );
    params.set("page", String(target));
    const q = params.toString();
    return q ? `/search?${q}` : `/search?page=${target}`;
  }

  const pageNumbers: number[] =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [
          1,
          totalPages,
          page - 1,
          page,
          page + 1,
        ].filter((n) => n >= 1 && n <= totalPages);

  const sortedUnique = [...new Set(pageNumbers)].sort((a, b) => a - b);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <PaginationLink href={page <= 1 ? null : hrefForPage(page - 1)}>
        Previous
      </PaginationLink>
      {sortedUnique.map((n, idx) => (
        <React.Fragment key={n}>
          {idx > 0 && sortedUnique[idx - 1] !== undefined && n - sortedUnique[idx - 1]! > 1 ? (
            <span className="px-1 text-muted-foreground">…</span>
          ) : null}
          <PaginationLink href={hrefForPage(n)} active={n === page}>
            {n}
          </PaginationLink>
        </React.Fragment>
      ))}
      <PaginationLink
        href={page >= totalPages ? null : hrefForPage(page + 1)}
      >
        Next
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  active,
  children,
}: {
  href: string | null;
  active?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  if (!href) {
    return (
      <span className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground opacity-50">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50",
      )}
    >
      {children}
    </Link>
  );
}
