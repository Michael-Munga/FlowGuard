"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DemoRoleId, RoleConfig, ROLES_CONFIG, getRoleFromPath } from "@/types/navigation";
import { DepotId } from "@/types/flowguard";

interface RoleContextValue {
  activeRole: RoleConfig;
  activeRoleId: DemoRoleId;
  selectedDepotId: DepotId;
  selectedOmcId: string;
  isRoleSwitcherOpen: boolean;
  switchRole: (roleId: DemoRoleId) => void;
  setSelectedDepotId: (depotId: DepotId) => void;
  setSelectedOmcId: (omcId: string) => void;
  setIsRoleSwitcherOpen: (isOpen: boolean) => void;
  toggleRoleSwitcher: () => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() || "/";
  const router = useRouter();

  // Derive role dynamically from path to ensure URL is source of truth on refresh
  const [activeRole, setActiveRole] = useState<RoleConfig>(() => getRoleFromPath(pathname));
  const [selectedDepotId, setSelectedDepotId] = useState<DepotId>("nairobi");
  const [selectedOmcId, setSelectedOmcId] = useState<string>("vivo");
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Sync role state whenever pathname changes
  useEffect(() => {
    const roleFromUrl = getRoleFromPath(pathname);
    setActiveRole(roleFromUrl);
  }, [pathname]);

  // Switch role and navigate to its default landing route
  const switchRole = useCallback(
    (roleId: DemoRoleId) => {
      const targetRole = ROLES_CONFIG[roleId];
      if (!targetRole) return;

      setActiveRole(targetRole);
      setIsRoleSwitcherOpen(false);
      router.push(targetRole.defaultRoute);
    },
    [router]
  );

  const toggleRoleSwitcher = useCallback(() => {
    setIsRoleSwitcherOpen((prev) => !prev);
  }, []);

  const value: RoleContextValue = {
    activeRole,
    activeRoleId: activeRole.id,
    selectedDepotId,
    selectedOmcId,
    isRoleSwitcherOpen,
    switchRole,
    setSelectedDepotId,
    setSelectedOmcId,
    setIsRoleSwitcherOpen,
    toggleRoleSwitcher,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
