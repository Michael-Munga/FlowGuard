"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { ROLES_CONFIG, DemoRoleId } from "@/types/navigation";
import {
  Fuel,
  LayoutDashboard,
  Building,
  Briefcase,
  Sliders,
  TrendingUp,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Radio,
  Zap,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function LoginPage() {
  const { switchRole } = useRole();
  const router = useRouter();

  const rolesList: DemoRoleId[] = [
    "operations",
    "depot",
    "omc",
    "engineer",
    "executive",
    "driver",
  ];

  const getRoleIcon = (id: DemoRoleId) => {
    switch (id) {
      case "operations":
        return <LayoutDashboard className="w-6 h-6 text-emerald-400" />;
      case "depot":
        return <Building className="w-6 h-6 text-blue-400" />;
      case "omc":
        return <Briefcase className="w-6 h-6 text-amber-400" />;
      case "engineer":
        return <Sliders className="w-6 h-6 text-indigo-400" />;
      case "executive":
        return <TrendingUp className="w-6 h-6 text-purple-400" />;
      case "driver":
        return <Smartphone className="w-6 h-6 text-teal-400" />;
    }
  };

  const handleSelectRole = (roleId: DemoRoleId) => {
    switchRole(roleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070D15] via-[#0B1420] to-[#0F1B2B] text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B7A3D] text-white flex items-center justify-center shadow-md">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                KPC FLOWGUARD
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1B7A3D]/30 text-[#3DAA63] border border-[#1B7A3D]/50 uppercase">
                DEMO GATEWAY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Dynamic Route &amp; Demurrage Prevention Control Plane
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#152234] border border-[#243447] text-xs font-mono text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B7A3D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B7A3D]"></span>
          </span>
          <span>5 Terminals Connected</span>
        </div>
      </header>

      {/* Main Role Selection Area */}
      <main className="max-w-6xl w-full mx-auto my-8 space-y-8">
        {/* Title & Introduction */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Select Operational Demo Workspace
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            FlowGuard enforces role-bounded operational workspaces. Select a persona below to experience the platform from that user&apos;s perspective.
          </p>
        </div>

        {/* 6 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rolesList.map((roleId) => {
            const role = ROLES_CONFIG[roleId];

            return (
              <div
                key={roleId}
                onClick={() => handleSelectRole(roleId)}
                className="p-6 rounded-xl bg-[#0F1B2B]/90 border border-[#1C2C42] hover:border-[#1B7A3D] transition-all duration-200 hover:shadow-lg hover:shadow-emerald-950/30 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
              >
                {/* Accent Top Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1B7A3D]/40 to-transparent group-hover:via-[#1B7A3D] transition-all" />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#152234] border border-[#243447] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-emerald-500/50 transition-all">
                      {getRoleIcon(roleId)}
                    </div>

                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                      {role.badge}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                    {role.name}
                  </h2>

                  <p className="text-xs font-semibold text-emerald-400/90 mt-1 leading-snug">
                    {role.purpose}
                  </p>

                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-500">
                    {role.defaultRoute}
                  </span>

                  <div className="flex items-center gap-1 font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Launch Presets */}
        <div className="p-4 rounded-lg bg-[#0F1B2B]/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Fast Demo Presets:</span>
            <span>Jump straight into high-stakes demonstration corridors:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSelectRole("operations")}
              className="px-3 py-1 rounded bg-[#152234] hover:bg-[#1C2C42] text-slate-200 border border-slate-700 transition-all cursor-pointer font-medium"
            >
              Central Ops (EMB-88)
            </button>
            <button
              onClick={() => handleSelectRole("depot")}
              className="px-3 py-1 rounded bg-[#152234] hover:bg-[#1C2C42] text-slate-200 border border-slate-700 transition-all cursor-pointer font-medium"
            >
              Nairobi PS10 Yard
            </button>
            <button
              onClick={() => handleSelectRole("executive")}
              className="px-3 py-1 rounded bg-[#152234] hover:bg-[#1C2C42] text-slate-200 border border-slate-700 transition-all cursor-pointer font-medium"
            >
              Boardroom ROI
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Legal / Enterprise Notice */}
      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Kenya Pipeline Company Limited • Operational Technology Control Sub-System</span>
        </div>
        <span>EPRA Regulatory Baseline • TSA Demurrage Model</span>
      </footer>
    </div>
  );
}
