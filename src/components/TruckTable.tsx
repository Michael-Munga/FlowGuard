"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  AlertCircle,
  Clock,
  MapPin,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Truck, RiskStatus } from "@/types/dashboard";

interface TruckTableProps {
  trucks: Truck[];
  selectedTruckId: string | null;
  onSelectTruck: (truck: Truck) => void;
  activeTabFilter: "All" | "At Risk" | "Critical";
  onTabFilterChange: (tab: "All" | "At Risk" | "Critical") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TruckTable: React.FC<TruckTableProps> = ({
  trucks,
  selectedTruckId,
  onSelectTruck,
  activeTabFilter,
  onTabFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Format dwell minutes into hours and minutes
  const formatDwell = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins > 0 ? `${mins}m` : ""}`;
    }
    return `${mins}m`;
  };

  // Status Badge Helper
  const renderStatusBadge = (status: RiskStatus) => {
    switch (status) {
      case "ON TRACK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-[#1B7A3D] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A3D]" />
            ON TRACK
          </span>
        );
      case "AT RISK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-50 text-[#B7791F] border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F]" />
            AT RISK
          </span>
        );
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-rose-50 text-[#C0392B] border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
            CRITICAL
          </span>
        );
    }
  };

  // Risk Score Color Helper
  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-[#C0392B]";
    if (score >= 50) return "text-[#B7791F]";
    return "text-[#1B7A3D]";
  };

  // Filtered trucks
  const filteredTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      // Tab filter
      if (activeTabFilter === "At Risk" && truck.status !== "AT RISK" && truck.status !== "CRITICAL") {
        return false;
      }
      if (activeTabFilter === "Critical" && truck.status !== "CRITICAL") {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesReg = truck.registration.toLowerCase().includes(q);
        const matchesDepot = truck.depot.toLowerCase().includes(q);
        const matchesOmc = truck.omc.toLowerCase().includes(q);
        const matchesProd = truck.product.toLowerCase().includes(q);
        if (!matchesReg && !matchesDepot && !matchesOmc && !matchesProd) {
          return false;
        }
      }
      return true;
    });
  }, [trucks, activeTabFilter, searchQuery]);

  // Counts for tabs
  const atRiskCount = useMemo(
    () => trucks.filter((t) => t.status === "AT RISK" || t.status === "CRITICAL").length,
    [trucks]
  );
  const criticalCount = useMemo(
    () => trucks.filter((t) => t.status === "CRITICAL").length,
    [trucks]
  );

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTrucks.length / pageSize));
  const paginatedTrucks = filteredTrucks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-lg border border-[#E2E6EA] shadow-xs flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#E2E6EA]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F1B2B] tracking-tight">
                Live Truck Operations
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {trucks.length} trucks active
              </span>
            </div>
            <p className="text-xs text-[#5C6B7A] mt-0.5">
              Real-time terminal transit, bay allocation, and dynamic dwell-risk index
            </p>
          </div>
        </div>

        {/* Filter / Search Bar Inside Panel */}
        <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Internal Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#8492A6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter by reg, depot, OMC..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAFBFC] border border-[#E2E6EA] rounded-md text-[#0F1B2B] placeholder-[#8492A6] focus:outline-none focus:ring-1 focus:ring-[#1B7A3D]"
            />
          </div>

          {/* Tab Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-md border border-[#E2E6EA] self-start sm:self-auto">
            <button
              onClick={() => onTabFilterChange("All")}
              className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                activeTabFilter === "All"
                  ? "bg-white text-[#0F1B2B] font-semibold shadow-xs"
                  : "text-[#5C6B7A] hover:text-[#0F1B2B]"
              }`}
            >
              <span>All</span>
              <span className="text-[10px] px-1.5 py-0.1 bg-slate-200 rounded-full font-bold">
                {trucks.length}
              </span>
            </button>

