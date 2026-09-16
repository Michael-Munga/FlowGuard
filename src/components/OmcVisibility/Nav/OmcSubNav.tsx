"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Clock,
  Bell,
  LayoutDashboard,
  FileText,
} from "lucide-react";

export type OmcSubView =
  | "overview"
  | "orders"
  | "outlook"
  | "notifications"
  | "reports";

interface NavItem {
  id: OmcSubView;
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
    subLabel: "Collection summary",
    href: "/omc/overview",
    match: (p) => p.startsWith("/omc/overview"),
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "orders",
    label: "My Orders",
    subLabel: "Active collections",
    href: "/omc/orders",
    match: (p) => p.startsWith("/omc/orders"),
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    id: "outlook",
    label: "Outlook",
    subLabel: "Expected turnaround",
    href: "/omc/outlook",
    match: (p) => p.startsWith("/omc/outlook"),
    icon: <Clock className="w-4 h-4" />,
  },
  {
    id: "notifications",
    label: "Notifications",
    subLabel: "Updates & acks",
    href: "/omc/notifications",
    match: (p) => p.startsWith("/omc/notifications"),
    icon: <Bell className="w-4 h-4" />,
  },
  {
    id: "reports",
    label: "Reports",
    subLabel: "Generate & export",
    href: "/omc/reports",
    match: (p) => p.startsWith("/omc/reports"),
    icon: <FileText className="w-4 h-4" />,
  },
];

export const OmcSubNav: React.FC = () => {
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
                  active
                    ? "text-[#1B7A3D]"
                    : "text-slate-400 group-hover:text-slate-600"
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