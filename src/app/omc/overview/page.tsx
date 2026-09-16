export const dynamic = 'force-dynamic'

import { Suspense } from "react";
import { OmcVisibilityView } from "@/components/OmcVisibility/OmcVisibilityView";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-slate-500 text-sm">Loading OMC overview…</div>
      }
    >
      <OmcVisibilityView subView="overview" />
    </Suspense>
  );
}