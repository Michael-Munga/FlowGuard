"use client";

import React from "react";
import { RoleSidebar } from "@/components/Navigation/RoleSidebar";

interface AppSidebarProps {
  activeDashboard?: string;
  onSelectDashboard?: (id: string) => void;
  activeInterventionsCount?: number;
}

/**
 * AppSidebar now delegates dynamically to RoleSidebar to enforce the
 * fundamental role-based navigation rule:
 * No universal flat sidebar; each role displays only its own workspace navigation.
 */
export const AppSidebar: React.FC<AppSidebarProps> = () => {
  return <RoleSidebar />;
};
