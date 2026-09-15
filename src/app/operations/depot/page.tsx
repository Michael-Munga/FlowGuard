"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DepotOperationsView } from "@/components/DepotOperations/DepotOperationsView";
import { DepotId } from "@/types/flowguard";

function OperationsDepotPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const depotParam = (searchParams.get("depot") || "nairobi").toLowerCase() as DepotId;
  const validDepots: DepotId[] = ["nairobi", "mombasa", "nakuru", "eldoret", "kisumu"];
  const initialDepotId = validDepots.includes(depotParam) ? depotParam : "nairobi";

  const handleNavigateDashboard = (id: string) => {
    if (id === "network-command") {
      router.push("/operations/network");
    } else if (id === "depot-operations") {
      router.push("/operations/depot");
    } else if (id === "omc-collection" || id === "omc-visibility") {
      router.push("/omc/orders");
    } else if (id === "autonomous-control" || id === "autonomous") {
      router.push("/engineer/decisions");
    } else if (id === "executive-control" || id === "executive") {
      router.push("/executive/overview");
    }
  };

  return (
    <DepotOperationsView
      initialDepotId={initialDepotId}
      subView="all"
      onNavigateDashboard={handleNavigateDashboard}
    />
  );
}

export default function OperationsDepotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1420] text-white p-8">Loading Depot Operations...</div>}>
      <OperationsDepotPageContent />
    </Suspense>
  );
}
