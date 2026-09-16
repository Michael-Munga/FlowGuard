"use client";

import React, { useEffect, useState } from "react";
import { Volume2, VolumeX, Play, Square, Mic } from "lucide-react";
import { voiceService } from "@/services/voiceService";
import { buildKpiVoiceLine } from "@/services/notificationsService";
import { ExecutiveKpiSummary } from "@/types/flowguard";

interface ExecutiveVoiceAssistantProps {
  kpis: ExecutiveKpiSummary | null;
}

export const ExecutiveVoiceAssistant: React.FC<ExecutiveVoiceAssistantProps> = ({
  kpis,
}) => {
  const [muted, setMuted] = useState(voiceService.isMuted);
  const [speaking, setSpeaking] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return voiceService.subscribe(setMuted);
  }, []);

  const buildLine = () =>
    buildKpiVoiceLine({
      exposureProtectedKes: kpis?.totalExposureProtectedKes ?? 14_820_000,
      realizedSavingsKes: kpis?.realizedSavingsKes ?? 11_350_000,
      turnaroundImprovementPct: kpis?.turnaroundImprovementPct ?? -35.6,
      currentTurnaroundMin: kpis?.currentTurnaroundMin ?? 56,
      baselineTurnaroundMin: kpis?.baselineTurnaroundMin ?? 87,
      interventionsVerified: kpis?.interventionsVerifiedSuccess ?? 46,
      interventionsTotal: kpis?.autonomousInterventionsTotal ?? 50,
      predictionAttainmentPct: kpis?.recoveryAttainmentPct ?? 89.5,
      recommendation:
        kpis?.recommendation?.headline ?? "Proceed to controlled multi-depot pilot",
    });

  const speakSummary = () => {
    if (muted) voiceService.setMuted(false);
    setSpeaking(true);
    voiceService.speak(buildLine());
    // approximate end — clear spinner after ~15s max
    setTimeout(() => setSpeaking(false), 15000);
  };

  const stop = () => {
    voiceService.cancel();
    setSpeaking(false);
  };

  if (!voiceService.isSupported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[55] flex flex-col items-end gap-2">
      {open && (
        <div className="w-80 rounded-xl bg-[#0B1420] text-white shadow-2xl border border-[#1C2C42] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="px-4 py-3 border-b border-[#1C2C42] flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#3DAA63]" />
            <div className="flex-1">
              <div className="text-xs font-bold">Executive Voice Assistant</div>
              <div className="text-[10px] text-slate-400 font-mono">
                Reads KPIs, savings & recommendations aloud
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Click <strong>Play Summary</strong> to hear the executive KPIs, protected
              value, turnaround compression, and stage-gate recommendation.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={speakSummary}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#1B7A3D] hover:bg-[#146030] text-xs font-bold transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Play Summary
              </button>
              <button
                onClick={stop}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Stop
              </button>
              <button
                onClick={() => voiceService.toggleMute()}
                className="ml-auto p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-[#3DAA63]" />
                )}
              </button>
            </div>
            {speaking && (
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Speaking…
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          speaking
            ? "bg-emerald-500 ring-4 ring-emerald-500/30 scale-105"
            : "bg-[#1B7A3D] hover:bg-[#146030] hover:scale-105"
        }`}
        title="Executive voice assistant"
      >
        {muted ? (
          <VolumeX className="w-6 h-6 text-white" />
        ) : (
          <Volume2 className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};