"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  Sliders,
  Zap,
  BellRing,
  Navigation,
  BarChart3,
  Settings,
  ShieldCheck,
  Fuel,
} from "lucide-react";
import { NavTab } from "@/types/dashboard";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  criticalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  criticalCount = 2,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "command-centre",
      label: "Command Centre",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "omc-monitoring",
      label: "OMC Monitoring",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "executive-control",
      label: "Executive Control Plane",
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: "live-interventions",
      label: "Live Interventions",
      icon: <Zap className="w-4 h-4" />,
      badge: criticalCount > 0 ? criticalCount : undefined,
    },
    {
      id: "alerts-escalations",
      label: "Alerts & Escalations",
      icon: <BellRing className="w-4 h-4" />,
    },
    {
      id: "fleet-tracking",
      label: "Fleet Tracking",
      icon: <Navigation className="w-4 h-4" />,
    },
    {
      id: "analytics-reports",
      label: "Analytics & Reports",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      className="w-[230px] flex-shrink-0 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none border-r border-[#152234]"
      style={{ backgroundColor: "#0B1420" }}
    >
      {/* Top Brand Header */}
      <div className="p-4 border-b border-[#152234]">
        <div className="flex items-center gap-2.5">
          {/* Logo Mark */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: "#1B7A3D" }}
          >
            <Fuel className="w-4 h-4 text-white" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-sm tracking-tight truncate">
                KAFDO SYSTEM
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#1B7A3D]/20 text-[#3DAA63] border border-[#1B7A3D]/30 tracking-wider">
                DEMO
              </span>
            </div>
            <span className="text-[11px] text-[#8492A6] truncate font-medium">
              Autonomous Dispatch v4.2
            </span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-3 px-2 overflow-y-auto dark-scrollbar space-y-1">
        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#5C6B7A]">
          Operations Core
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all text-left group ${
                isActive
                  ? "text-white shadow-sm font-semibold"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#152234]/70"
              }`}
              style={{
                backgroundColor: isActive ? "#1B7A3D" : "transparent",
              }}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className={`${
                    isActive
                      ? "text-white"
                      : "text-[#64748B] group-hover:text-[#94A3B8]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#C0392B] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Status & User Row */}
      <div className="p-3 border-t border-[#152234] bg-[#070D15]/80 space-y-2.5">
        {/* System Status Row */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#0F1B2B]/60 border border-[#152234]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DAA63] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B7A3D]"></span>
            </span>
            <span className="text-[11px] text-[#A0AEC0] truncate font-medium">
              System Nominal
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#3DAA63]">
            99.98%
          </span>
        </div>

        {/* Current User Row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#152234] flex items-center justify-center border border-[#243447] text-[#3DAA63]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-white font-medium truncate">
                Operations Admin
              </span>
              <span className="text-[10px] text-[#64748B] truncate">
                EMB-88 Shift Lead
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectTab("settings")}
            className="p-1 rounded text-[#64748B] hover:text-white hover:bg-[#152234] transition-colors"
            title="User & System Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
