# KPC FlowGuard: End-to-End Backend-Backed Dashboard Integration Matrix

This document provides the definitive integration architecture, endpoint mappings, schema contracts, PostgreSQL backing tables, failure modes, and fallback specifications for the KPC FlowGuard system.

---

## 1. Architectural Overview

FlowGuard operates an end-to-end telemetry and autonomous decision loop that connects physical and simulated depot operations to real-time analytics and predictive optimization:

```
Synthetic Source Dataset / Sensors
            │
            ▼
    Great Expectations (Validation)
            │
            ▼
        ETL Engine
            │
            ▼
     PostgreSQL Database (port 5432)
            │
            ▼
   FastAPI High-Performance API (port 8000)
            │
            ▼
   HttpFlowGuardRepository (TypeScript Service Layer)
            │
            ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Next.js 16 Real-Time Operator & Executive Dashboards    │
 │ • Network Command Centre       • Depot Operations       │
 │ • OMC Visibility & Liftings    • Autonomous Control     │
 │ • Executive Control Plane      • Driver Mobile View     │
 └─────────────────────────────────────────────────────────┘
```

The system strictly adheres to the **Repository Pattern**:
- **`IFlowGuardRepository`**: Unified contract interface consumed by React hooks and dashboard components.
- **`HttpFlowGuardRepository`**: Active implementation when `NEXT_PUBLIC_FLOWGUARD_DATA_MODE=api`. Performs live HTTP/JSON queries against FastAPI and maps real database entities to domain models.
- **`SyntheticFlowGuardRepository`**: Standalone in-memory simulator used **only** when explicitly configured in `synthetic` mode.

---

## 2. Dashboard View to Backend Integration Matrix

| Dashboard View | Route | Backend Endpoints Called | Request Method / Params | Response Models / Data Mapped | Backing PostgreSQL Tables |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Network Command Centre** | `/command-centre` | `/health`<br>`/api/metrics/network`<br>`/api/depots`<br>`/api/risks/active`<br>`/api/decisions`<br>`/api/decisions/stats/autonomy` | `GET`<br>`GET`<br>`GET`<br>`GET`<br>`GET ?limit=50`<br>`GET` | `HealthCheckResponse`<br>`NetworkMetricsResponse`<br>`List[DepotResponse]`<br>`List[RiskEventResponse]`<br>`List[DecisionResponse]`<br>`AutonomyStatsResponse` | `depots`<br>`loading_orders`<br>`risk_events`<br>`decisions` |
| **Depot Operations** | `/depots`<br>`/depots/[id]` | `/api/depots`<br>`/api/depots/{id}/live`<br>`/api/depots/{id}/forecast`<br>`/api/predictions/depots/{id}/risk`<br>`/api/decisions` | `GET`<br>`GET`<br>`GET`<br>`GET`<br>`GET ?depot_id={id}` | `List[DepotResponse]`<br>`DepotLiveStateResponse`<br>`DepotForecastResponse`<br>`DepotRiskPredictionResponse`<br>`List[DecisionResponse]` | `depots`<br>`loading_orders`<br>`risk_events`<br>`decisions` |
| **OMC Visibility & Liftings** | `/omc`<br>`/omc/[id]` | `/api/omcs/{id}/summary`<br>`/api/omcs/{id}/orders`<br>`/api/orders/{id}`<br>`/api/predictions/orders/{id}/risk` | `GET`<br>`GET ?limit=50`<br>`GET`<br>`GET` | `OmcSummaryResponse`<br>`OmcOrdersResponse`<br>`LoadingOrderResponse`<br>`OrderRiskPredictionResponse` | `omcs`<br>`loading_orders`<br>`risk_events` |
| **Autonomous Control Plane** | `/engineer`<br>`/engineer/decisions`<br>`/engineer/history`<br>`/engineer/health` | `/api/decisions`<br>`/api/decisions/stats/autonomy`<br>`/health`<br>`/api/optimization/depot-dispatch` | `GET ?limit=50`<br>`GET`<br>`GET`<br>`POST (Candidate payload)` | `List[DecisionResponse]`<br>`AutonomyStatsResponse`<br>`HealthCheckResponse`<br>`OptimizationResponse` | `decisions`<br>`risk_events`<br>`loading_orders`<br>`depots` |
| **Executive Control Plane** | `/executive`<br>`/executive/roi`<br>`/executive/readiness` | `/api/metrics/executive`<br>`/api/decisions/stats/autonomy`<br>`/health` | `GET`<br>`GET`<br>`GET` | `ExecutiveMetricsResponse`<br>`AutonomyStatsResponse`<br>`HealthCheckResponse` | `loading_orders`<br>`decisions`<br>`risk_events`<br>`depots` |
| **Driver Companion App** | `/driver`<br>`/driver/[orderId]` | `/api/orders/{order_id}`<br>`/api/predictions/orders/{order_id}/risk` | `GET`<br>`GET` | `LoadingOrderResponse`<br>`OrderRiskPredictionResponse` | `loading_orders`<br>`depots`<br>`risk_events` |

