"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ExecutiveControlView } from "@/components/ExecutiveControl/ExecutiveControlView";

function ExecutivePerformancePageContent() {
  const router = useRouter();

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
    <ExecutiveControlView
      subView="performance"
      onNavigateDashboard={handleNavigateDashboard}
    />
  );
}

export default function ExecutivePerformancePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1420] text-white p-8">Loading Executive Performance...</div>}>
      <ExecutivePerformancePageContent />
    </Suspense>
  );
}
