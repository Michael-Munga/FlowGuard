# FlowGuard demo policy

`PolicyEvaluator` is deterministic and separate from optimization. Its configurable demo assumptions are centralized in `policy_config.py`:

- infeasible constraints or empty targets are `BLOCKED_BY_POLICY`;
- restricted action types require approval;
- more than six affected orders, critical risk (85+), insufficient confidence (below 75%), or a non-allowlisted action require approval;
- feasible, allowlisted, low-impact actions meeting confidence requirements are `AUTO_EXECUTABLE` in the simulator only.

These are FlowGuard demo governance assumptions, not verified KPC operating limits. Approval changes a decision only to simulated execution; `SimulatedExecutionAdapter` explicitly reports `EXECUTION_SIMULATED_NOT_CONNECTED_TO_KPC_SYSTEMS` and has no external system client.

Deduplication reuses the most recent decision for the same depot for 15 minutes unless `force_new=true`. Decisions, stages, actions, and audit rows are append-only; historic decisions are not overwritten.
