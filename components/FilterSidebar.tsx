"use client";

import * as React from "react";
import { FilterFields } from "@/components/FilterFields";
import { SearchFilterValues } from "./SearchFiltersContext";

export function FilterSidebar({ initial }: { initial: SearchFilterValues }): React.ReactElement {
  return (
    <div className="w-full">
       <FilterFields initial={initial} />
    </div>
  );
}
