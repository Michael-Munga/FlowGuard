"use client";

import React, { useState } from "react";
import {
  Calendar,
  Building,
  AlertTriangle,
  RotateCw,
  Download,
  Check,
  ChevronDown,
} from "lucide-react";

interface FilterBarProps {
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  depotFilter: string;
  onDepotFilterChange: (val: string) => void;
  riskFilter: string;
  onRiskFilterChange: (val: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  dateFilter,
  onDateFilterChange,
  depotFilter,
  onDepotFilterChange,
  riskFilter,
  onRiskFilterChange,
  onRefresh,
  onExport,
  isExporting = false,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportClick = () => {
    onExport();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-6 bg-[#FAFBFC] border-b border-[#E2E6EA]">
      {/* Dropdown Filters & Quick Refresh */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Filter Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E6EA] rounded-md text-xs font-medium text-[#0F1B2B] shadow-2xs hover:border-[#cbd5e1] transition-colors">
            <Calendar className="w-3.5 h-3.5 text-[#5C6B7A]" />
            <select
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#0F1B2B] focus:outline-none cursor-pointer pr-1"
            >
              <option value="Today">Today (Shift B)</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Shift A">Shift A (Morning)</option>
              <option value="Last 24h">Last 24 Hours</option>
            </select>
          </div>
        </div>

        {/* Depot Filter Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E6EA] rounded-md text-xs font-medium text-[#0F1B2B] shadow-2xs hover:border-[#cbd5e1] transition-colors">
            <Building className="w-3.5 h-3.5 text-[#5C6B7A]" />
            <select
              value={depotFilter}
              onChange={(e) => onDepotFilterChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#0F1B2B] focus:outline-none cursor-pointer pr-1"
            >
              <option value="All Depots">All Depots (5)</option>
              <option value="Nairobi Terminal (NBO)">Nairobi Terminal (NBO)</option>
              <option value="Mombasa Terminal (MBS)">Mombasa Terminal (MBS)</option>
              <option value="Kisumu Depot (KSM)">Kisumu Depot (KSM)</option>
              <option value="Eldoret Depot (ELD)">Eldoret Depot (ELD)</option>
              <option value="Nakuru Depot (NKR)">Nakuru Depot (NKR)</option>
            </select>
          </div>
        </div>

        {/* Risk Filter Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E6EA] rounded-md text-xs font-medium text-[#0F1B2B] shadow-2xs hover:border-[#cbd5e1] transition-colors">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />
            <select
              value={riskFilter}
              onChange={(e) => onRiskFilterChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#0F1B2B] focus:outline-none cursor-pointer pr-1"
            >
              <option value="All Risks">All Risks</option>
              <option value="Critical Only">Critical Only (Score ≥ 80)</option>
              <option value="At Risk">At Risk (Score 50–79)</option>
              <option value="On Track">On Track (Score &lt; 50)</option>
            </select>
          </div>
        </div>

        {/* Inline Refresh Icon */}
        <button
          onClick={onRefresh}
          className="p-1.5 text-[#5C6B7A] hover:text-[#0F1B2B] hover:bg-white bg-transparent border border-[#E2E6EA] rounded-md transition-colors shadow-2xs"
          title="Refresh Filter Parameters"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Aligned: Red Export Report Button */}
      <div>
        <button
          onClick={handleExportClick}
          disabled={isExporting}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#C0392B] hover:bg-[#a93226] active:scale-98 rounded-md transition-all shadow-xs disabled:opacity-75"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Report Downloaded</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
