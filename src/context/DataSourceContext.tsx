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

export type DataMode = "api" | "synthetic";

export interface DataSourceState {
  dataMode: DataMode;
  isApiConnected: boolean;
  isApiLoading: boolean;
  lastApiError: string | null;
  lastSyncTime: Date | null;
  apiBaseUrl: string;
  retryConnection: () => void;
}

const defaultState: DataSourceState = {
  dataMode: "synthetic",
  isApiConnected: false,
  isApiLoading: false,
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
  const dataMode = (
    process.env.NEXT_PUBLIC_FLOWGUARD_DATA_MODE === "api" ? "api" : "synthetic"
  ) as DataMode;

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_FLOWGUARD_API_URL || "http://localhost:8000";

  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(dataMode === "api");
  const [lastApiError, setLastApiError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const retryRef = useRef(0);

  const checkConnection = useCallback(async () => {
    if (dataMode !== "api") return;
    setIsApiLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setIsApiConnected(true);
        setLastApiError(null);
        setLastSyncTime(new Date());
      } else {
        setIsApiConnected(false);
        setLastApiError(`Backend returned HTTP ${res.status}`);
      }
    } catch (err: unknown) {
      setIsApiConnected(false);
      setLastApiError(
        err instanceof Error ? err.message : "Backend unreachable"
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
