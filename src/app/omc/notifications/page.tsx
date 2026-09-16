export const dynamic = 'force-dynamic'

"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { OmcVisibilityView } from "@/components/OmcVisibility/OmcVisibilityView";
import { useRole } from "@/context/RoleContext";
import { OmcId } from "@/types/flowguard";

function OmcNotificationsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedOmcId } = useRole();

  const omcParam = searchParams.get("omc")?.toLowerCase() as OmcId | undefined;
  const initialOmcId = omcParam || (selectedOmcId as OmcId) || "vivo";

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
    <OmcVisibilityView
      initialOmcId={initialOmcId}
      subView="notifications"
      onNavigateDashboard={handleNavigateDashboard}
    />
  );
}

export default function OmcNotificationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1420] text-white p-8">Loading OMC Notifications...</div>}>
      <OmcNotificationsPageContent />
    </Suspense>
  );
}
