// src/services/driverChannel.ts
//
// Cross-tab bus between the Depot Operator console (/depot/live) and the
// Driver PWA (/driver). Uses BroadcastChannel when available and falls back
// to localStorage events for older browsers.
//
// When a real backend lands, this becomes a WebSocket or SSE channel.
// The API stays identical: publish() and subscribe().

export interface RerouteEvent {
  kind: "REROUTE";
  truckRegistration: string;
  driverName: string;
  driverEmail: string;
  orderNumber: string;
  fromBay: string;
  toBay: string;
  depotId: string;
  depotName: string;
  savedMinutes: number;
  savedKes: number;
  reason: string;
  timestamp: string;
}

export interface InjectEvent {
  kind: "INJECT";
  truckRegistration: string;
  driverName: string;
  driverEmail: string;
  orderNumber: string;
  targetBay: string;
  depotId: string;
  depotName: string;
  product: string;
  quantityLitres: number;
  timestamp: string;
}

export type DriverChannelEvent = RerouteEvent | InjectEvent;

const CHANNEL_NAME = "kafdo-driver-channel";
const STORAGE_KEY = "kafdo-driver-channel-events";
const STORAGE_MAX = 50;

type Handler = (event: DriverChannelEvent) => void;

class DriverChannel {
  private bc: BroadcastChannel | null = null;
  private handlers: Set<Handler> = new Set();
  private storageListenerAttached = false;

  constructor() {
    if (typeof window === "undefined") return;

    if ("BroadcastChannel" in window) {
      try {
        this.bc = new BroadcastChannel(CHANNEL_NAME);
        this.bc.onmessage = (msg: MessageEvent<DriverChannelEvent>) => {
          if (!msg?.data) return;
          this.fanout(msg.data);
        };
      } catch {
        this.bc = null;
      }
    }

    if (!this.bc) {
      // Fallback via storage events
      this.attachStorageListener();
    }
  }

  private attachStorageListener() {
    if (this.storageListenerAttached || typeof window === "undefined") return;
    this.storageListenerAttached = true;
    window.addEventListener("storage", (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const latest = JSON.parse(e.newValue) as DriverChannelEvent;
        if (latest && typeof latest === "object" && "kind" in latest) {
          this.fanout(latest);
        }
      } catch {
        // ignore malformed
      }
    });
  }

  private fanout(event: DriverChannelEvent) {
    this.handlers.forEach((fn) => {
      try {
        fn(event);
      } catch {
        // a bad handler should never break others
      }
    });
  }

  /** Publish an event to all subscribers (this tab and others). */
  publish(event: DriverChannelEvent) {
    if (typeof window === "undefined") return;

    if (this.bc) {
      try {
        this.bc.postMessage(event);
      } catch {
        // fall through to storage fallback
      }
    }

    // Also write to localStorage so a reloaded driver tab catches up
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as DriverChannelEvent[]) : [];
      arr.push(event);
      const trimmed = arr.slice(-STORAGE_MAX);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // localStorage can be disabled — non-fatal
    }

    // Ensure local subscribers in this tab also receive it (BroadcastChannel
    // does NOT fire onmessage in the posting tab)
    this.fanout(event);
  }

  /** Subscribe to events. Returns an unsubscribe function. */
  subscribe(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /** Read events that were published since a given timestamp. */
  readHistory(sinceMs = 0): DriverChannelEvent[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw) as DriverChannelEvent[];
      return arr.filter((e) => {
        const ts = Date.parse(e.timestamp);
        return Number.isFinite(ts) ? ts >= sinceMs : true;
      });
    } catch {
      return [];
    }
  }
}

export const driverChannel = new DriverChannel();