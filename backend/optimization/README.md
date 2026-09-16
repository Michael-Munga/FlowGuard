# FlowGuard Optimization Engine

FlowGuard uses Google OR-Tools CP-SAT to produce bounded, simulated loading-position and
queue-dispatch recommendations for KPC petroleum terminals. This module is a pure decision
engine — it reads at most 12 active orders and the selected depot's loading positions;
it does not load historical event tables into the solver.

---

## Root Cause Analysis: Nairobi NO_FEASIBLE_PLAN

### Confirmed Root Cause

The original `NO_FEASIBLE_PLAN` failure occurred at **Stage A — No Eligible Orders**,
before CP-SAT was even invoked. This is why the response showed `solve_time_ms = 0.0`
and `candidates_count = 0`.

The eligibility query in `_build_optimization_input()` initially used statuses:

```
REGISTERED, ARRIVAL_PENDING, VALIDATING, STAGED, CALLED_FORWARD, POSITIONED, LOADING
```

The synthetic Nairobi dataset marks its three active orders as **`IN_PROGRESS`** — a valid
operational status that was missing from the filter list. With zero orders passed to the solver,
the optimizer returned immediately with the early-exit path, recording `~0ms` elapsed time.

### Database State at Diagnosis

| Metric | Value |
|--------|-------|
| Nairobi orders (`COMPLETED`) | 4,026 |
| Nairobi orders (`CANCELLED`) | 126 |
| Nairobi orders (`REJECTED`) | 91 |
| Nairobi orders (`IN_PROGRESS`) | **3** |
| Loading positions | 8 (all HEALTHY) |
| Compatible pairs (AGO) | LO-05211 ↔ P03,P04,P06,P07; LO-05212 ↔ P03,P04,P06,P07 |
| Compatible pairs (PMS) | LO-05219 ↔ P01,P02,P08 |
| Solver status after fix | **OPTIMAL** |

### Fix Applied

`IN_PROGRESS` was added to the eligibility status list. Completed, cancelled, and rejected
orders remain excluded. No constraints were weakened or removed.

---

## Architecture

```
POST /api/optimization/depot/{depot_id}/solve
        │
        ▼
OptimizationService._build_optimization_input()     ← timed: input_build_time_ms
        │   Queries: loading_positions, equipment_events, loading_orders (limit 12)
        │   Calls: PredictionService (arrival, turnaround, gate-out, risk)
        │
        ▼
FlowGuardOptimizer.solve_depot_schedule()           ← timed: model_build_time_ms + wall_time
        │   Builds CP-SAT model
        │   Enforces hard constraints
        │   Solves with 5s timeout
        │   Extracts schedule; builds candidates
        │
        ▼
PolicyEvaluator.evaluate()
        │   Checks constraint_status, action_type allowlist, risk level, confidence
        │
        ▼
SimulatedExecutionAdapter.dispatch_action()
        │   Simulated only — not connected to KPC SCADA
        │
        ▼
Persist: Decision + 8 DecisionStages + AutonomousAction + AuditEvent
```

---

## Eligibility Rules

Active orders passed to the optimizer must have `order_status` in:

```python
["REGISTERED", "ARRIVAL_PENDING", "VALIDATING", "STAGED",
 "CALLED_FORWARD", "POSITIONED", "LOADING", "IN_PROGRESS"]
```

Orders with `COMPLETED`, `CANCELLED`, or `REJECTED` status are **never** eligible.

---

## Position Availability

A loading position is marked **unavailable** when its most recent, position-specific
equipment event has:

- `status` in `{UNAVAILABLE, FAULT, OUT_OF_SERVICE}`, AND
- `resolved_timestamp IS NULL`

Depot-wide equipment events are **not** treated as bay outages because the canonical schema
does not link them to a specific `loading_position_id`.

Historical events with a resolved timestamp do not affect current availability — past
outages that were resolved are not permanent.

---

## Product Compatibility

Compatibility is checked using a case-insensitive substring match:

```python
order.product_id.upper() in position.product_compatibility.upper()
```

Example: `"AGO"` matches `"AGO / High-Flow"`, `"AGO / Dual-Arm"`, etc.

An order with zero compatible available positions is **excluded from the eligible set**
with a diagnostic reason. It does not cause other compatible orders to fail.

---

## Partial Scheduling (Bounded Dispatch)

The optimizer does **not** require every eligible order to be assigned a position
simultaneously. Each order has a `scheduled[o]` BoolVar. If capacity is insufficient
for all eligible orders, the solver selects the highest-priority feasible subset:

```
eligible_orders = 10
available_compatible_positions = 4

→ valid outcome: schedule 4, queue 6
→ NOT treated as infeasible
```

This is queue-management / dispatch optimization, not full historical scheduling.

---

## Solver Status Mapping

| CP-SAT Result | API `status` |
|---------------|-------------|
| Before solver — no orders | `NO_ELIGIBLE_ORDERS` |
| Before solver — no available positions | `NO_AVAILABLE_POSITIONS` |
| Before solver — no compatible pairs | `NO_COMPATIBLE_POSITIONS` |
| `OPTIMAL` | `OPTIMAL` |
| `FEASIBLE` | `FEASIBLE` |
| `INFEASIBLE` | `INFEASIBLE` |
| `UNKNOWN` (timeout) | `TIME_LIMIT` |
| `MODEL_INVALID` | `MODEL_INVALID` |
| Solver queued all orders | `NO_FEASIBLE_PLAN` |

---

## Diagnostics

The OPTIMIZE stage payload (persisted in `decision_stages`) contains:

```json
{
  "input_build_time_ms": 45.2,
  "model_build_time_ms": 1.4,
  "wall_time": 18.3,
  "solve_time_ms": 20.1,
  "orders_considered": 3,
  "eligible_orders": 3,
  "excluded_orders": [],
  "available_positions": 8,
  "unavailable_positions": 0,
  "compatible_order_position_pairs": 11,
  "model_variable_count": 48,
  "constraint_count": 57,
  "scheduled_orders": 3,
  "queued_orders": 0,
  "status_name": "OPTIMAL",
  "objective_value": -...,
  "num_branches": ...,
  "num_conflicts": 0
}
```

---

## Policy Separation

The optimizer answers: *"What plan is mathematically best?"*

The policy engine answers: *"Is this recommendation permitted to be automated?"*

Policy states:
- `AUTO_EXECUTABLE` (L2) — routine, reversible, within allowlist
- `APPROVAL_REQUIRED` (L3) — exceeds autonomous limits or critical risk
- `BLOCKED_BY_POLICY` — constraint violation or empty targets

---

## Simulation Boundary

No adapter is connected to KPC gantry or SCADA systems. All execution is simulated:

```
execution_result: "EXECUTION_SIMULATED_NOT_CONNECTED_TO_KPC_SYSTEMS"
control_state: "SIMULATED"
```

---

## Running the Nairobi Demo

```bash
# Primary demo
curl -X POST 'http://localhost:8000/api/optimization/depot/nairobi/solve' | python3 -m json.tool

# Non-Nairobi validation
curl -X POST 'http://localhost:8000/api/optimization/depot/mombasa/solve' | python3 -m json.tool
```

See [OPTIMIZATION_MODEL.md](OPTIMIZATION_MODEL.md) for the CP-SAT formulation and
[OPTIMIZATION_PERFORMANCE.md](OPTIMIZATION_PERFORMANCE.md) for timing measurements.
