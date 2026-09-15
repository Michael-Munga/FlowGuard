"use client";

import React from "react";
import {
  Building2,
  Sliders,
  Zap,
  BellRing,
  Navigation,
  BarChart3,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Cpu,
  Truck as TruckIcon,
  RefreshCw,
} from "lucide-react";
import { NavTab, Truck } from "@/types/dashboard";

interface SecondaryViewProps {
  activeTab: NavTab;
  trucks: Truck[];
  onOpenTruck: (truck: Truck) => void;
}

export const SecondaryViews: React.FC<SecondaryViewProps> = ({
  activeTab,
  trucks,
  onOpenTruck,
}) => {
  if (activeTab === "omc-monitoring") {
    const omcs = [
      { name: "TotalEnergies Marketing", activeTrucks: 14, quotaToday: "1,200,000 L", fulfilled: "78%", status: "Nominal" },
      { name: "Rubis Energy Kenya", activeTrucks: 11, quotaToday: "980,000 L", fulfilled: "64%", status: "At Risk" },
      { name: "Vivo Energy (Shell)", activeTrucks: 8, quotaToday: "850,000 L", fulfilled: "92%", status: "Nominal" },
      { name: "Ola Energy Kenya", activeTrucks: 5, quotaToday: "450,000 L", fulfilled: "55%", status: "Nominal" },
      { name: "Hass Petroleum", activeTrucks: 3, quotaToday: "320,000 L", fulfilled: "88%", status: "Nominal" },
      { name: "Lake Oil Kenya", activeTrucks: 1, quotaToday: "200,000 L", fulfilled: "34%", status: "Critical" },
    ];

    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F1B2B]">OMC Monitoring & Quota Allocation</h2>
            <p className="text-xs text-[#5C6B7A]">Oil Marketing Companies pipeline off-take quotas and depot loading throughput</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-[#1B7A3D] text-xs font-bold rounded-full border border-emerald-200">
            Active OMCs: 6
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {omcs.map((omc) => (
            <div key={omc.name} className="bg-white p-4 rounded-lg border border-[#E2E6EA] shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="font-bold text-sm text-[#0F1B2B]">{omc.name}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  omc.status === "Critical" ? "bg-rose-50 text-[#C0392B] border border-rose-200" :
                  omc.status === "At Risk" ? "bg-amber-50 text-[#B7791F] border border-amber-200" :
                  "bg-emerald-50 text-[#1B7A3D] border border-emerald-200"
                }`}>
                  {omc.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#5C6B7A]">
                <div className="flex justify-between">
                  <span>Active Trucks:</span>
                  <span className="font-bold text-[#0F1B2B]">{omc.activeTrucks} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Day Allocation Quota:</span>
                  <span className="font-bold text-[#0F1B2B]">{omc.quotaToday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfillment Progress:</span>
                  <span className="font-bold text-[#1B7A3D]">{omc.fulfilled}</span>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${omc.status === "Critical" ? "bg-[#C0392B]" : omc.status === "At Risk" ? "bg-[#B7791F]" : "bg-[#1B7A3D]"}`}
                  style={{ width: omc.fulfilled }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "executive-control") {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-[#0F1B2B]">Executive Control Plane</h2>
          <p className="text-xs text-[#5C6B7A]">High-level pipeline storage, throughput pressures, and TSA demurrage exposure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-lg border border-[#E2E6EA] shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#0F1B2B]">Kipevu Oil Terminal (Mombasa)</h3>
            <div className="text-2xl font-extrabold text-[#0F1B2B]">342,000 m³</div>
            <p className="text-xs text-[#5C6B7A]">Active Storage: 84% Capacity</p>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1B7A3D]" style={{ width: "84%" }} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#E2E6EA] shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#0F1B2B]">Nairobi Terminal PS10</h3>
            <div className="text-2xl font-extrabold text-[#0F1B2B]">194,500 m³</div>
            <p className="text-xs text-[#5C6B7A]">Active Storage: 67% Capacity</p>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1B7A3D]" style={{ width: "67%" }} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#E2E6EA] shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#0F1B2B]">Western Depots (KSM & ELD)</h3>
            <div className="text-2xl font-extrabold text-[#0F1B2B]">88,200 m³</div>
            <p className="text-xs text-[#5C6B7A]">Active Storage: 91% Capacity (High Influx)</p>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#B7791F]" style={{ width: "91%" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "live-interventions") {
    const atRiskTrucks = trucks.filter((t) => t.status === "CRITICAL" || t.status === "AT RISK");
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F1B2B]">Live Interventions Queue</h2>
            <p className="text-xs text-[#5C6B7A]">Active units requiring operator intervention, seal verification, or bay rerouting</p>
          </div>
          <span className="px-3 py-1 bg-rose-50 text-[#C0392B] text-xs font-bold rounded-full border border-rose-200">
            {atRiskTrucks.length} Units Pending Intervention
          </span>
        </div>

        <div className="space-y-3">
          {atRiskTrucks.map((truck) => (
            <div
              key={truck.id}
              onClick={() => onOpenTruck(truck)}
              className="bg-white p-4 rounded-lg border border-[#E2E6EA] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#cbd5e1] transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[#0F1B2B]">{truck.registration}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    truck.status === "CRITICAL" ? "bg-rose-50 text-[#C0392B] border border-rose-200" : "bg-amber-50 text-[#B7791F] border border-amber-200"
                  }`}>
                    {truck.status}
                  </span>
                  <span className="text-xs text-[#5C6B7A]">• {truck.depot}</span>
                </div>
                <p className="text-xs text-[#0F1B2B] font-medium">{truck.recommendedAction}</p>
              </div>

              <button className="px-3 py-1.5 bg-[#C0392B] text-white text-xs font-bold rounded hover:bg-[#a93226]">
                Review & Execute →
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "fleet-tracking") {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-[#0F1B2B]">Depot Fleet Tracking & Transit Radar</h2>
          <p className="text-xs text-[#5C6B7A]">GPS telemetry & geo-fenced depot gantry zone distribution</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#E2E6EA] shadow-xs space-y-4">
          <div className="h-64 rounded-lg bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3DAA63_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#3DAA63]" />
                <span className="text-xs font-mono font-bold tracking-wider">KENYA PIPELINE SCADA RADAR (5 DEPOTS)</span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                ECTS LINK ACTIVE: 42 TRANSPONDERS
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center z-10">
              {[
                { name: "Nairobi (PS10)", count: 18, bay: "6/8 active" },
                { name: "Mombasa (KOT)", count: 12, bay: "4/4 active" },
                { name: "Kisumu (PS28)", count: 6, bay: "3/4 active" },
                { name: "Eldoret (PS27)", count: 4, bay: "2/3 active" },
                { name: "Nakuru (PS25)", count: 2, bay: "1/2 active" },
              ].map((depot) => (
                <div key={depot.name} className="p-2.5 rounded bg-slate-800/80 border border-slate-700 text-slate-200">
                  <div className="text-xs font-bold">{depot.name}</div>
                  <div className="text-lg font-mono font-bold text-[#3DAA63]">{depot.count} trucks</div>
                  <div className="text-[10px] text-slate-400">{depot.bay}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "analytics-reports") {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-[#0F1B2B]">Autonomous Dispatch Analytics & SLA Metrics</h2>
          <p className="text-xs text-[#5C6B7A]">Turnaround dwell times, gantry throughput, and TSA penalty avoidance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-[#E2E6EA] shadow-xs">
            <span className="text-xs font-bold text-[#5C6B7A] uppercase">Avg Terminal Dwell Time</span>
            <div className="text-2xl font-bold text-[#0F1B2B] mt-1">1h 18m</div>
            <span className="text-xs text-[#1B7A3D] font-medium">-14m vs monthly avg</span>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#E2E6EA] shadow-xs">
            <span className="text-xs font-bold text-[#5C6B7A] uppercase">Demurrage Penalties Saved</span>
            <div className="text-2xl font-bold text-[#1B7A3D] mt-1">KES 2,450,000</div>
            <span className="text-xs text-[#5C6B7A]">Autonomous rerouting intervention efficacy</span>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#E2E6EA] shadow-xs">
            <span className="text-xs font-bold text-[#5C6B7A] uppercase">Regulatory Document Compliance</span>
            <div className="text-2xl font-bold text-[#0F1B2B] mt-1">96.8%</div>
            <span className="text-xs text-[#1B7A3D] font-medium">+2.1pp vs last shift</span>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "settings") {
    return (
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-[#0F1B2B]">SCADA Dispatcher System Settings</h2>
          <p className="text-xs text-[#5C6B7A]">Autonomous dispatch policy, alert thresholds, and SCADA sensor calibration</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E2E6EA] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E6EA]">
            <div>
              <div className="text-sm font-bold text-[#0F1B2B]">Autonomous Bay Reassignment</div>
              <div className="text-xs text-[#5C6B7A]">Automatically assign alternate gantry bays when queue dwell exceeds 30m</div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-[#1B7A3D] text-xs font-bold rounded border border-emerald-200">ENABLED</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#E2E6EA]">
            <div>
              <div className="text-sm font-bold text-[#0F1B2B]">TSA SLA Critical Threshold</div>
              <div className="text-xs text-[#5C6B7A]">Trigger critical notification when dwell risk index reaches 80+</div>
            </div>
            <span className="text-xs font-mono font-bold text-[#0F1B2B]">80 pts</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#0F1B2B]">KRA Electronic Cargo Tracking Integration (ECTS)</div>
              <div className="text-xs text-[#5C6B7A]">Real-time seal tamper detection and transit bond verification</div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-[#1B7A3D] text-xs font-bold rounded border border-emerald-200">ONLINE</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