---

## 3. Schemas and Model Contracts

### 3.1 Backend Pydantic Schemas (`backend/app/schemas/`)

1. **`NetworkMetricsResponse`**:
   - `total_orders_today` (int)
   - `active_loading_orders` (int)
   - `avg_turnaround_minutes` (float)
   - `sla_compliance_pct` (float)
   - `active_risks_count` (int)
   - `active_decisions_count` (int)
   - `total_exposure_kes` (float)
   - `system_status` (str: "NOMINAL", "DEGRADED", "CRITICAL")

2. **`DepotLiveStateResponse`**:
   - `depot` (`DepotResponse`: id, name, code, latitude, longitude, active_bays, design_capacity_m3)
   - `active_trucks` (`List[YardTruckResponse]`: truck_id, registration, omc_name, order_id, stage, product, allocated_bay, wait_time_min, risk_status)
   - `bay_utilization_pct` (float)
   - `congestion_level` (str: "LOW", "MODERATE", "HIGH", "SEVERE")
   - `current_turnaround_min` (float)
   - `usable_capacity_m3` (float)
   - `degraded_capacity_m3` (float)
   - `offline_capacity_m3` (float)

3. **`OmcSummaryResponse` & `OmcOrdersResponse`**:
   - `omc_id` (str), `name` (str), `code` (str)
   - `active_orders_count` (int), `on_track_count` (int), `at_risk_count` (int)
   - `average_turnaround_minutes` (float), `sla_adherence_pct` (float)
   - `orders` (`List[LoadingOrderResponse]`: id, order_number, truck_registration, omc_id, depot_id, status, product_code, scheduled_volume_m3, bay_id, eta, gate_in_time, turnaround_minutes)

4. **`DecisionResponse`**:
   - `id` (int / str), `depot_id` (str), `decision_type` (str)
   - `risk_event_id` (int), `policy_rule` (str), `status` (str: "PENDING", "EXECUTED", "BLOCKED", "VERIFIED")
   - `suggested_action` (str), `mitigation_value_kes` (float), `target_reduction_min` (int)
   - `created_at` (datetime), `executed_at` (datetime)

5. **`ExecutiveMetricsResponse`**:
   - `total_exposure_protected_kes` (float)
   - `realized_savings_kes` (float)
   - `exposure_at_risk_kes` (float)
   - `avg_network_turnaround_min` (float)
   - `sla_compliance_pct` (float)
   - `autonomous_decisions_executed` (int)
   - `depot_performances` (`List[DepotExecutivePerformance]`)
   - `bottleneck_impacts` (`List[BottleneckImpactSummary]`)

### 3.2 Frontend TypeScript Interfaces (`src/types/flowguard.ts`)
- All backend responses are strictly typed and mapped in `HttpFlowGuardRepository`.
- Optional breakdown metrics (`loadingTrucksCount`, `queueTrucksCount`, `severityCounts`, `autoExecutedCount`, `autonomyDistribution`) allow rich UI analytics without modifying underlying database constraints.

---

## 4. PostgreSQL Database Schema Reference

The dashboard is backed by relational tables in the `flowguard-postgres` container:

1. **`depots`**:
   - Columns: `id` (PK, varchar), `name`, `code`, `latitude`, `longitude`, `active_bays`, `design_capacity_m3`, `status`.
   - Supports: Map rendering, capacity KPIs, bay allocation.

