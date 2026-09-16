"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { DepotId } from "@/types/flowguard";
import {
  LayoutDashboard,
  Building,
  Briefcase,
  Sliders,
  TrendingUp,
  Smartphone,
  Truck,
  Cpu,
  Zap,
  AlertTriangle,
  ClipboardList,
  Clock,
  Bell,
  Activity,
  History,
  Radio,
  Award,
  BarChart3,
  DollarSign,
  CheckSquare,
  ChevronDown,
  ShieldCheck,
  Layers,
  Fuel,
  FileText,
} from "lucide-react";

export const RoleSidebar: React.FC = () => {
  const {
    activeRole,
    selectedDepotId,
    setSelectedDepotId,
    selectedOmcId,
    setSelectedOmcId,
  } = useRole();

  const pathname = usePathname() || "";

  // Render navigation icon dynamically
  const renderNavIcon = (iconName: string, isCurrent: boolean) => {
    const className = `w-4 h-4 shrink-0 transition-colors ${
      isCurrent ? "text-white" : "text-slate-400 group-hover:text-slate-200"
    }`;

    switch (iconName) {
      case "LayoutDashboard":
        return <LayoutDashboard className={className} />;
      case "Building":
        return <Building className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "AlertTriangle":
        return <AlertTriangle className={className} />;
      case "Truck":
        return <Truck className={className} />;
      case "Cpu":
        return <Cpu className={className} />;
      case "Sliders":
        return <Sliders className={className} />;
      case "ClipboardList":
        return <ClipboardList className={className} />;
      case "Clock":
        return <Clock className={className} />;
      case "Bell":
        return <Bell className={className} />;
      case "Activity":
        return <Activity className={className} />;
      case "History":
        return <History className={className} />;
      case "Radio":
        return <Radio className={className} />;
      case "Award":
        return <Award className={className} />;
      case "BarChart3":
        return <BarChart3 className={className} />;
      case "DollarSign":
        return <DollarSign className={className} />;
      case "CheckSquare":
        return <CheckSquare className={className} />;
      case "FileText":
        return <FileText className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  const depots: { id: DepotId; name: string; code: string }[] = [
    { id: "nairobi", name: "Nairobi Terminal", code: "PS10" },
    { id: "mombasa", name: "Mombasa Terminal", code: "KOT-PS1" },
    { id: "nakuru", name: "Nakuru Depot", code: "PS25" },
    { id: "eldoret", name: "Eldoret Depot", code: "PS27" },
    { id: "kisumu", name: "Kisumu Depot", code: "PS28" },
  ];

  const omcs = [
    { id: "vivo", name: "Vivo Energy (Shell)" },
    { id: "total", name: "TotalEnergies Kenya" },
    { id: "rubis", name: "Rubis Energy Kenya" },
    { id: "ola", name: "Ola Energy Kenya" },
    { id: "hass", name: "Hass Petroleum" },
    { id: "petrocity", name: "Petrocity Enterprises" },
  ];

  return (
    <aside
      className="w-[240px] flex-shrink-0 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none border-r border-[#152234]"
      style={{ backgroundColor: "#0B1420" }}
    >
      {/* Brand & Active Workspace Header */}
      <div>
        <div className="p-4 border-b border-[#152234]">
          <Link href="/login" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#1B7A3D] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Fuel className="w-4 h-4" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-sm tracking-tight truncate">
                  KPC FlowGuard
                </span>
                <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#1B7A3D]/20 text-[#3DAA63] border border-[#1B7A3D]/30 font-mono">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-[#8492A6] truncate font-medium">
                {activeRole.name}
              </span>
            </div>
          </Link>
        </div>

        {/* Depot Context Selector */}
        {activeRole.contextType === "depot" && (
          <div className="p-2.5 mx-2.5 mt-2.5 rounded-lg bg-[#070D15] border border-[#1C2C42]">
            <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block mb-1">
              Active Terminal Context
            </span>
            <div className="relative">
              <select
                value={selectedDepotId}
                onChange={(e) => setSelectedDepotId(e.target.value as DepotId)}
                className="w-full bg-[#0F1B2B] text-white text-xs font-semibold rounded border border-[#243447] px-2.5 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#1B7A3D]"
              >
                {depots.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* OMC Context Selector */}
        {activeRole.contextType === "omc" && (
          <div className="p-2.5 mx-2.5 mt-2.5 rounded-lg bg-[#070D15] border border-[#1C2C42]">
            <span className="text-[9px] font-mono uppercase text-amber-400 font-bold block mb-1">
              Customer OMC Context
            </span>
            <div className="relative">
              <select
                value={selectedOmcId}
                onChange={(e) => setSelectedOmcId(e.target.value)}
                className="w-full bg-[#0F1B2B] text-white text-xs font-semibold rounded border border-[#243447] px-2.5 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                {omcs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Role-Specific Navigation Rail */}
        <div className="p-2.5 space-y-1">
          <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#5C6B7A] font-mono">
            {activeRole.badge} Screens
          </div>

          {activeRole.navItems.map((item) => {
            const isCurrent =
              pathname === item.route ||
              pathname.startsWith(item.route + "/") ||
              (pathname === "/" && item.route === activeRole.defaultRoute);

            return (
              <Link
                key={item.id}
                href={item.route}
                className={`w-full flex flex-col p-2.5 rounded-md transition-all text-left group cursor-pointer ${
                  isCurrent
                    ? "bg-[#1B7A3D] text-white shadow-xs font-semibold"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#152234]/70"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {renderNavIcon(item.iconName, isCurrent)}
                    <span className="text-xs font-medium truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        isCurrent
                          ? "bg-white/20 text-white"
                          : item.badge.includes("Active") || item.badge.includes("MILP")
                          ? "bg-[#C0392B] text-white"
                          : "bg-[#152234] text-[#8492A6] border border-[#243447]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {item.description && (
                  <span
                    className={`text-[10px] mt-0.5 truncate pl-6.5 ${
                      isCurrent ? "text-emerald-100 font-normal" : "text-[#5C6B7A]"
                    }`}
                  >
                    {item.description}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Status & Heartbeat */}
      <div className="p-3 border-t border-[#152234] bg-[#070D15]/90 space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#0F1B2B]/70 border border-[#152234]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DAA63] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B7A3D]"></span>
            </span>
            <span className="text-[10px] text-[#A0AEC0] truncate font-medium font-mono">
              Shared Operational Hub
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold text-[#3DAA63] uppercase">
            SYNCED
          </span>
        </div>

        <div className="text-[9px] text-[#64748B] text-center font-mono">
          FlowGuard Control Plane • 5 Terminals
        </div>
      </div>
    </aside>
  );
};