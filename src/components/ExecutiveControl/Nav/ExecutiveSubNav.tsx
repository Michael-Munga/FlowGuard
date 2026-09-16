"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Wallet,
  AlertTriangle,
  FileText,
  Rocket,
} from "lucide-react";

export type ExecutiveSubView =
  | "overview"
  | "performance"
  | "value"
  | "risk"
  | "reports"
  | "readiness";

interface NavItem {
  id: ExecutiveSubView;
  label: string;
  subLabel: string;
  href: string;
  match: (p: string) => boolean;
  icon: React.ReactNode;
}

const items: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    subLabel: "Combined network",
    href: "/executive/overview",
    match: (p) => p.startsWith("/executive/overview"),
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "performance",
    label: "Performance",
    subLabel: "Turnaround · depots",
    href: "/executive/performance",
    match: (p) => p.startsWith("/executive/performance"),
    icon: <Activity className="w-4 h-4" />,
  },
  {
    id: "value",
    label: "Value & ROI",
    subLabel: "Savings · payback",
    href: "/executive/value",
    match: (p) => p.startsWith("/executive/value"),
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    id: "risk",
    label: "Exposure",
    subLabel: "Risk · alerts",
    href: "/executive/risk",
    match: (p) => p.startsWith("/executive/risk"),
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    id: "reports",
    label: "Reports",
    subLabel: "Generate · export",
    href: "/executive/reports",
    match: (p) => p.startsWith("/executive/reports"),
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "readiness",
    label: "Readiness",
    subLabel: "Deploy · trust",
    href: "/executive/readiness",
    match: (p) => p.startsWith("/executive/readiness"),
    icon: <Rocket className="w-4 h-4" />,
  },
];

export const ExecutiveSubNav: React.FC = () => {
  const pathname = usePathname() || "";
  return (
    <nav className="bg-white border-b border-[#E2E6EA] px-6">
      <div className="flex items-center gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
};