"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Grid, Html } from "@react-three/drei";
import * as THREE from "three";
import { YardTruck, DepotCapacityState } from "@/types/flowguard";

// ---------------------------------------------------------------------------
// Zone layout (world units)
// ---------------------------------------------------------------------------
// Gate at z = +10, waiting lane z = +6, gantry row z = 0, exit at z = -8

const LANE_Z = 6;
const GANTRY_Z = 0;
const LANE_X_SPAN = 12;
const GANTRY_SPACING = 1.6;

// ---------------------------------------------------------------------------
// Zone color helpers
// ---------------------------------------------------------------------------
const gantryColor = (status: string) => {
  switch (status) {
    case "AVAILABLE": return "#2F855A";
    case "LOADING": return "#2B6CB0";
    case "DEGRADED": return "#D69E2E";
    case "MAINTENANCE":
    case "UNAVAILABLE": return "#C53030";
    default: return "#4A5568";
  }
};

const truckColor = (risk: string) => {
  switch (risk) {
    case "GREEN": return "#38A169";
    case "AMBER": return "#DD6B20";
    case "RED": return "#E53E3E";
    case "NEUTRAL": return "#718096";
    default: return "#A0AEC0";
  }
};

// ---------------------------------------------------------------------------
// Ground plane
// ---------------------------------------------------------------------------
const Ground: React.FC = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#0B1420" />
    </mesh>
    <Grid
      args={[30, 30]}
      cellSize={1}
      cellThickness={0.4}
      cellColor="#1F2937"
      sectionSize={5}
      sectionThickness={0.8}
      sectionColor="#374151"
      position={[0, 0, 0]}
      infiniteGrid={false}
      fadeDistance={40}
      fadeStrength={1}
    />
  </>
);

// ---------------------------------------------------------------------------
// A single gantry bay (cylinder + status ring)
// ---------------------------------------------------------------------------
interface GantryProps {
  index: number;
  status: string;
  code: string;
  activeTruckReg?: string;
  flowRateLpm?: number;
}

