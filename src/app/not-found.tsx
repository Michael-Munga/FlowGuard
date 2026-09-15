"use client";

import React from "react";
import Link from "next/link";
import { Fuel, ShieldAlert, ArrowLeft, LayoutDashboard, Building, Lock } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B1420] text-white flex flex-col items-center justify-center p-6 selection:bg-[#1B7A3D] selection:text-white">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#1B7A3D] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#1B7A3D]/20 border border-emerald-400/30">
          <Fuel className="w-8 h-8" />
        </div>

        {/* Error Code & Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>HTTP 404 • ROUTE UNRESOLVED</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Operational Surface Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The requested control plane endpoint does not exist or has been migrated to a role-based workspace.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B7A3D] hover:bg-[#156331] text-white text-sm font-semibold transition-all shadow-md shadow-[#1B7A3D]/25"
          >
            <Building className="w-4 h-4" />
            <span>Select Workspace</span>
          </Link>
          <Link
            href="/operations/network"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#152234] hover:bg-[#1E3048] border border-[#243447] text-slate-200 text-sm font-medium transition-all"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Network Command</span>
          </Link>
        </div>

        {/* SCADA Status */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>KENYA PIPELINE COMPANY • FLOWGUARD SYSTEM BUS</span>
        </div>
      </div>
    </div>
  );
}
