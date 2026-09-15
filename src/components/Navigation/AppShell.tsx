"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { RoleSidebar } from "./RoleSidebar";
import { AppHeader } from "./AppHeader";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { activeRole } = useRole();
  const pathname = usePathname() || "";

  const isDriverRoute = pathname.startsWith("/driver") || activeRole.id === "driver";

  // If driver experience, bypass desktop sidebar and render mobile-first layout
  if (isDriverRoute) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFC] text-[#0F1B2B]">
      {/* Role-Specific Navigation Sidebar */}
      <RoleSidebar />

      {/* Main App Content Viewport */}
      <div className="ml-[240px] flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Unified Top Header with Persistent Role Switcher */}
        <AppHeader />

        {/* Dynamic Workspace Content */}
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  );
};
