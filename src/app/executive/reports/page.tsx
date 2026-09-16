export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { ExecutiveControlView } from "@/components/ExecutiveControl/ExecutiveControlView";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading reports workspace…</div>}>
      <ExecutiveControlView subView="reports" />
    </Suspense>
  );
}