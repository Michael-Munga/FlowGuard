export const dynamic = 'force-dynamic'

"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { NetworkCommandCentreView } from "@/components/CommandCentre/NetworkCommandCentreView";
import { DepotId } from "@/types/flowguard";

function OperationsAlertsPageContent() {
  const router = useRouter();

  const handleNavigateDepot = (depotId: DepotId) => {
    router.push(`/depot/live?depot=${depotId}`);
  };

  const handleNavigateDashboard = (id: string) => {
    if (id === "network-command") {
      router.push("/operations/network");
    } else if (id === "depot-operations") {
      router.push("/depot/live");
    } else if (id === "omc-collection" || id === "omc-visibility") {
      router.push("/omc/orders");
    } else if (id === "autonomous-control" || id === "autonomous") {
      router.push("/engineer/decisions");
    } else if (id === "executive-control" || id === "executive") {
      router.push("/executive/overview");
    }
  };

  return (
    <NetworkCommandCentreView
      subView="alerts"
      onNavigateDepot={handleNavigateDepot}
      onNavigateDashboard={handleNavigateDashboard}
    />
  );
}

export default function OperationsAlertsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1420] text-white p-8">Loading Alerts & At-Risk Operations...</div>}>
      <OperationsAlertsPageContent />
    </Suspense>
  );
}
