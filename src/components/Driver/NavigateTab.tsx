"use client";

import React from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  AlertCircle,
  Compass,
  Route,
} from "lucide-react";
import { JourneyStageConfig } from "./types";

interface NavigateTabProps {
  currentStage: JourneyStageConfig;
  onOpenReportSheet: () => void;
}

export const NavigateTab: React.FC<NavigateTabProps> = ({
  currentStage,
  onOpenReportSheet,
}) => {
  const handleExternalNavigate = () => {
    window.open(
      "https://maps.google.com/?q=Kenya+Pipeline+Company+Nairobi+Terminal+PS10",
      "_blank"
    );
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#112318] to-[#0F1B2B] border border-emerald-500/40 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">
            KPC Nairobi Terminal (PS10)
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Outer Ring Road, Industrial Area, Nairobi. Follow the signs for the North
          Ingress Gate.
        </p>

        <button
          type="button"
          onClick={handleExternalNavigate}
          className="w-full py-3 px-4 rounded-lg bg-[#1B7A3D] hover:bg-[#1E8A45] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>NAVIGATE TO KPC GATE</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>

      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white">Current Route Guidance</span>
        </div>
        <div className="p-3 rounded-lg bg-[#152234] border border-[#243447] text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Assigned Bay:</span>
            <strong className="text-white font-mono">
              {currentStage.nextActionLocation}
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Route Status:</span>
            <strong className="text-emerald-400 font-mono">
              {currentStage.collectionStatus}
            </strong>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#0F1B2B] border border-[#1C2C42] space-y-3">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-white">Route Notes</span>
        </div>
        <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
          <li>Depot maximum speed: 15 km/h — obey all lane markings.</li>
          <li>Follow green gantry lane markings to the assigned bay.</li>
          <li>Do not use mobile devices while driving on the terminal.</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onOpenReportSheet}
        className="w-full py-2.5 px-3 rounded-lg bg-transparent border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
        <span>Report Navigation or Gate Access Issue</span>
      </button>
    </div>
  );
};