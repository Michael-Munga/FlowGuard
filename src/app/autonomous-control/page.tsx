"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AutonomousControlView } from "@/components/AutonomousControl/AutonomousControlView";

function AutonomousControlContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const incidentParam = searchParams.get("incident") || "INT-8801";

  const handleNavigateDashboard = (id: string) => {
    if (id === "network-command") {
      router.push("/operations/network");
    } else if (id === "depot-operations") {
      router.push("/depot-operations");
    } else if (id === "omc-collection" || id === "omc-visibility") {
      router.push("/omc-visibility");
    } else if (id === "autonomous-control") {
      router.push("/autonomous-control");
    } else if (id === "executive-control" || id === "executive") {
      router.push("/executive-control");
    }
  };

  return (
    <AutonomousControlView
      initialIncidentId={incidentParam}
      onNavigateDashboard={handleNavigateDashboard}
    />
  );
}

export default function AutonomousControlPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center text-sm text-slate-500 font-mono">
          Loading Autonomous Control Console...
        </div>
      }
    >
      <AutonomousControlContent />
    </Suspense>
  );
}
