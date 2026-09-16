"use client";

import React from "react";

interface DriverPhoneFrameProps {
  children: React.ReactNode;
}

/**
 * Wraps the driver PWA so it always renders as a properly-sized mobile
 * device:
 * - On desktop: a bounded floating phone with an inner scroll context.
 *   Height is min(720px, viewport − 32px), so it never pushes the outer
 *   page past the viewport (no browser scrollbar).
 * - On mobile (≤480px): goes full-screen.
 */
export const DriverPhoneFrame: React.FC<DriverPhoneFrameProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#02060B] via-[#050A10] to-[#0A131F] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Subtle radial glow behind the phone */}
      <div
        className="hidden sm:block absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(27,122,61,0.08) 0%, transparent 55%)",
        }}
      />

      <div
        className="
          relative z-10
          w-full max-w-[390px]
          h-[calc(100dvh-2rem)]
          sm:h-[min(720px,calc(100dvh-3rem))]
          bg-[#070D15] text-white
          flex flex-col
          shadow-2xl
          border border-slate-800
          rounded-none sm:rounded-[32px]
          overflow-hidden
        "
      >
        {/* Notch-style top strip on desktop only */}
        <div className="hidden sm:flex items-center justify-center h-6 bg-[#050A10] border-b border-slate-800 shrink-0">
          <div className="w-16 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Everything inside gets its own scroll context */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};