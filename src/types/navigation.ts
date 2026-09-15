import { DepotId } from "@/types/flowguard";

export type DemoRoleId =
  | "operations"
  | "depot"
  | "omc"
  | "engineer"
  | "executive"
  | "driver";

export type DemoRoleName =
  | "KPC Operations"
  | "Depot Operator"
  | "OMC Dispatcher"
  | "FlowGuard Engineer"
  | "Executive"
  | "Driver";

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  iconName: string;
  badge?: string;
  description?: string;
}

export interface RoleConfig {
  id: DemoRoleId;
  name: DemoRoleName;
  badge: string;
  workspaceTitle: string;
  tagline: string;
  purpose: string;
  description: string;
  defaultRoute: string;
  iconName: string;
  navItems: NavigationItem[];
  contextType?: "none" | "depot" | "omc";
}

export const ROLES_CONFIG: Record<DemoRoleId, RoleConfig> = {
  operations: {
    id: "operations",
    name: "KPC Operations",
    badge: "Central Command",
    workspaceTitle: "Pipeline Network Command",
    tagline: "Network-wide demand forecasting & bottleneck deconfliction",
    purpose: "Monitor the network, manage depot operations, and oversee autonomous interventions.",
    description: "Central pipeline coordinators managing flow, throughput pressure, and multi-depot operational continuity across Kenya.",
    defaultRoute: "/operations/network",
    iconName: "LayoutDashboard",
    contextType: "none",
    navItems: [
      {
        id: "network-overview",
        label: "Network Overview",
        route: "/operations/network",
        iconName: "LayoutDashboard",
        description: "5-depot pressure & demand timeline",
      },
      {
        id: "depot-operations",
        label: "Depot Operations",
        route: "/operations/depot",
        iconName: "Building",
        badge: "5 Depots",
        description: "Individual terminal yard drill-down",
      },
      {
        id: "interventions",
        label: "Interventions",
        route: "/operations/interventions",
        iconName: "Zap",
        badge: "Active",
        description: "Network autonomous actions & approvals",
      },
      {
        id: "alerts",
        label: "Alerts",
        route: "/operations/alerts",
        iconName: "AlertTriangle",
        description: "At-risk operations & delay exceptions",
      },
    ],
  },
  depot: {
    id: "depot",
    name: "Depot Operator",
    badge: "Terminal Operations",
    workspaceTitle: "Depot Operations Console",
    tagline: "Terminal yard control, bay sequencing & gantry equipment",
    purpose: "Run day-to-day depot operations, capacity, yard flow, and active actions.",
    description: "Terminal Superintendents managing physical weighbridges, loading positions, equipment state, and queue velocity.",
    defaultRoute: "/depot/live",
    iconName: "Building",
    contextType: "depot",
    navItems: [
      {
        id: "live-yard",
        label: "Live Yard",
        route: "/depot/live",
        iconName: "Truck",
        description: "Truck stages, dwell & gantry queue",
      },
      {
        id: "capacity-equipment",
        label: "Capacity & Equipment",
        route: "/depot/capacity",
        iconName: "Cpu",
        description: "Usable loading positions & pumps",
      },
      {
        id: "forecast-actions",
        label: "Forecast & Actions",
        route: "/depot/forecast",
        iconName: "Sliders",
        badge: "MILP",
        description: "Demand vs capacity & autonomous actions",
      },
    ],
  },
  omc: {
    id: "omc",
    name: "OMC Dispatcher",
    badge: "Customer Visibility",
    workspaceTitle: "OMC Collection Visibility",
    tagline: "Customer order tracking, predicted gate-out & turnaround protection",
    purpose: "Monitor collection orders, expected arrival, loading progress, and customer updates.",
    description: "Oil Marketing Company dispatch officers tracking order status, turnaround SLAs, delay causes, and gate-out predictions.",
    defaultRoute: "/omc/orders",
    iconName: "Briefcase",
    contextType: "omc",
    navItems: [
      {
        id: "my-orders",
        label: "My Orders",
        route: "/omc/orders",
        iconName: "ClipboardList",
        description: "Active collection orders & journey status",
      },
      {
        id: "collection-outlook",
        label: "Collection Outlook",
        route: "/omc/outlook",
        iconName: "Clock",
        description: "Expected turnaround & attention alerts",
      },
      {
        id: "notifications",
        label: "Notifications",
        route: "/omc/notifications",
        iconName: "Bell",
        badge: "New",
        description: "Two-way operational updates & acknowledgements",
      },
    ],
  },
  engineer: {
    id: "engineer",
    name: "FlowGuard Engineer",
    badge: "Autonomous Control",
    workspaceTitle: "Autonomous Engine Control Surface",
    tagline: "Closed-loop decision timeline, MILP solver & safety invariants",
    purpose: "Inspect autonomous decisions, system health, policies, and decision history.",
    description: "Lead Systems Engineers validating sensor ingestion, mathematical optimization, deterministic policies, and verification audits.",
    defaultRoute: "/engineer/decisions",
    iconName: "Sliders",
    contextType: "none",
    navItems: [
      {
        id: "active-decisions",
        label: "Active Decisions",
        route: "/engineer/decisions",
        iconName: "Activity",
        badge: "Closed Loop",
        description: "8-stage autonomous decision cycle",
      },
      {
        id: "decision-history",
        label: "Decision History",
        route: "/engineer/history",
        iconName: "History",
        description: "Immutable intervention archive & audits",
      },
      {
        id: "system-health",
        label: "System Health",
        route: "/engineer/health",
        iconName: "Radio",
        badge: "Nominal",
        description: "Telemetry ingestion & degraded mode state",
      },
    ],
  },
  executive: {
    id: "executive",
    name: "Executive",
    badge: "Boardroom Perspective",
    workspaceTitle: "Executive Control Plane",
    tagline: "Strategic turnaround compression, exposure prevented & deployment ROI",
    purpose: "Track operational performance, protected value, turnaround improvement, and ROI.",
    description: "KPC Leadership & Ministry officials assessing turnaround recovery, demurrage penalty mitigation, and capital business cases.",
    defaultRoute: "/executive/overview",
    iconName: "TrendingUp",
    contextType: "none",
    navItems: [
      {
        id: "overview",
        label: "Overview",
        route: "/executive/overview",
        iconName: "Award",
        description: "Executive KPIs & sustained turnaround trend",
      },
      {
        id: "performance",
        label: "Performance",
        route: "/executive/performance",
        iconName: "BarChart3",
        description: "5-depot network turnaround scorecard",
      },
      {
        id: "value-roi",
        label: "Value & ROI",
        route: "/executive/value",
        iconName: "DollarSign",
        badge: "27.5x",
        description: "Modeled business case & prototype readiness",
      },
    ],
  },
  driver: {
    id: "driver",
    name: "Driver",
    badge: "Mobile Interface",
    workspaceTitle: "Driver Turnaround Interface",
    tagline: "Glanceable loading bay instructions & one-tap collection progress",
    purpose: "View your assigned collection guidance, status, and updates.",
    description: "Commercial road tanker drivers receiving crystal-clear bay assignments and collection milestone guidance on mobile.",
    defaultRoute: "/driver",
    iconName: "Smartphone",
    contextType: "none",
    navItems: [
      {
        id: "current-instruction",
        label: "Current Instruction",
        route: "/driver",
        iconName: "CheckSquare",
        description: "Active loading position guidance",
      },
      {
        id: "journey",
        label: "Journey Progress",
        route: "/driver#journey",
        iconName: "Truck",
        description: "Turn-by-turn depot stage tracking",
      },
      {
        id: "updates",
        label: "Updates",
        route: "/driver#updates",
        iconName: "Bell",
        description: "Operational broadcasts & notices",
      },
    ],
  },
};

export function getRoleFromPath(pathname: string): RoleConfig {
  if (pathname.startsWith("/operations")) return ROLES_CONFIG.operations;
  if (pathname.startsWith("/depot")) return ROLES_CONFIG.depot;
  if (pathname.startsWith("/omc")) return ROLES_CONFIG.omc;
  if (pathname.startsWith("/engineer")) return ROLES_CONFIG.engineer;
  if (pathname.startsWith("/executive")) return ROLES_CONFIG.executive;
  if (pathname.startsWith("/driver")) return ROLES_CONFIG.driver;

  // Legacy mappings
  if (pathname.startsWith("/depot-operations")) return ROLES_CONFIG.depot;
  if (pathname.startsWith("/omc-visibility") || pathname.startsWith("/omc-collection")) return ROLES_CONFIG.omc;
  if (pathname.startsWith("/autonomous-control") || pathname.startsWith("/autonomous")) return ROLES_CONFIG.engineer;
  if (pathname.startsWith("/executive-control")) return ROLES_CONFIG.executive;

  // Default fallback
  return ROLES_CONFIG.operations;
}
