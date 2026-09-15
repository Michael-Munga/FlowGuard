"use client";

import React from "react";
import { Home, Truck, Bell, MoreHorizontal } from "lucide-react";
import { DriverTab } from "./types";

interface DriverBottomNavProps {
  activeTab: DriverTab;
  onSelectTab: (tab: DriverTab) => void;
  unreadUpdatesCount: number;
}

export const DriverBottomNav: React.FC<DriverBottomNavProps> = ({
  activeTab,
  onSelectTab,
  unreadUpdatesCount,
}) => {
  const tabs: { id: DriverTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "HOME",
      label: "Home",
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: "COLLECTION",
      label: "Collection",
      icon: <Truck className="w-5 h-5" />,
    },
    {
      id: "UPDATES",
      label: "Updates",
      icon: <Bell className="w-5 h-5" />,
      badge: unreadUpdatesCount > 0 ? unreadUpdatesCount : undefined,
    },
    {
      id: "MORE",
      label: "More",
      icon: <MoreHorizontal className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Driver primary mobile navigation"
      className="bg-[#0B1420] border-t border-slate-800 grid grid-cols-4 p-1.5 sticky bottom-0 z-30 shrink-0 shadow-2xl safe-area-pb"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectTab(tab.id)}
            className={`relative py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
              isActive
                ? "text-white font-bold bg-[#1B7A3D]/25 border border-[#1B7A3D]/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <div className="relative">
              <span className={isActive ? "text-emerald-400 scale-105 transition-transform" : ""}>
                {tab.icon}
              </span>
              {tab.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center font-mono">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] tracking-tight ${
                isActive ? "text-emerald-300 font-bold" : "font-normal"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
