"use client";

import React, { useState } from "react";
import {
  Truck,
  Plus,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Zap,
  X,
} from "lucide-react";

export interface InjectTruckPayload {
  driverName: string;
  driverEmail: string;
  registration: string;
  omc: string;
  product: string;
  quantityLitres: number;
  compartmentsCount: number;
  targetBayCode: string;
}

interface InjectTruckPanelProps {
  targetBayOptions: string[]; // e.g. ["P01".."P08"]
  defaultTargetBay?: string;
  onInject: (payload: InjectTruckPayload) => void;
  disabled?: boolean;
}

const OMCS = [
  "Vivo Energy Kenya",
  "TotalEnergies Marketing",
  "Rubis Energy Kenya",
  "Lake Oil Kenya",
  "Ola Energy Kenya",
  "Hass Petroleum",
  "Petrocity Energy",
];

const PRODUCTS = [
  "PMS (Super Unleaded)",
  "AGO (Automotive Gas Oil)",
  "DPK (Dual Purpose Kerosene)",
  "JET A-1 (Aviation Turbine)",
];

const randomReg = () => {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const a = letters[Math.floor(Math.random() * letters.length)];
  const b = letters[Math.floor(Math.random() * letters.length)];
  const n = 100 + Math.floor(Math.random() * 900);
  return `KD${a} ${n}${b}`;
};

export const InjectTruckPanel: React.FC<InjectTruckPanelProps> = ({
  targetBayOptions,
  defaultTargetBay = "P04",
  onInject,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [driverName, setDriverName] = useState("John Mwangi");
  const [driverEmail, setDriverEmail] = useState("john.mwangi@example.co.ke");
  const [registration, setRegistration] = useState(randomReg);
  const [omc, setOmc] = useState(OMCS[0]);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [quantityLitres, setQuantityLitres] = useState(34000);
  const [compartmentsCount, setCompartmentsCount] = useState(3);
  const [targetBayCode, setTargetBayCode] = useState(defaultTargetBay);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!driverName.trim()) return setError("Driver name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driverEmail))
      return setError("Enter a valid driver email.");
    if (!registration.trim()) return setError("Truck registration is required.");
    if (!targetBayCode) return setError("Choose a target bay.");

    onInject({
      driverName: driverName.trim(),
      driverEmail: driverEmail.trim(),
      registration: registration.trim().toUpperCase(),
      omc,
      product,
      quantityLitres,
      compartmentsCount,
      targetBayCode,
    });
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F1B2B] text-white text-sm font-bold hover:bg-[#152234] shadow-md transition-all disabled:opacity-60"
      >
        <Plus className="w-4 h-4" />
        Inject Truck & Simulate Reroute
      </button>
    );
  }

  return (
    <div className="rounded-lg border-2 border-[#1B7A3D]/40 bg-white shadow-lg overflow-hidden">
      <div className="px-5 py-3 bg-gradient-to-r from-[#0B1420] to-[#152234] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#3DAA63]" />
          <h3 className="text-sm font-bold uppercase tracking-wide">
            Inject Truck — Force Crisis & Reroute
          </h3>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-xs text-[#5C6B7A] leading-relaxed">
          Registers a driver, creates a new truck at the gate, targets bay{" "}
          <strong className="font-mono">{targetBayCode}</strong> which will be
          forced into <span className="text-rose-700 font-semibold">DEGRADED</span>{" "}
          state, then FlowGuard autonomously reroutes the truck to the healthiest
          available bay. Email, push, and voice notifications fire.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
              Driver name
            </label>
            <input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E2E6EA] rounded-md focus:outline-none focus:border-[#1B7A3D]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
              Driver email
            </label>
            <input
              type="email"
              value={driverEmail}
              onChange={(e) => setDriverEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E2E6EA] rounded-md focus:outline-none focus:border-[#1B7A3D]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
              Truck registration
            </label>
            <input
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E2E6EA] rounded-md focus:outline-none focus:border-[#1B7A3D] font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
              Target bay (will be forced degraded)
            </label>
            <div className="relative">
              <select
                value={targetBayCode}
                onChange={(e) => setTargetBayCode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E2E6EA] rounded-md bg-white appearance-none focus:outline-none focus:border-[#1B7A3D] pr-8"
              >
                {targetBayOptions.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
              OMC
            </label>
            <select
              value={omc}
              onChange={(e) => setOmc(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E2E6EA] rounded-md bg-white focus:outline-none focus:border-[#1B7A3D]"
            >
              {OMCS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
              Product
            </label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E2E6EA] rounded-md bg-white focus:outline-none focus:border-[#1B7A3D]"
            >
              {PRODUCTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
              Quantity (litres)
            </label>
            <input
              type="number"
              value={quantityLitres}
              min={10000}
              max={44000}
              step={1000}
              onChange={(e) => setQuantityLitres(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[#E2E6EA] rounded-md focus:outline-none focus:border-[#1B7A3D] font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
              Compartments
            </label>
            <input
              type="number"
              value={compartmentsCount}
              min={1}
              max={5}
              onChange={(e) => setCompartmentsCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[#E2E6EA] rounded-md focus:outline-none focus:border-[#1B7A3D] font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 px-3 py-2 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#EDF1F5]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5C6B7A]">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            Email + push + voice notifications fire on reroute
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-[#5C6B7A] hover:text-[#0F1B2B] border border-[#E2E6EA] rounded-md transition-all"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#1B7A3D] hover:bg-[#146030] rounded-md transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Inject & Reroute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};