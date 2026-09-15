"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { NetworkCommandCentreView } from "@/components/CommandCentre/NetworkCommandCentreView";
import { DepotId } from "@/types/flowguard";

function NetworkOverviewPageContent() {
  const router = useRouter();

  const handleNavigateDepot = (depotId: DepotId) => {
    router.push(`/depot/live?depot=${depotId}`);
  };

  const handleNavigateDashboard = (id: string) => {
    if (id === "depot-operations") {
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
      subView="overview"
      onNavigateDepot={handleNavigateDepot}
      onNavigateDashboard={handleNavigateDashboard}
    />
  );
}

export default function NetworkOverviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1420] text-white p-8">Loading Network Command Centre...</div>}>
      <NetworkOverviewPageContent />
    </Suspense>
  );
}
