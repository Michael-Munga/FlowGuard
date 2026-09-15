"use client";

import React, { useState } from "react";
import { X, FileText, Plus, User, Clock, CheckCircle } from "lucide-react";
import { ShiftLogEntry } from "@/types/dashboard";

interface ShiftLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ShiftLogEntry[];
  onAddLog: (entry: Omit<ShiftLogEntry, "id" | "time">) => void;
}

export const ShiftLogModal: React.FC<ShiftLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onAddLog,
}) => {
  const [note, setNote] = useState("");
  const [type, setType] = useState<ShiftLogEntry["type"]>("Intervention");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onAddLog({
      operator: "Operations Admin (You)",
      type,
      note: note.trim(),
    });
    setNote("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E2E6EA] max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-[#E2E6EA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#1B7A3D]/10 text-[#1B7A3D]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F1B2B]">
                SCADA Shift Operations Log
              </h3>
              <p className="text-xs text-[#5C6B7A]">
                Shift B Handover & Dispatch Audit Trail (EMB-88)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Log list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg border border-[#E2E6EA] bg-[#FAFBFC] space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F1B2B]">{log.operator}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-200 text-slate-700">
                    {log.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#8492A6] font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{log.time}</span>
                </div>
              </div>
              <p className="text-xs text-[#5C6B7A] leading-relaxed pt-1">
                {log.note}
              </p>
            </div>
          ))}
        </div>

        {/* Add Entry Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 px-6 border-t border-[#E2E6EA] bg-[#FAFBFC] space-y-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#0F1B2B]">Log Type:</span>
            <div className="flex items-center gap-2">
              {(["Intervention", "Incident", "Handover", "System"] as const).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                      type === t
                        ? "bg-[#1B7A3D] text-white border-[#1B7A3D] font-semibold"
                        : "bg-white text-[#5C6B7A] border-[#E2E6EA] hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter operational shift log note..."
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E2E6EA] rounded-md text-[#0F1B2B] focus:outline-none focus:ring-1 focus:ring-[#1B7A3D]"
            />
            <button
              type="submit"
              disabled={!note.trim()}
              className="px-3.5 py-1.5 bg-[#1B7A3D] text-white text-xs font-semibold rounded-md hover:bg-[#145d2e] disabled:opacity-50 flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
