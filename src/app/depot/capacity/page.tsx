"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DepotOperationsView } from "@/components/DepotOperations/DepotOperationsView";
import { useRole } from "@/context/RoleContext";
import { DepotId } from "@/types/flowguard";

function DepotCapacityPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedDepotId } = useRole();

  const depotParam = searchParams.get("depot")?.toLowerCase() as DepotId | undefined;
  const validDepots: DepotId[] = ["nairobi", "mombasa", "nakuru", "eldoret", "kisumu"];
  const initialDepotId = depotParam && validDepots.includes(depotParam) ? depotParam : selectedDepotId;

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
    <DepotOperationsView
      initialDepotId={initialDepotId}
      subView="capacity"
      onNavigateDashboard={handleNavigateDashboard}
    />
  );
}

export default function DepotCapacityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1420] text-white p-8">Loading Depot Capacity & Equipment...</div>}>
      <DepotCapacityPageContent />
    </Suspense>
  );
}
