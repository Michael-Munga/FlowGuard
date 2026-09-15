"use client";

import React, { useRef, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { ROLES_CONFIG, DemoRoleId } from "@/types/navigation";
import {
  LayoutDashboard,
  Building,
  Briefcase,
  Sliders,
  TrendingUp,
  Smartphone,
  ChevronDown,
  Check,
  Shield,
  Layers,
} from "lucide-react";

export const RoleSwitcher: React.FC = () => {
  const {
    activeRole,
    activeRoleId,
    switchRole,
    isRoleSwitcherOpen,
    setIsRoleSwitcherOpen,
    toggleRoleSwitcher,
  } = useRole();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleSwitcherOpen(false);
      }
    }
    if (isRoleSwitcherOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRoleSwitcherOpen, setIsRoleSwitcherOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isRoleSwitcherOpen) {
        setIsRoleSwitcherOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRoleSwitcherOpen, setIsRoleSwitcherOpen]);

  const getRoleIcon = (id: DemoRoleId) => {
    switch (id) {
      case "operations":
        return <LayoutDashboard className="w-4 h-4 text-emerald-400" />;
      case "depot":
        return <Building className="w-4 h-4 text-blue-400" />;
      case "omc":
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case "engineer":
        return <Sliders className="w-4 h-4 text-indigo-400" />;
      case "executive":
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case "driver":
        return <Smartphone className="w-4 h-4 text-teal-400" />;
    }
  };

  const rolesList: DemoRoleId[] = [
    "operations",
    "depot",
    "omc",
    "engineer",
    "executive",
    "driver",
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleRoleSwitcher}
        aria-expanded={isRoleSwitcherOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#152234] hover:bg-[#1C2C42] border border-[#243447] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#1B7A3D]"
        title="Switch Operational Persona / Demo Role"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-normal">Viewing as:</span>
          <div className="flex items-center gap-1.5 font-bold text-white">
            {getRoleIcon(activeRoleId)}
            <span>{activeRole.name}</span>
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isRoleSwitcherOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isRoleSwitcherOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-80 rounded-lg bg-[#0F1B2B] border border-[#243447] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-[#070D15] border-b border-[#152234] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                Select Operational Persona
              </span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              HACKATHON DEMO
            </span>
          </div>

          {/* Role Items List */}
          <div className="p-1.5 space-y-1">
            {rolesList.map((roleId) => {
              const role = ROLES_CONFIG[roleId];
              const isCurrent = roleId === activeRoleId;

              return (
                <button
                  key={roleId}
                  role="menuitem"
                  onClick={() => switchRole(roleId)}
                  className={`w-full text-left p-2.5 rounded-md transition-all flex items-start gap-3 group cursor-pointer ${
                    isCurrent
                      ? "bg-[#1B7A3D]/20 border border-[#1B7A3D]/40 text-white"
                      : "hover:bg-[#152234] text-slate-300 border border-transparent"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? "bg-[#1B7A3D] text-white"
                        : "bg-[#152234] text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {getRoleIcon(roleId)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            isCurrent ? "text-white" : "text-slate-200 group-hover:text-white"
                          }`}
                        >
                          {role.name}
                        </span>
                        {role.id === "driver" && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            MOBILE
                          </span>
                        )}
                      </div>

                      {isCurrent && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {role.purpose}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                      Destination: {role.defaultRoute}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="px-3 py-2 bg-[#070D15]/80 border-t border-[#152234] text-[10px] text-slate-400 flex items-center justify-between">
            <span>State preserved across roles</span>
            <span className="font-mono text-emerald-400 font-semibold">SYNCHRONIZED</span>
          </div>
        </div>
      )}
    </div>
  );
};
