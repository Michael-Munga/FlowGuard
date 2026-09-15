export type RiskStatus = "ON TRACK" | "AT RISK" | "CRITICAL";

export interface RiskFactor {
  label: string;
  points: number;
  severity: "low" | "medium" | "high";
}

export interface DocumentItem {
  id: string;
  name: string;
  status: "complete" | "pending" | "missing";
}

export interface Truck {
  id: string;
  registration: string;
  depot: string;
  omc: string;
  product: string;
  stage: string;
  dwellMinutes: number;
  eta: string;
  riskScore: number;
  status: RiskStatus;
  driverName: string;
  driverId: string;
  bay: string;
  arrivalTime: string;
  predictedDeparture: string;
  delayNotice?: string;
  riskSummary: string;
  riskFactors: RiskFactor[];
  documents: DocumentItem[];
  recommendedAction: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  truckId?: string;
  source: string;
  description: string;
  severity: "info" | "warning" | "critical";
  acknowledged?: boolean;
}

export interface PipelineLine {
  id: string;
  name: string;
  fromTo: string;
  status: "nominal" | "warning" | "alert";
  flowRate: string;
  pressure: string;
}

export interface ShiftLogEntry {
  id: string;
  time: string;
  operator: string;
  type: "Handover" | "Intervention" | "Incident" | "System";
  note: string;
}

export type NavTab = 
  | "command-centre"
  | "omc-monitoring"
  | "executive-control"
  | "live-interventions"
  | "alerts-escalations"
  | "fleet-tracking"
  | "analytics-reports"
  | "settings";
