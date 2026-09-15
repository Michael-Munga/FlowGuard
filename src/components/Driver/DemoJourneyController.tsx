"use client";

import React, { useEffect, useRef } from "react";
import { X, Layers, CheckCircle2, ChevronRight, Zap, AlertTriangle } from "lucide-react";
import { DRIVER_JOURNEY_STAGES } from "./journeyStages";

interface DemoJourneyControllerProps {
  isOpen: boolean;
  onClose: () => void;
  currentIndex: number;
  onSelectStage: (index: number) => void;
}

export const DemoJourneyController: React.FC<DemoJourneyControllerProps> = ({
  isOpen,
  onClose,
  currentIndex,
  onSelectStage,
}) => {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="journey-stepper-title"
    >
      <div
        className="w-full max-w-md mx-auto bg-[#0B1420] border-t border-slate-700 rounded-t-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 id="journey-stepper-title" className="text-sm font-bold text-white">
                Demo Journey Stage Stepper
              </h3>
              <p className="text-[11px] text-slate-400">
                Instantly jump to any stage in the KPC collection sequence
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close demo stepper"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage list */}
        <div className="space-y-2">
          {DRIVER_JOURNEY_STAGES.map((stage, idx) => {
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => {
                  onSelectStage(idx);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#1B7A3D]/25 border-[#1B7A3D] text-white shadow-xs font-bold"
                    : "bg-[#152234] border-[#243447] text-slate-300 hover:bg-[#1C2E42]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                      isCurrent
                        ? "bg-[#1B7A3D] text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{stage.stageName}</span>
                      {stage.isRecovering && (
                        <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          RECOVERING
                        </span>
                      )}
                      {stage.collectionStatus === "AT RISK" && (
                        <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          AT RISK
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{stage.nextActionTitle}</p>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 ${isCurrent ? "text-emerald-400" : "text-slate-500"}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
