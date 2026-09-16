"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Layers,
  TrendingUp,
  ListOrdered,
} from "lucide-react";
import { DepotId } from "@/types/flowguard";

interface NavItem {
  id: string;
  label: string;
  subLabel: string;
  href: (depotId: DepotId) => string;
  match: (path: string) => boolean;
  icon: React.ReactNode;
  badge?: string;
}

interface DepotSubNavProps {
  activeDepotId: DepotId;
  activeEventsCount?: number;
}

export const DepotSubNav: React.FC<DepotSubNavProps> = ({
  activeDepotId,
  activeEventsCount = 0,
}) => {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const depotFromUrl = (searchParams.get("depot") as DepotId) || activeDepotId;

  const items: NavItem[] = [
    {
      id: "overview",
      label: "Overview",
      subLabel: "KPI summary",
      href: (d) => `/depot/overview?depot=${d}`,
      match: (p) => p.startsWith("/depot/overview"),
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "live",
      label: "Live Yard",
      subLabel: "3D twin · flow · trucks",
      href: (d) => `/depot/live?depot=${d}`,
      match: (p) => p.startsWith("/depot/live"),
      icon: <Radio className="w-4 h-4" />,
    },
    {
      id: "capacity",
      label: "Capacity",
      subLabel: "Gantry · equipment",
      href: (d) => `/depot/capacity?depot=${d}`,
      match: (p) => p.startsWith("/depot/capacity"),
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: "forecast",
      label: "Forecast",
      subLabel: "90-min pressure",
      href: (d) => `/depot/forecast?depot=${d}`,
      match: (p) => p.startsWith("/depot/forecast"),
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "events",
      label: "Events",
      subLabel: "Audit trail",
      href: (d) => `/depot/events?depot=${d}`,
      match: (p) => p.startsWith("/depot/events"),
      icon: <ListOrdered className="w-4 h-4" />,
      badge: activeEventsCount > 0 ? `${activeEventsCount}` : undefined,
    },
  ];

  return (
    <nav className="bg-white border-b border-[#E2E6EA] px-6">
      <div className="flex items-center gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.id}
              href={item.href(depotFromUrl)}
              className={`group relative flex items-center gap-2.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? "border-[#1B7A3D] text-[#0F1B2B]"
                  : "border-transparent text-[#5C6B7A] hover:text-[#0F1B2B] hover:border-slate-300"
              }`}
            >
              <span
                className={`${
                  active ? "text-[#1B7A3D]" : "text-slate-400 group-hover:text-slate-600"
                }`}
              >
                {item.icon}
              </span>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${
                    active ? "text-[#0F1B2B]" : "text-inherit"
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[10px] text-[#8492A6] font-medium">
                  {item.subLabel}
                </span>
              </div>
              {item.badge && (
                <span className="ml-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};