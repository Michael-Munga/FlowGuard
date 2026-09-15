"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DepotOperationsView } from "@/components/DepotOperations/DepotOperationsView";
import { DepotId } from "@/types/flowguard";

function DepotOperationsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const depotParam = (searchParams.get("depot") || "nairobi").toLowerCase() as DepotId;
  const validDepots: DepotId[] = ["nairobi", "mombasa", "nakuru", "eldoret", "kisumu"];
  const initialDepotId = validDepots.includes(depotParam) ? depotParam : "nairobi";

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
      router.push("/executive-control");
    }
  };

  return (
    <DepotOperationsView
      initialDepotId={initialDepotId}
      onNavigateDashboard={handleNavigateDashboard}
    />
  );
}

export default function DepotOperationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center text-xs font-mono text-slate-500">
          Loading KPC Depot Operations Telemetry...
        </div>
      }
    >
      <DepotOperationsPageContent />
    </Suspense>
  );
}
