"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { OmcVisibilityView } from "@/components/OmcVisibility/OmcVisibilityView";
import { OmcId } from "@/types/flowguard";

function OmcVisibilityPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const omcParam = (searchParams.get("omc") || "vivo").toLowerCase() as OmcId;
  const validOmcs: OmcId[] = ["vivo", "totalenergies", "rubis", "lakeoil", "ola", "hass"];
  const initialOmcId = validOmcs.includes(omcParam) ? omcParam : "vivo";

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
    <OmcVisibilityView
      initialOmcId={initialOmcId}
      onNavigateDashboard={handleNavigateDashboard}
    />
  );
}

export default function OmcVisibilityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center text-xs font-mono text-slate-500">
          Loading OMC Collection Visibility Portal...
        </div>
      }
    >
      <OmcVisibilityPageContent />
    </Suspense>
  );
}
