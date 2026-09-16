"use client";

import { useEffect, useRef } from "react";
import { flowGuardService } from "@/services/flowguardService";
import {
  driverChannel,
  DriverChannelEvent,
  RerouteEvent,
  InjectEvent,
} from "@/services/driverChannel";
import { DriverUpdate, JourneyStageKey } from "./types";

const DEFAULT_DRIVER_REG = "KDD 412X";
const STORAGE_KEY = "kafdo_driver_reg";

export function getDriverRegistration(): string {
  if (typeof window === "undefined") return DEFAULT_DRIVER_REG;
  try {
    const override = window.localStorage.getItem(STORAGE_KEY);
    if (override && override.trim()) return override.trim();
  } catch {
    // ignore
  }
  return DEFAULT_DRIVER_REG;
}

export function setDriverRegistration(reg: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, reg);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Map an injected/rerouted truck in the repository to a journey stage key
// ---------------------------------------------------------------------------
function mapStageFromRepository(stage: string): JourneyStageKey {
  switch (stage) {
    case "Gate-In":
      return "GATE_IN";
    case "Validation / Release":
      return "AT_RISK";
    case "Loading":
      return "REALLOCATED";
    case "Ready to Exit":
      return "GATE_OUT_READY";
    case "Gate-Out":
      return "COMPLETED";
    default:
      return "EN_ROUTE";
  }
}

function repoStageToIndex(stage: string): number {
  switch (stage) {
    case "Gate-In":
      return 1; // Stage 2: Arrival & Tare
    case "Validation / Release":
      return 2; // Stage 3: Yard Staging / Risk
    case "Loading":
      return 3; // Stage 4: FlowGuard Intervention
    case "Ready to Exit":
      return 5; // Stage 6: Gross Weighbridge
    case "Gate-Out":
      return 6; // Stage 7: Complete
    default:
      return 0; // Stage 1: En Route
  }
}

// ---------------------------------------------------------------------------
// Build a driver update from a reroute event
// ---------------------------------------------------------------------------
function buildRerouteUpdate(ev: RerouteEvent): DriverUpdate {
  const timeShort = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    id: `UPD-RR-${Date.now()}`,
    type: "INSTRUCTION UPDATE",
    title: `Fast-Track Reroute: ${ev.fromBay} → ${ev.toBay}`,
    message:
      `FlowGuard autonomous deconfliction has reassigned your collection from Bay ${ev.fromBay} ` +
      `to Bay ${ev.toBay}. Estimated recovery ${ev.savedMinutes} minutes. ` +
      `Demurrage avoided KES ${ev.savedKes.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
    previousTiming: `Bay ${ev.fromBay}`,
    newTiming: `Bay ${ev.toBay}`,
    reason: ev.reason,
    timestamp: `${timeShort} EAT`,
    priority: "IMPORTANT",
    requiresAcknowledgement: true,
    isAcknowledged: false,
  };
}

function buildInjectUpdate(ev: InjectEvent): DriverUpdate {
  const timeShort = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    id: `UPD-INJ-${Date.now()}`,
    type: "GATE UPDATE",
    title: `Collection Assigned — Bay ${ev.targetBay}`,
    message:
      `${ev.depotName} has scheduled your collection for bay ${ev.targetBay}. ` +
      `${ev.product}, ${ev.quantityLitres.toLocaleString()}L. ` +
      `Follow the depot signs to the assigned gantry.`,
    timestamp: `${timeShort} EAT`,
    priority: "IMPORTANT",
    requiresAcknowledgement: true,
    isAcknowledged: false,
  };
}

// ---------------------------------------------------------------------------
// Public hook: link the driver PWA to the shared repository + broadcast channel
// ---------------------------------------------------------------------------
export interface DriverRepositoryHandlers {
  onReroute: (ev: RerouteEvent) => void;
  onInject: (ev: InjectEvent) => void;
  onSnapshotStage: (stageIndex: number) => void;
}

export function useDriverRepository(handlers: DriverRepositoryHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // BroadcastChannel subscription
  useEffect(() => {
    const unsubscribe = driverChannel.subscribe((event: DriverChannelEvent) => {
      const myReg = getDriverRegistration();
      if (event.truckRegistration !== myReg) return;

      if (event.kind === "REROUTE") {
        handlersRef.current.onReroute(event);
      } else if (event.kind === "INJECT") {
        handlersRef.current.onInject(event);
      }
    });
    return unsubscribe;
  }, []);

  // Repository polling — catches up if the driver tab was reloaded mid-demo,
  // and reflects state changes not carried on the channel (e.g. bay freed,
  // truck advanced stages via the simulator).
  useEffect(() => {
    let alive = true;

    const tick = () => {
      if (!alive) return;
      const myReg = getDriverRegistration();
      // Scan all depots for our truck
      const allDepots = flowGuardService.getDepots();
      for (const d of allDepots) {
        const trucks = flowGuardService.getDepotYardTrucks(d.id);
        const mine = trucks.find((t) => t.registration === myReg);
        if (mine) {
          const stageIdx = repoStageToIndex(mine.currentStage);
          handlersRef.current.onSnapshotStage(stageIdx);
          break;
        }
      }
    };

    tick();
    const id = setInterval(tick, 2500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
}