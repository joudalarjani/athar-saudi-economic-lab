import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";
import { BUDGET } from "../data/types";

// ═══════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════

const C = {
  emerald: new THREE.Color("#198754"),
  emeraldLight: new THREE.Color("#20C997"),
  emeraldDim: new THREE.Color("#0F3D2A"),
  gold: new THREE.Color("#C9A227"),
  goldDim: new THREE.Color("#4A3A0D"),
  dim: new THREE.Color("#1E292D"),
  white: new THREE.Color("#F7F3EA"),
};

// ═══════════════════════════════════════════════════
// CAPITAL CORE — 100M SAR
// ═══════════════════════════════════════════════════

function CapitalCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const amounts = useStore((s) => s.amounts);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);
  const allocRatio = total / BUDGET;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Core shrinks as money is allocated
    const baseScale = 0.6 + (1 - allocRatio) * 0.5;
    const breathe = 1 + Math.sin(t * 0.8) * 0.02;
    const scale = baseScale * breathe;

    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y = t * 0.06;
    }
    if (wireRef.current) {
      wireRef.current.scale.setScalar(scale * 1.15);
      wireRef.current.rotation.y = -t * 0.04;
      wireRef.current.rotation.x = Math.sin(t * 0.1) * 0.15;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(scale * 2.0);
      const glowIntensity = 0.03 + allocRatio * 0.02;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowIntensity;
    }
    if (innerRef.current) {
      innerRef.current.scale.setScalar(scale * 0.4);
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 + allocRatio * 0.3;
    }
  });

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={C.emerald} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* Wireframe cage */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={C.emerald} wireframe transparent opacity={0.08} />
      </mesh>

      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#0a1f14"
          emissive={C.emerald}
          emissiveIntensity={0.2 + allocRatio * 0.3}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={C.emeraldLight} transparent opacity={0.5} />
      </mesh>

      {/* Gold ring — stable, represents the budget constraint */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.005, 12, 80]} />
        <meshBasicMaterial color={C.gold} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════
// SECTOR NODE — Economic Node
// ═══════════════════════════════════════════════════