2. **`loading_orders`**:
   - Columns: `id` (PK, varchar), `order_number`, `truck_registration`, `omc_id` (FK), `depot_id` (FK), `product_code`, `volume_liters`, `status`, `stage`, `bay_id`, `created_at`, `gate_in_time`, `loading_start_time`, `loading_end_time`, `gate_out_time`, `turnaround_minutes`.
   - Populated from: 10,976 realistic loading orders across Nairobi, Mombasa, Nakuru, Eldoret, and Kisumu.
   - Supports: Order tables, yard tracking, turnaround trends, volume calculations.

3. **`omcs`**:
   - Columns: `id` (PK, varchar), `name`, `code`, `tier`, `contact_email`, `status`.
   - Populated from: Vivo Energy, TotalEnergies, Rubis Energy, Ola Energy, Hass Petroleum, and Lake Oil.
   - Supports: OMC visibility portal, SLA tracking, volume allocation.

4. **`risk_events`**:
   - Columns: `id` (PK, integer), `depot_id` (FK), `order_id` (FK), `event_type`, `severity`, `probability`, `financial_exposure_kes`, `status`, `predicted_at`, `resolved_at`.
   - Populated with active and monitored operational risks across all 5 depots (over KES 11.96M active financial exposure).
   - Supports: At-Risk Operations table, Risk Explanation Drawer, predictive bottleneck diagnosis.

5. **`decisions`**:
   - Columns: `id` (PK, integer), `depot_id` (FK), `risk_event_id` (FK), `autonomy_level`, `policy_code`, `intervention_type`, `action_payload`, `status`, `savings_kes`, `created_at`, `executed_at`.
   - Populated with 258 autonomous and supervised interventions.
   - Supports: Active Interventions panel, Candidate Interventions, Forensic Decision Drawer, Autonomy funnel.

---

## 5. Failure Behaviors (Offline / Backend Disconnected)

When `NEXT_PUBLIC_FLOWGUARD_DATA_MODE=api` and the FastAPI backend becomes unreachable or fails:

1. **Immediate State Detection**:
   - `HttpFlowGuardRepository` catches the connection error and sets `this.isConnected = false`.
   - `DataSourceContext` triggers a re-render across the entire React component tree.

2. **Visual Offline Status**:
   - `DataSourceBadge` displays a prominent red **`API (OFFLINE)`** or **`DISCONNECTED`** badge in every context bar and header.
   - For drivers on mobile devices, an amber alert banner warns that live yard telemetry is unavailable.

3. **Explicit Error Cards**:
   - An `ApiUnavailableCard` is displayed directly within each view (`NetworkCommandCentreView`, `DepotOperationsView`, `OmcVisibilityView`, `AutonomousControlView`, `ExecutiveControlView`).
   - Displays clear explanatory copy:
     > *"Live operational data unavailable. The FlowGuard FastAPI backend at `http://localhost:8000` is currently unreachable. Dashboard is operating in disconnected mode with no live pipeline data."*
   - Includes a **"Retry Connection"** button that immediately re-triggers `syncFromApi()`.

4. **Honest Placeholder Values**:
   - All KPI strips (`NetworkKpiStrip`, `DepotKpiStrip`, `OmcKpiStrip`, `ExecutiveKpiStrip`) render em-dashes (`"—"`) instead of false zero values (`"0"`, `"0 min"`, `"KES 0"`).
   - Prevents operators from misinterpreting a network disconnection as a cleared queue, zero turnaround time, or zero financial risk.

5. **Zero Silent Fallback**:
   - The system **never** substitutes synthetic mock data or dummy records during an API failure.
   - Tables render empty states (`[]`) or connection warning states, maintaining strict operational integrity.

---

## 6. Synthetic Mode Specification

- **Explicit Mode Activation**: Synthetic data is served **only** when `NEXT_PUBLIC_FLOWGUARD_DATA_MODE=synthetic` (or when unset in local standalone development).
- **Isolated Implementation**: Governed purely by `SyntheticFlowGuardRepository` using static in-memory fixtures.
- **Visual Notification**: `DataSourceBadge` clearly displays **`SYNTHETIC (MOCK)`** in orange to prevent any confusion with live field data.
- **No In-Flight Switching**: `HttpFlowGuardRepository` never instantiates or delegates to `SyntheticFlowGuardRepository`.
