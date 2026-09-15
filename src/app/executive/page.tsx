"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ExecutiveControlView } from "@/components/ExecutiveControl/ExecutiveControlView";

function ExecutiveContent() {
  const router = useRouter();

  const handleNavigateDashboard = (id: string) => {
    if (id === "network-command") {
      router.push("/operations/network");
    } else if (id === "depot-operations") {
      router.push("/depot-operations");
    } else if (id === "omc-collection" || id === "omc-visibility") {
      router.push("/omc-visibility");
    } else if (id === "autonomous-control" || id === "autonomous") {
      router.push("/autonomous-control");
    } else if (id === "executive-control" || id === "executive") {
      router.push("/executive");
    }
  };

  return <ExecutiveControlView onNavigateDashboard={handleNavigateDashboard} />;
}

export default function ExecutivePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center text-sm text-slate-500 font-mono">
          Loading Executive Control Plane...
        </div>
      }
    >
      <ExecutiveContent />
    </Suspense>
  );
}
