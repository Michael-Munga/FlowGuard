"use client";

import React from "react";
import { useDataSource } from "@/context/DataSourceContext";

interface ApiUnavailableCardProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ApiUnavailableCard: React.FC<ApiUnavailableCardProps> = ({
  title,
  description,
  onRetry,
  className = "",
}) => {
  const { lastApiError, apiBaseUrl, retryConnection, isApiLoading, isWakingUp } = useDataSource();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      retryConnection();
    }
  };

  if (isWakingUp) {
    return (
      <div
        className={`rounded-xl border border-amber-700/50 bg-amber-950/25 backdrop-blur-md p-6 text-amber-200 shadow-xl max-w-2xl mx-auto my-8 ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-900/50 border border-amber-700/60 flex items-center justify-center flex-shrink-0 text-amber-400">
            <span className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-lg font-semibold text-amber-100">Backend is Waking Up...</h3>
            </div>
            <p className="mt-1 text-sm text-amber-300/90 leading-relaxed">
              Render free-tier services spin down after 15 minutes of inactivity. The FastAPI backend is currently booting and establishing database connections. This may take up to a minute if the service was recently idle.
            </p>

            <div className="mt-3 py-2 px-3 rounded-md bg-amber-950/60 border border-amber-900/80 font-mono text-xs text-amber-300/90 break-all">
              <span className="text-amber-400 font-bold">API Target: </span>
              {apiBaseUrl || "http://localhost:8000"}
              <div className="mt-1 text-amber-300/80">
                <span className="font-bold">Status: </span>
                Retrying connection automatically in the background...
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-300/80 font-medium">
                <span className="w-3.5 h-3.5 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                <span>Connecting to live FastAPI service...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const effectiveTitle = title || "Live Operational Data Unavailable";
  const effectiveDescription =
    description ||
    "Could not establish connection to the FastAPI backend service. If the service was recently idle, Render's free tier takes up to a minute to cold-start. Live metrics, queue forecasts, and optimization endpoints will activate once connected.";

  return (
    <div
      className={`rounded-xl border border-rose-800/50 bg-rose-950/20 backdrop-blur-md p-6 text-rose-200 shadow-xl max-w-2xl mx-auto my-8 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-rose-900/50 border border-rose-700/60 flex items-center justify-center flex-shrink-0 text-rose-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-rose-100">{effectiveTitle}</h3>
          <p className="mt-1 text-sm text-rose-300 leading-relaxed">{effectiveDescription}</p>

          <div className="mt-3 py-2 px-3 rounded-md bg-rose-950/60 border border-rose-900/80 font-mono text-xs text-rose-300/90 break-all">
            <span className="text-rose-400 font-bold">API Target: </span>
            {apiBaseUrl || "http://localhost:8000"}
            {lastApiError && (
              <div className="mt-1 text-rose-400">
                <span className="font-bold">Error: </span>
                {lastApiError}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isApiLoading}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              {isApiLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Reconnecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Retry Connection</span>
                </>
              )}
            </button>

            <span className="text-xs text-rose-300/70">
              Note: This may take up to a minute if the service was recently idle (Render free-tier cold start).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
