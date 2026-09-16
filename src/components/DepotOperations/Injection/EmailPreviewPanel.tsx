"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Mail, X, Send } from "lucide-react";
import { EmailPreview } from "@/services/notificationsService";

interface EmailPreviewPanelProps {
  preview: EmailPreview | null;
  onClose: () => void;
}

export const EmailPreviewPanel: React.FC<EmailPreviewPanelProps> = ({
  preview,
  onClose,
}) => {
  // Portal targets don't exist during SSR — wait for mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Escape closes
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [preview, onClose]);

  if (!preview || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="w-full max-w-3xl h-[80vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 bg-[#0B1420] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#3DAA63]" />
            <h3 className="text-sm font-bold uppercase tracking-wide">
              Outbound Email — Preview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close email preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meta */}
        <div className="px-5 py-3 border-b border-[#EDF1F5] bg-slate-50 space-y-1.5 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8492A6] w-16">
              To
            </span>
            <span className="font-mono text-[#0F1B2B]">{preview.to}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8492A6] w-16">
              Subject
            </span>
            <span className="font-semibold text-[#0F1B2B]">{preview.subject}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8492A6] w-16">
              Status
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <Send className="w-3 h-3" />
              Simulated — would dispatch via backend
            </span>
          </div>
        </div>

        {/* Body — white background prevents page bleed-through */}
        <div className="flex-1 overflow-hidden bg-white">
          <iframe
            title="Email preview"
            srcDoc={preview.html}
            className="w-full h-full border-0 bg-white"
            sandbox=""
            style={{ background: "#FFFFFF" }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};