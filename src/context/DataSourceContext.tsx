"use client";

/**
 * DataSourceContext — FlowGuard API/Synthetic Mode Context
 *
 * Provides the active data mode, backend connection state, and async
 * API connectivity tracking to all dashboard components.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getApiBaseUrl } from "@/lib/utils";

export type DataMode = "api" | "synthetic";

export interface DataSourceState {
  dataMode: DataMode;
  isApiConnected: boolean;
  isApiLoading: boolean;
  isWakingUp: boolean;
  lastApiError: string | null;
  lastSyncTime: Date | null;
  apiBaseUrl: string;
  retryConnection: () => void;
}

const defaultState: DataSourceState = {
  dataMode: "synthetic",
  isApiConnected: false,
  isApiLoading: false,
  isWakingUp: false,
  lastApiError: null,
  lastSyncTime: null,
  apiBaseUrl: "",
  retryConnection: () => {},
};

export const DataSourceContext = createContext<DataSourceState>(defaultState);

export function useDataSource(): DataSourceState {
  return useContext(DataSourceContext);
}

interface DataSourceProviderProps {
  children: React.ReactNode;
}

export function DataSourceProvider({ children }: DataSourceProviderProps) {
  const explicitMode = process.env.NEXT_PUBLIC_FLOWGUARD_DATA_MODE || process.env.NEXT_PUBLIC_DATA_MODE;
  const rawApiUrl = process.env.NEXT_PUBLIC_FLOWGUARD_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const dataMode = (
    explicitMode === "api" || (explicitMode !== "synthetic" && Boolean(rawApiUrl))
      ? "api"
      : "synthetic"
  ) as DataMode;

  const apiBaseUrl = getApiBaseUrl();

  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(dataMode === "api");
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [lastApiError, setLastApiError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const retryRef = useRef(0);

  const checkConnection = useCallback(async () => {
    if (dataMode !== "api") return;
    setIsApiLoading(true);
    setIsWakingUp(false);
    try {
      let res: Response | null = null;
      try {
        // Attempt 1: 20 seconds
        res = await fetch(`${apiBaseUrl}/health`, {
          cache: "no-store",
          signal: AbortSignal.timeout(20000),
        });
      } catch (firstErr) {
        // First ping timed out or failed (typical Render free-tier cold start).
        // Set waking-up state and auto-retry once with 35s timeout.
        setIsWakingUp(true);
        setLastApiError("Backend service is waking up from idle sleep (Render free-tier cold start). Retrying automatically...");
        await new Promise((r) => setTimeout(r, 2000));
        try {
          res = await fetch(`${apiBaseUrl}/health`, {
            cache: "no-store",
            signal: AbortSignal.timeout(35000),
          });
        } catch (secondErr) {
          throw secondErr;
        }
      }

      if (res && res.ok) {
        setIsApiConnected(true);
        setIsWakingUp(false);
        setLastApiError(null);
        setLastSyncTime(new Date());
      } else {
        setIsApiConnected(false);
        setIsWakingUp(false);
        setLastApiError(res ? `Backend returned HTTP ${res.status}` : "Backend is waking up or unreachable");
      }
    } catch (err: unknown) {
      setIsApiConnected(false);
      setIsWakingUp(false);
      const isTimeout =
        (err instanceof Error && err.name === "TimeoutError") ||
        (err instanceof Error && err.name === "AbortError") ||
        (err instanceof Error && err.message.toLowerCase().includes("timeout"));
      setLastApiError(
        isTimeout
          ? "Connection timed out. The Render backend may still be spinning up from idle sleep (takes ~50-70s)."
          : err instanceof Error
          ? err.message
          : "Backend unreachable"
      );
    } finally {
      setIsApiLoading(false);
    }
  }, [dataMode, apiBaseUrl]);

  const retryConnection = useCallback(() => {
    retryRef.current += 1;
    checkConnection();
  }, [checkConnection]);

  // Initial connection check in API mode
  useEffect(() => {
    if (dataMode === "api") {
      checkConnection();
    }
  }, [dataMode, checkConnection]);

  // Periodic health check every 60 seconds in API mode
  useEffect(() => {
    if (dataMode !== "api") return;
    const id = setInterval(checkConnection, 60_000);
    return () => clearInterval(id);
  }, [dataMode, checkConnection]);

  const value: DataSourceState = {
    dataMode,
    isApiConnected,
    isApiLoading,
    isWakingUp,
    lastApiError,
    lastSyncTime,
    apiBaseUrl,
    retryConnection,
  };

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
}
