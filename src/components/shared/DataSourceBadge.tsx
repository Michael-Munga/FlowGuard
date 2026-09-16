"use client";

import React from "react";
import { useDataSource } from "@/context/DataSourceContext";

interface DataSourceBadgeProps {
  className?: string;
  showDetails?: boolean;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  className = "",
  showDetails = true,
}) => {
  const { dataMode, isApiConnected, isApiLoading, lastSyncTime, retryConnection } = useDataSource();

  if (dataMode === "synthetic") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-950/40 border-amber-800/60 text-amber-300 shadow-sm ${className}`}
        title="Running in synthetic demonstration mode (NEXT_PUBLIC_FLOWGUARD_DATA_MODE=synthetic)"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>DEMO MODE · Synthetic Data</span>
      </div>
    );
  }

  if (isApiLoading) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-950/40 border-blue-800/60 text-blue-300 shadow-sm ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
        <span>CONNECTING · FastAPI Backend</span>
      </div>
    );
  }

  if (isApiConnected) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-950/40 border-emerald-700/60 text-emerald-300 shadow-sm ${className}`}
        title="Live PostgreSQL-backed FastAPI service operational"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-semibold tracking-wide">LIVE DATA</span>
        <span className="text-emerald-500/80">·</span>
        <span className="text-emerald-400 font-normal">Backend connected</span>
        {showDetails && lastSyncTime && (
          <span className="text-[10px] text-emerald-500/80 hidden sm:inline">
            ({lastSyncTime.toLocaleTimeString()})
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-rose-950/40 border-rose-800/60 text-rose-300 shadow-sm ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-rose-500" />
      <span className="font-semibold">LIVE DATA UNAVAILABLE</span>
      <button
        type="button"
        onClick={retryConnection}
        className="ml-1 text-[11px] underline hover:text-rose-200 focus:outline-none"
      >
        Retry
      </button>
    </div>
  );
};
