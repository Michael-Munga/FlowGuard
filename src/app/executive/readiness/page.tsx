import { Suspense } from "react";
import { ExecutiveControlView } from "@/components/ExecutiveControl/ExecutiveControlView";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading readiness view…</div>}>
      <ExecutiveControlView subView="readiness" />
    </Suspense>
  );
}