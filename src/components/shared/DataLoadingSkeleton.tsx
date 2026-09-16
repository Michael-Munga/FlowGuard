"use client";

import React from "react";

interface DataLoadingSkeletonProps {
  type?: "kpi" | "table" | "card";
  count?: number;
  className?: string;
}

export const DataLoadingSkeleton: React.FC<DataLoadingSkeletonProps> = ({
  type = "kpi",
  count = 4,
  className = "",
}) => {
  if (type === "kpi") {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur animate-pulse"
          >
            <div className="h-3 w-24 bg-slate-700/60 rounded mb-3" />
            <div className="h-7 w-32 bg-slate-600/70 rounded mb-2" />
            <div className="h-2.5 w-40 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 ${className}`}>
        <div className="h-6 w-48 bg-slate-700/60 rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/60 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse ${className}`}>
      <div className="h-5 w-36 bg-slate-700/60 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-800/80 rounded" />
        <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
        <div className="h-4 w-4/6 bg-slate-800/40 rounded" />
      </div>
    </div>
  );
};