            <button
              onClick={() => onTabFilterChange("At Risk")}
              className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                activeTabFilter === "At Risk"
                  ? "bg-white text-[#B7791F] font-semibold shadow-xs"
                  : "text-[#5C6B7A] hover:text-[#0F1B2B]"
              }`}
            >
              <span>At Risk</span>
              <span className="text-[10px] px-1.5 py-0.1 bg-amber-100 text-[#B7791F] rounded-full font-bold">
                {atRiskCount}
              </span>
            </button>

            <button
              onClick={() => onTabFilterChange("Critical")}
              className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                activeTabFilter === "Critical"
                  ? "bg-white text-[#C0392B] font-semibold shadow-xs"
                  : "text-[#5C6B7A] hover:text-[#0F1B2B]"
              }`}
            >
              <span>Critical</span>
              <span className="text-[10px] px-1.5 py-0.1 bg-rose-100 text-[#C0392B] rounded-full font-bold">
                {criticalCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E6EA] bg-[#FAFBFC] text-[11px] font-semibold uppercase tracking-wider text-[#5C6B7A]">
              <th className="py-2.5 px-4">Truck ID</th>
              <th className="py-2.5 px-3">Depot</th>
              <th className="py-2.5 px-3">OMC</th>
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3">Stage</th>
              <th className="py-2.5 px-3">Dwell</th>
              <th className="py-2.5 px-3">ETA</th>
              <th className="py-2.5 px-3 text-right">Risk</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EA] text-xs">
            {paginatedTrucks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#5C6B7A]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-[#8492A6]" />
                    <p className="font-medium">No trucks matching criteria</p>
                    <button
                      onClick={() => {
                        onTabFilterChange("All");
                        onSearchChange("");
                      }}
                      className="text-xs text-[#1B7A3D] underline font-semibold hover:text-[#145d2e]"
                    >
                      Reset filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTrucks.map((truck) => {
                const isSelected = selectedTruckId === truck.id;
                const borderHighlight =
                  truck.status === "CRITICAL"
                    ? "border-l-4 border-l-[#C0392B] bg-rose-50/20"
                    : truck.status === "AT RISK"
                    ? "border-l-4 border-l-[#B7791F] bg-amber-50/20"
                    : "border-l-4 border-l-[#1B7A3D] bg-emerald-50/20";

                return (
                  <tr
                    key={truck.id}
                    onClick={() => onSelectTruck(truck)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? `${borderHighlight} shadow-2xs font-medium`
                        : "hover:bg-[#F8FAFC] border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Truck ID */}
                    <td className="py-3 px-4 font-bold font-mono text-[#0F1B2B] text-xs tracking-tight">
                      <div className="flex items-center gap-1.5">
                        <span>{truck.registration}</span>
                        {truck.delayNotice && (
                          <span className="text-[10px] text-amber-600 font-sans hidden md:inline">
                            ⚠️
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Depot */}
                    <td className="py-3 px-3 text-[#0F1B2B] whitespace-nowrap">
                      <div className="truncate max-w-[130px]" title={truck.depot}>
                        {truck.depot.replace(/\s*\(.*?\)\s*/g, "")}
                      </div>
                    </td>

                    {/* OMC */}
                    <td className="py-3 px-3 text-[#0F1B2B] whitespace-nowrap">
                      <div className="truncate max-w-[130px]" title={truck.omc}>
                        {truck.omc}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-3 px-3 text-[#5C6B7A] whitespace-nowrap">
                      <div className="truncate max-w-[120px]" title={truck.product}>
                        {truck.product.split("-")[0].trim()}
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                        {truck.stage}
                      </span>
                    </td>

                    {/* Dwell */}
                    <td className="py-3 px-3 font-mono text-[#5C6B7A] whitespace-nowrap">
                      {formatDwell(truck.dwellMinutes)}
                    </td>

                    {/* ETA */}
                    <td className="py-3 px-3 font-mono text-[#0F1B2B] whitespace-nowrap">
                      {truck.eta}
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-xs ${getRiskScoreColor(
                          truck.riskScore
                        )}`}
                      >
                        {truck.riskScore}
                      </span>
                      <span className="text-[10px] text-[#8492A6]">/100</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {renderStatusBadge(truck.status)}
                    </td>

                    {/* Action Icon */}
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex p-1 rounded hover:bg-slate-200 text-[#8492A6] group-hover:text-[#0F1B2B] transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 px-4 border-t border-[#E2E6EA] bg-[#FAFBFC] flex items-center justify-between text-xs text-[#5C6B7A]">
        <div>
          Showing{" "}
          <span className="font-semibold text-[#0F1B2B]">
            {filteredTrucks.length > 0
              ? `${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  filteredTrucks.length
                )}`
              : 0}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#0F1B2B]">
            {filteredTrucks.length}
          </span>{" "}
          synchronized records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded bg-white border border-[#E2E6EA] text-[#0F1B2B] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Previous
          </button>
          <span className="px-2 font-medium text-[#0F1B2B]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded bg-white border border-[#E2E6EA] text-[#0F1B2B] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
