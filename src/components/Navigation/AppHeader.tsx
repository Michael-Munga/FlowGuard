"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { RoleSwitcher } from "./RoleSwitcher";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";
import {
  Fuel,
  Radio,
  Building,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const AppHeader: React.FC = () => {
  const { activeRole, selectedDepotId, selectedOmcId } = useRole();
  const pathname = usePathname() || "";

  const depotNames: Record<string, string> = {
    nairobi: "Nairobi Terminal (PS10)",
    mombasa: "Mombasa Terminal (KOT / PS1)",
    nakuru: "Nakuru Depot (PS25)",
    eldoret: "Eldoret Depot (PS27)",
    kisumu: "Kisumu Depot & Jetty (PS28)",
  };

  const omcNames: Record<string, string> = {
    vivo: "Vivo Energy (Shell licensee)",
    total: "TotalEnergies Marketing Kenya",
    rubis: "Rubis Energy Kenya",
    ola: "Ola Energy Kenya",
    hass: "Hass Petroleum",
    petrocity: "Petrocity Enterprises",
  };

  // Build clean breadcrumb path
  const currentNavItem = activeRole.navItems.find((item) => item.route === pathname);

  return (
    <header className="h-14 bg-white border-b border-[#E2E6EA] px-6 flex items-center justify-between sticky top-0 z-20 select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left Area: Brand & Workspace Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/login"
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-90 shrink-0"
          title="Return to FlowGuard Demo Role Gateway"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1B7A3D] text-white flex items-center justify-center shadow-xs">
            <Fuel className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#0F1B2B] tracking-tight truncate group-hover:text-[#1B7A3D]">
                KPC FlowGuard
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                v4.2
              </span>
            </div>
            <span className="text-[10px] text-[#5C6B7A] font-medium truncate">
              {activeRole.workspaceTitle}
            </span>
          </div>
        </Link>

        {/* Separator */}
        <span className="text-slate-300 hidden sm:inline">|</span>

        {/* Dynamic Context Pill / Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 min-w-0">
          {activeRole.contextType === "depot" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50/80 border border-blue-200 text-blue-900 text-xs font-semibold">
              <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{depotNames[selectedDepotId] || "Nairobi (PS10)"}</span>
            </div>
          )}

          {activeRole.contextType === "omc" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{omcNames[selectedOmcId] || "Vivo Energy"}</span>
            </div>
          )}

          {currentNavItem && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900 truncate">{currentNavItem.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Area: System Telemetry, Identity Chip & Persistent Role Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* SCADA Telemetry Heartbeat Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAFBFC] border border-[#E2E6EA] text-slate-600 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B7A3D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B7A3D]"></span>
          </span>
          <span className="text-[11px] font-bold text-emerald-800">99.98% NOMINAL</span>
        </div>

        {/* User Identity Chip */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-700 font-medium truncate">
            {activeRole.id === "operations" && "Central Ops (EMB-88)"}
            {activeRole.id === "depot" && "Superintendent (NBO-01)"}
            {activeRole.id === "omc" && "Vivo Logistics (DISP-42)"}
            {activeRole.id === "engineer" && "Control Systems (ENG-09)"}
            {activeRole.id === "executive" && "Leadership Boardroom"}
            {activeRole.id === "driver" && "Driver (KCA 482P)"}
          </span>
        </div>

        {/* Data Source Badge */}
        <DataSourceBadge />

        {/* Persistent Role Switcher */}
        <RoleSwitcher />
      </div>
    </header>
  );
};
