export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { ExecutiveControlView } from "@/components/ExecutiveControl/ExecutiveControlView";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading executive overview…</div>}>
      <ExecutiveControlView subView="overview" />
    </Suspense>
  );
}