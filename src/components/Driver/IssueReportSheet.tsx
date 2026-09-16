"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  AlertTriangle,
  Clock,
  MapPin,
  HelpCircle,
  FileX,
  ShieldAlert,
  CheckCircle2,
  Send,
  WifiOff,
} from "lucide-react";
import { IssueCategory, SyncState } from "./types";

interface IssueReportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  onSubmitReport: (category: IssueCategory, subReason?: string, notes?: string) => void;
}

export const IssueReportSheet: React.FC<IssueReportSheetProps> = ({
  isOpen,
  onClose,
  syncState,
  onSubmitReport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory>("I'M DELAYED");
  const [subReason, setSubReason] = useState<string>("Traffic Congestion");
  const [notes, setNotes] = useState<string>("");
  const [safetyConfirmed, setSafetyConfirmed] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory("I'M DELAYED");
      setSubReason("Traffic Congestion");
      setNotes("");
      setSafetyConfirmed(false);
      setIsSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories: { key: IssueCategory; label: string; icon: React.ReactNode }[] = [
    { key: "I'M DELAYED", label: "I'm Delayed", icon: <Clock className="w-5 h-5 text-amber-400" /> },
    { key: "CAN'T ACCESS GATE", label: "Can't Access Gate", icon: <MapPin className="w-5 h-5 text-blue-400" /> },
    { key: "INSTRUCTION UNCLEAR", label: "Instruction Unclear", icon: <HelpCircle className="w-5 h-5 text-purple-400" /> },
    { key: "DOCUMENT / VEHICLE ISSUE", label: "Document / Vehicle Issue", icon: <FileX className="w-5 h-5 text-amber-400" /> },
    { key: "SAFETY ISSUE", label: "Safety Issue", icon: <ShieldAlert className="w-5 h-5 text-red-400" /> },
    { key: "OTHER", label: "Other Exception", icon: <AlertTriangle className="w-5 h-5 text-slate-400" /> },
  ];

  const delayedSubReasons = [
    "Traffic Congestion (Outer Ring)",
    "Mechanical / Tire Issue",
    "Outer Queue Congestion",
    "Paperwork Dispatch Delay",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory === "SAFETY ISSUE" && !safetyConfirmed) {
      return;
    }
    onSubmitReport(
      selectedCategory,
      selectedCategory === "I'M DELAYED" ? subReason : undefined,
      notes.trim() || undefined
    );
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed sm:absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-sheet-title"
    >
      <div
        className="w-full max-w-md mx-auto bg-[#0B1420] border-t border-slate-700 rounded-t-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] sm:max-h-[85%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 id="issue-sheet-title" className="text-sm font-bold text-white">
                Report Field Exception / Issue
              </h3>
              <p className="text-[11px] text-slate-400">Notifies KPC terminal dispatch coordinator</p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close report sheet"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {syncState === "OFFLINE" ? "Update Saved Locally" : "Update Sent to Dispatch"}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                {syncState === "OFFLINE"
                  ? "Report queued offline. It will synchronize as soon as network returns."
                  : "KPC dispatch and FlowGuard algorithms have received your notice."}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Offline Alert if Offline */}
            {syncState === "OFFLINE" && (
              <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                <WifiOff className="w-3.5 h-3.5 shrink-0" />
                <span>You are offline. Your report will be queued and sent upon reconnecting.</span>
              </div>
            )}

            {/* Category Selection Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-mono text-slate-400 block font-bold">
                Select Issue Category:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        if (cat.key !== "SAFETY ISSUE") setSafetyConfirmed(false);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer min-h-[52px] ${
                        isSelected
                          ? "bg-emerald-950/60 border-emerald-500 text-white font-bold shadow-xs"
                          : "bg-[#152234] border-[#243447] text-slate-300 hover:bg-[#1B2D42]"
                      }`}
                    >
                      {cat.icon}
                      <span className="text-xs leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-reason for I'm Delayed */}
            {selectedCategory === "I'M DELAYED" && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[11px] uppercase font-mono text-slate-400 block font-bold">
                  Delay Reason:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {delayedSubReasons.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSubReason(reason)}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        subReason === reason
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold"
                          : "bg-[#152234] border-[#243447] text-slate-400 hover:text-white"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Confirmation for Safety Issue */}
            {selectedCategory === "SAFETY ISSUE" && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 space-y-2.5 animate-fade-in">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>URGENT SAFETY NOTICE</span>
                </div>
                <p className="text-[11px] text-red-200 leading-normal">
                  If this is an active fire, fuel spill, or medical emergency, immediately hit the gantry ESD button or contact Terminal Safety at <strong>EXT 999</strong>.
                </p>
                <label className="flex items-center gap-2 pt-1 text-xs text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={safetyConfirmed}
                    onChange={(e) => setSafetyConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>I confirm this is an active safety/hazard report</span>
                </label>
              </div>
            )}

            {/* Optional Short Note */}
            <div className="space-y-1">
              <label className="text-[11px] uppercase font-mono text-slate-400 block font-bold">
                Optional Note (Max 120 chars):
              </label>
              <input
                type="text"
                maxLength={120}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Stuck behind stalled flatbed at North Gate"
                className="w-full p-2.5 rounded-lg bg-[#152234] border border-[#243447] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={selectedCategory === "SAFETY ISSUE" && !safetyConfirmed}
              className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                selectedCategory === "SAFETY ISSUE"
                  ? "bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white"
                  : "bg-[#1B7A3D] hover:bg-[#1E8A45] text-white"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {selectedCategory === "SAFETY ISSUE"
                  ? "CONFIRM SAFETY ISSUE"
                  : syncState === "OFFLINE"
                  ? "SAVE REPORT OFFLINE"
                  : "SEND UPDATE TO KPC"}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