const Gantry: React.FC<GantryProps> = ({
  index,
  status,
  code,
  activeTruckReg,
  flowRateLpm,
}) => {
  const color = gantryColor(status);
  const ringRef = useRef<THREE.Mesh>(null);
  const isAnimated = status === "LOADING" || status === "DEGRADED";

  useFrame((state) => {
    if (!ringRef.current) return;
    if (status === "LOADING") {
      ringRef.current.rotation.z = state.clock.elapsedTime * 1.6;
    } else if (status === "DEGRADED") {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.12;
      ringRef.current.scale.set(s, s, 1);
    } else {
      ringRef.current.rotation.z = 0;
      ringRef.current.scale.set(1, 1, 1);
    }
  });

  const x = (index - 3.5) * GANTRY_SPACING;

  return (
    <group position={[x, 0, GANTRY_Z]}>
      {/* Base ring */}
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.72, 32]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>

      {/* Cylinder body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.36, 1.1, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={status === "LOADING" ? 0.45 : 0.15}
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>

      {/* Loading flow indicator */}
      {status === "LOADING" && (
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#63B3ED" />
        </mesh>
      )}

      {/* Bay code */}
      <Text
        position={[0, 1.55, 0]}
        fontSize={0.22}
        color="#E2E8F0"
        anchorX="center"
        anchorY="middle"
      >
        {code}
      </Text>

      {/* Live flow rate on hover-style label */}
      {status === "LOADING" && flowRateLpm && (
        <Text
          position={[0, 1.82, 0]}
          fontSize={0.15}
          color="#90CDF4"
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(flowRateLpm)} L/min
        </Text>
      )}

      {activeTruckReg && (
        <Text
          position={[0, -0.28, 0]}
          fontSize={0.14}
          color="#A0AEC0"
          anchorX="center"
          anchorY="middle"
        >
          {activeTruckReg}
        </Text>
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// A single truck cube that lerps toward a target
// ---------------------------------------------------------------------------
interface TruckProps {
  targetX: number;
  targetZ: number;
  color: string;
  pulsing?: boolean;
  label?: string;
}

const Truck: React.FC<TruckProps> = ({
  targetX,
  targetZ,
  color,
  pulsing,
  label,
}) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = ref.current;
    t.position.x += (targetX - t.position.x) * Math.min(1, delta * 3);
    t.position.z += (targetZ - t.position.z) * Math.min(1, delta * 3);
    if (pulsing) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      t.scale.set(s, 1, s);
    } else {
      t.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={ref} position={[targetX, 0, targetZ + 3]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.42, 0.32, 0.72]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.2, 0.4]} castShadow>
        <boxGeometry args={[0.36, 0.28, 0.24]} />
        <meshStandardMaterial color="#2D3748" />
      </mesh>
      {label && (
        <Text
          position={[0, 0.65, 0]}
          fontSize={0.13}
          color="#E2E8F0"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Zone floor plates (waiting, gantry, exit) with labels
// ---------------------------------------------------------------------------
const ZonePlate: React.FC<{
  x: number;
  z: number;
  width: number;
  depth: number;
  label: string;
  color: string;
}> = ({ x, z, width, depth, label, color }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} transparent opacity={0.14} />
    </mesh>
    <Text
      position={[x - width / 2 + 0.2, 0.05, z - depth / 2 - 0.45]}
      fontSize={0.28}
      color="#718096"
      anchorX="left"
      anchorY="middle"
    >
      {label}
    </Text>
  </group>
);

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
interface SceneProps {
  trucks: YardTruck[];
  capacity: DepotCapacityState;
}

const Scene: React.FC<SceneProps> = ({ trucks, capacity }) => {
  // Partition trucks by current stage
  const { waiting, onGantry, exiting } = useMemo(() => {
    const waiting: YardTruck[] = [];
    const onGantry: YardTruck[] = [];
    const exiting: YardTruck[] = [];

    for (const t of trucks) {
      if (t.currentStage === "Gate-In" || t.currentStage === "Validation / Release") {
        waiting.push(t);
      } else if (t.currentStage === "Loading") {
        onGantry.push(t);
      } else if (t.currentStage === "Ready to Exit" || t.currentStage === "Gate-Out") {
        exiting.push(t);
      }
    }
    return { waiting, onGantry, exiting };
  }, [trucks]);

  // Cap visual trucks to avoid overcrowding
  const visibleWaiting = waiting.slice(0, 10);
  const visibleExiting = exiting.slice(0, 10);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 14, 6]} intensity={1.1} castShadow />
      <directionalLight position={[-6, 8, -4]} intensity={0.3} color="#63B3ED" />

      <Ground />

      {/* Zone plates */}
      <ZonePlate
        x={0}
        z={LANE_Z}
        width={16}
        depth={2.6}
        label="WAITING LANE · GATE-IN / VALIDATION"
        color="#D69E2E"
      />
      <ZonePlate
        x={0}
        z={GANTRY_Z}
        width={16}
        depth={2.8}
        label="LOADING GANTRY BAYS"
        color="#3182CE"
      />
      <ZonePlate
        x={0}
        z={-LANE_Z}
        width={16}
        depth={2.6}
        label="EXIT LANE · READY / GATE-OUT"
        color="#38A169"
      />

      {/* Gantry bays (always 8 physical positions) */}
      {capacity.positions.map((p, i) => (
        <Gantry
          key={p.id}
          index={i}
          status={p.status}
          code={p.code}
          activeTruckReg={p.activeTruckReg}
          flowRateLpm={p.flowRateLpm}
        />
      ))}

      {/* Waiting lane trucks */}
      {visibleWaiting.map((t, i) => {
        const spread = Math.min(visibleWaiting.length, 10);
        const x =
          spread <= 1
            ? 0
            : -LANE_X_SPAN / 2 + (LANE_X_SPAN / (spread - 1)) * i;
        return (
          <Truck
            key={t.id}
            targetX={x}
            targetZ={LANE_Z}
            color={truckColor(t.riskStatus)}
            pulsing={t.riskStatus === "RED"}
            label={t.registration.split(" ")[1] || t.registration}
          />
        );
      })}

      {/* Exit lane trucks */}
      {visibleExiting.map((t, i) => {
        const spread = Math.min(visibleExiting.length, 10);
        const x =
          spread <= 1
            ? 0
            : -LANE_X_SPAN / 2 + (LANE_X_SPAN / (spread - 1)) * i;
        return (
          <Truck
            key={t.id}
            targetX={x}
            targetZ={-LANE_Z}
            color={truckColor(t.riskStatus)}
            pulsing={false}
            label={t.registration.split(" ")[1] || t.registration}
          />
        );
      })}

      {/* Empty-state hint when waiting lane has no trucks */}
      {visibleWaiting.length === 0 && (
        <Html
          position={[0, 0.4, LANE_Z]}
          center
          transform
          distanceFactor={10}
        >
          <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
            Queue clear
          </div>
        </Html>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// Exported wrapper
// ---------------------------------------------------------------------------
interface DepotTwin3DProps {
  trucks: YardTruck[];
  capacity: DepotCapacityState;
  height?: number;
}

export const DepotTwin3D: React.FC<DepotTwin3DProps> = ({
  trucks,
  capacity,
  height = 380,
}) => {
  return (
    <div
      className="relative w-full rounded-lg overflow-hidden border border-[#1F2937]"
      style={{ height }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 12, 14], fov: 42, near: 0.1, far: 200 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0A0F14"]} />
        <Suspense fallback={null}>
          <Scene trucks={trucks} capacity={capacity} />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={8}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0.5, 0]}
        />
      </Canvas>

      {/* Legend overlay */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-md border border-white/10 p-2.5 text-[10px] font-mono text-slate-200 space-y-1.5 pointer-events-none">
        <div className="font-bold uppercase tracking-wider text-slate-400 text-[9px] pb-1 border-b border-white/10 mb-1">
          Live Depot Twin
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2F855A]" />
          <span>Available gantry</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2B6CB0]" />
          <span>Loading</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D69E2E]" />
          <span>Degraded</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C53030]" />
          <span>Offline / maintenance</span>
        </div>
        <div className="pt-1 mt-1 border-t border-white/10 text-slate-400 text-[9px] leading-snug">
          Trucks: green = on track · amber = elevated · red = critical
        </div>
      </div>

      {/* Corner counter */}
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-md border border-white/10 px-2.5 py-1.5 text-[10px] font-mono text-slate-300 pointer-events-none">
        <span className="text-slate-500">Trucks in view: </span>
        <span className="text-white font-bold">{trucks.length}</span>
      </div>

      <div className="absolute bottom-3 left-3 text-[9px] font-mono text-slate-500 pointer-events-none">
        Drag to orbit · scroll to zoom
      </div>
    </div>
  );
};