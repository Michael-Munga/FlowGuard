"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/CommandCentre/Shell/AppSidebar";
import { AutonomyStatusBar } from "./Header/AutonomyStatusBar";
import { AutonomyStatusCard } from "./Header/AutonomyStatusCard";
import { ActiveIncidentHero } from "./Hero/ActiveIncidentHero";
import { AutonomousDecisionTimeline } from "./Timeline/AutonomousDecisionTimeline";
import { PredictionAndDiagnosisPanel } from "./Diagnosis/PredictionAndDiagnosisPanel";
import { CandidateInterventionsTable } from "./Optimization/CandidateInterventionsTable";
import { PolicyGovernancePanel } from "./Policy/PolicyGovernancePanel";
import { ClosedLoopVerificationCard } from "./Verification/ClosedLoopVerificationCard";
import { ControlBoundariesAndActionsCard } from "./Governance/ControlBoundariesAndActionsCard";
import { DataSourcesHealthGrid } from "./Health/DataSourcesHealthGrid";
import { AutonomousActionHistoryTable } from "./History/AutonomousActionHistoryTable";
import { ForensicDecisionDrawer } from "./Drawer/ForensicDecisionDrawer";
import { useAutonomousControlData } from "@/hooks/useAutonomousControlData";
import { ShieldCheck, Info } from "lucide-react";

interface AutonomousControlViewProps {
  initialIncidentId?: string;
  subView?: "all" | "decisions" | "history" | "health";
  onNavigateDashboard?: (id: string) => void;
}