function SectorNode({
  index,
  angle,
  radius,
}: {
  index: number;
  angle: number;
  radius: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const amounts = useStore((s) => s.amounts);

  const sectorId = SECTORS[index].id;
  const allocation = amounts[sectorId];
  const allocRatio = allocation / BUDGET;
  const isActive = allocation > 0;

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Node size grows with allocation (diminishing visual returns)
    const baseSize = 0.08;
    const allocSize = isActive ? Math.pow(allocRatio, 0.6) * 0.35 : 0.04;
    const breathe = 1 + Math.sin(t * 0.6 + index * 1.2) * 0.05;
    const size = (baseSize + allocSize) * breathe;

    if (meshRef.current) {
      meshRef.current.scale.setScalar(size / 0.08);
      // Color shift based on activity
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (isActive) {
        mat.emissive.lerp(C.emerald, 0.1);
        mat.emissiveIntensity = 0.3 + allocRatio * 0.5;
      } else {
        mat.emissive.lerp(C.dim, 0.1);
        mat.emissiveIntensity = 0.05;
      }
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(size / 0.08 * 2.5);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isActive ? 0.04 + allocRatio * 0.03 : 0.01;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3 + index;
      ringRef.current.scale.setScalar(isActive ? 1.0 : 0.6);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = isActive ? 0.15 : 0.04;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={C.emerald} transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>

      {/* Core */}
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#0a1a12"
          emissive={isActive ? C.emerald : C.dim}
          emissiveIntensity={isActive ? 0.4 : 0.05}
          roughness={0.5}
          metalness={0.4}
          wireframe={false}
        />
      </mesh>

      {/* Activity ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.008, 8, 40]} />
        <meshBasicMaterial color={isActive ? C.emerald : C.dim} transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════
// FLOW PARTICLES — Money Flow from Core to Nodes
// ═══════════════════════════════════════════════════

function FlowParticles() {
  const amounts = useStore((s) => s.amounts);

  const PARTICLES_PER_UNIT = 0.8;
  const maxParticles = 120;

  const particleData = useMemo(() => {
    const data: {
      sectorIndex: number;
      offset: number;
      speed: number;
      angle: number;
      radius: number;
    }[] = [];

    let count = 0;
    SECTORS.forEach((sec, i) => {
      const alloc = amounts[sec.id];
      if (alloc <= 0) return;
      const ratio = alloc / BUDGET;
      const n = Math.min(Math.floor(ratio * 100 * PARTICLES_PER_UNIT), 20);
      const angle = (i / 7) * Math.PI * 2;
      for (let j = 0; j < n && count < maxParticles; j++) {
        data.push({
          sectorIndex: i,
          offset: Math.random(),
          speed: 0.3 + ratio * 0.4,
          angle,
          radius: 3.2,
        });
        count++;
      }
    });
    return data;
  }, [amounts]);

  const count = particleData.length;
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current || count === 0) return;

    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const p = particleData[i];
      const phase = (t * p.speed + p.offset) % 1;
      const angle = p.angle;
      const nodeX = Math.cos(angle) * p.radius;
      const nodeZ = Math.sin(angle) * p.radius;

      // Lerp from core (0,0,0) to node
      const x = nodeX * phase;
      const z = nodeZ * phase;
      const y = Math.sin(phase * Math.PI) * 0.3;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={C.emeraldLight}
        size={0.04}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ═══════════════════════════════════════════════════
// CONNECTION LINES — Core to Nodes
// ═══════════════════════════════════════════════════

function ConnectionLines() {
  const amounts = useStore((s) => s.amounts);
  const lines = useMemo(() => {
    return SECTORS.map((sec, i) => {
      const angle = (i / 7) * Math.PI * 2;
      const radius = 3.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const alloc = amounts[sec.id];
      const isActive = alloc > 0;
      return { x, z, isActive, alloc };
    });
  }, [amounts]);

  return (
    <group>
      {lines.map((line, i) => {
        if (!line.isActive) return null;
        const points: [number, number, number][] = [
          [0, 0, 0],
          [line.x * 0.3, 0.05, line.z * 0.3],
          [line.x * 0.7, 0.02, line.z * 0.7],
          [line.x, 0, line.z],
        ];

        return (
          <Line
            key={i}
            points={points}
            color="#198754"
            lineWidth={0.8}
            transparent
            opacity={0.15 + (line.alloc / BUDGET) * 0.2}
          />
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════════════════
// AMBIENT PARTICLES — Background atmosphere
// ═══════════════════════════════════════════════════

function AmbientParticles() {
  const count = 60;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 4 + Math.random() * 4;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.01;
      const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        const y = posAttr.getY(i);
        posAttr.setY(i, y + Math.sin(t * 0.2 + i * 0.5) * 0.0008);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={C.emerald} size={0.015} transparent opacity={0.2} sizeAttenuation />
    </points>
  );
}

// ═══════════════════════════════════════════════════
// GROUND GRID — Blueprint feel
// ═══════════════════════════════════════════════════

function GroundGrid() {
  return (
    <group position={[0, -0.5, 0]}>
      <gridHelper args={[14, 28, C.dim, C.dim]} />
    </group>
  );
}

// ═══════════════════════════════════════════════════
// CAMERA CONTROLLER — Smooth transitions
// ═══════════════════════════════════════════════════

function CameraController() {
  const { camera } = useThree();
  const amounts = useStore((s) => s.amounts);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);
  const allocRatio = total / BUDGET;

  useEffect(() => {
    // Subtle camera pull-back as allocation increases
    const targetZ = 7 + allocRatio * 1.5;
    const targetY = 2.5 + allocRatio * 0.5;
    camera.position.set(0, targetY, targetZ);
    camera.lookAt(0, 0, 0);
  }, [allocRatio, camera]);

  return null;
}

// ═══════════════════════════════════════════════════
// MAIN SCENE
// ═══════════════════════════════════════════════════

function Scene() {
  const NODE_RADIUS = 3.2;

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={0.3} color="#f0f0e8" />
      <pointLight position={[0, 0, 0]} intensity={0.6} color={C.emerald} distance={10} />
      <pointLight position={[0, 3, 0]} intensity={0.2} color={C.emeraldLight} distance={15} />

      <CapitalCore />

      {SECTORS.map((_, i) => (
        <SectorNode
          key={i}
          index={i}
          angle={(i / 7) * Math.PI * 2}
          radius={NODE_RADIUS}
        />
      ))}

      <ConnectionLines />
      <FlowParticles />
      <AmbientParticles />
      <GroundGrid />
      <CameraController />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
        autoRotate
        autoRotateSpeed={0.3}
        dampingFactor={0.05}
        enableDamping
      />
    </>
  );
}

// ═══════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════

export function LabScene() {
  return (
    <div
      style={{
        width: "100%",
        height: "55vh",
        minHeight: 350,
        background: "radial-gradient(ellipse at center, #0d1210 0%, #070a0c 100%)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: "1px solid var(--border)",
      }}
    >
      <Canvas
        camera={{ position: [0, 2.5, 7], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