export const AutonomousControlView: React.FC<AutonomousControlViewProps> = ({
  initialIncidentId = "INT-8801",
  subView = "decisions",
  onNavigateDashboard,
}) => {
  const router = useRouter();

  const {
    incidents,
    activeIncident,
    activeIncidentId,
    setActiveIncidentId,
    selectedIncident,
    isDrawerOpen,
    handleOpenDrawer,
    handleCloseDrawer,
    telemetrySources,
    policyRules,
    metrics,
    subsystemHealth,
    autonomyState,
    isDegradedMode,
    isActionPending,
    toggleDegradedMode,
    authorizeAction,
    rejectAction,
    filterStatus,
    setFilterStatus,
    filterDepot,
    setFilterDepot,
    searchQuery,
    setSearchQuery,
    filteredHistory,
    refresh,
  } = useAutonomousControlData(initialIncidentId);

  // Sub-view tab navigation handler
  const handleSelectSubView = useCallback(
    (view: "all" | "decisions" | "history" | "health") => {
      if (view === "decisions" || view === "all") {
        router.push("/engineer/decisions");
      } else if (view === "history") {
        router.push("/engineer/history");
      } else if (view === "health") {
        router.push("/engineer/health");
      }
    },
    [router]
  );

  return (
    <div className="flex min-h-screen bg-[#FAFBFC] text-[#0F1B2B]">
      {/* 1. Fixed Global Role-Based Sidebar */}
      <AppSidebar
        activeDashboard="autonomous-control"
        onSelectDashboard={onNavigateDashboard}
        activeInterventionsCount={1}
      />

      {/* 2. Main Content Area */}
      <main className="ml-[240px] flex-1 flex flex-col min-w-0">
        {/* Sticky Status Bar & Sub-View Tabs */}
        <AutonomyStatusBar
          autonomyState={autonomyState}
          subsystemHealth={subsystemHealth}
          metrics={metrics}
          isDegradedMode={isDegradedMode}
          onToggleDegradedMode={toggleDegradedMode}
          onRefresh={refresh}
          activeSubView={subView}
          onSelectSubView={handleSelectSubView}
        />

        {/* Dashboard Body */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Autonomy Status Card (Section 6: L1/L2/L3 counts & prototype framework) */}
          <AutonomyStatusCard
            isDegradedMode={isDegradedMode}
            l1Count={3}
            l2Count={4}
            l3Count={1}
          />

          {/* ========================================================================= */}
          {/* ROUTE 1: /engineer/decisions — Active Autonomous Control Loop             */}
          {/* ========================================================================= */}
          {(subView === "all" || subView === "decisions") && activeIncident && (
            <>
              {/* 1. Active Decision Hero & Complete Control-Loop Story (Sections 8 & 9) */}
              <ActiveIncidentHero
                incidents={incidents}
                activeIncident={activeIncident}
                onSelectIncident={setActiveIncidentId}
                onAuthorizeAction={authorizeAction}
                onRejectAction={rejectAction}
                onOpenDrawer={handleOpenDrawer}
                isActionPending={isActionPending}
              />

              {/* 2. Central Visual Concept: 8-Stage Autonomous Decision Pipeline (Section 7) */}
              <AutonomousDecisionTimeline
                steps={activeIncident.timelineSteps}
                incidentId={activeIncident.id}
                onOpenDrawer={() => handleOpenDrawer(activeIncident)}
              />

              {/* 3. Prediction Detail & Error + Causal Diagnosis (Sections 10, 11, 12, 13, 15, 34) */}
              <PredictionAndDiagnosisPanel incident={activeIncident} />

              {/* 4. Optimization & Candidate Interventions (Sections 14 & 35) */}
              <CandidateInterventionsTable
                candidates={activeIncident.candidates}
                selectedCandidateId={activeIncident.selectedCandidateId}
                incidentId={activeIncident.id}
              />

              {/* 5. Policy & Governance Panel (Sections 16 & 17) */}
              <PolicyGovernancePanel
                policyRules={policyRules}
                activeRuleCode={activeIncident.appliedPolicy.code}
              />

              {/* 6. Execution Lifecycle & Closed-Loop Verification (Sections 18, 19, 20, 44, 45) */}
              <ClosedLoopVerificationCard
                metrics={metrics}
                activeVerification={activeIncident.verification}
                activeIncidentId={activeIncident.id}
              />

              {/* 7. Control Boundaries & Active Interventions Table (Sections 36 & 37) */}
              <ControlBoundariesAndActionsCard />
            </>
          )}

          {/* ========================================================================= */}
          {/* ROUTE 2: /engineer/history — Full Forensic Decision History & Audit Log    */}
          {/* ========================================================================= */}
          {(subView === "all" || subView === "history") && (
            <AutonomousActionHistoryTable
              incidents={filteredHistory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              filterDepot={filterDepot}
              onFilterDepotChange={setFilterDepot}
              onSelectIncident={(inc) => {
                setActiveIncidentId(inc.id);
                handleOpenDrawer(inc);
              }}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {/* ========================================================================= */}
          {/* ROUTE 3: /engineer/health — Operational Telemetry & Data Sources Health    */}
          {/* ========================================================================= */}
          {(subView === "all" || subView === "health") && (
            <>
              <DataSourcesHealthGrid
                sources={telemetrySources}
                isDegradedMode={isDegradedMode}
              />

              {activeIncident && (
                <ClosedLoopVerificationCard
                  metrics={metrics}
                  activeVerification={activeIncident.verification}
                  activeIncidentId={activeIncident.id}
                />
              )}
            </>
          )}

          {/* Operational Boundaries & Simulation Disclaimer Footer */}
          <div className="p-4 rounded-lg bg-white border border-[#E2E6EA] text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1B7A3D] shrink-0" />
              <span>
                <strong>KPC FlowGuard Autonomous Control Plane (Engine View)</strong> • Demonstrating explainable AI optimization, bounded autonomy, and closed-loop verification.
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Prototype diagnostic telemetry modeled on KPC operational domains (mass-flow metering, gate events, tank readiness, and loading orders).
            </span>
          </div>
        </div>
      </main>

      {/* 3. Forensic Decision Deep-Dive Drawer (Sections 24 & 25) */}
      <ForensicDecisionDrawer
        incident={selectedIncident}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAuthorizeAction={authorizeAction}
        onRejectAction={rejectAction}
        isActionPending={isActionPending}
      />
    </div>
  );
};
