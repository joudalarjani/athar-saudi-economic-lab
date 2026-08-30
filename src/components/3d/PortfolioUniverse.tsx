import { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Stars,
  Float,
  Sparkles,
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { SECTORS } from '../../data/sectors';
import { useLabStore } from '../../state/labStore';

/**
 * Portfolio Universe — the cinematic 3D centerpiece
 *
 * A constellation of 7 glowing sector "towers" rising from a
 * procedural grid floor, with a central gold Capital Pool at the
 * heart. Animated particles flow from the pool to each tower.
 *
 * Each tower's height = allocation share.
 * Each tower's color = sector color.
 *
 * Inspired by Bloomberg VR Data Lab + Apple Vision Pro.
 */

const TOWER_RADIUS = 0.45;
const BASE_RADIUS = 3.5;

interface TowerProps {
  id: string;
  color: string;
  position: [number, number, number];
  height: number;
  isHovered: boolean;
  onHover: (h: boolean) => void;
}

function SectorTower({ id: _id, color, position, height, isHovered, onHover }: TowerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = isHovered ? 1.05 : 1;
      meshRef.current.scale.set(scale, 1, scale);
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (lightRef.current) {
      lightRef.current.intensity = isHovered ? 4 : 2.5;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(false);
        }}
      >
        <cylinderGeometry args={[TOWER_RADIUS, TOWER_RADIUS * 1.2, height, 32, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 1.5 : 0.8}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>

      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS, TOWER_RADIUS * 1.2, height, 16, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.25} />
      </mesh>

      <mesh position={[0, height + 0.05, 0]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, height + 0.5, 0]}
        color={color}
        intensity={2.5}
        distance={4}
      />

      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[TOWER_RADIUS * 1.5, 0.02, 8, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      <Sparkles
        count={20}
        scale={[1.2, 0.5, 1.2]}
        position={[0, height + 0.5, 0]}
        size={3}
        speed={0.3}
        color={color}
      />
    </group>
  );
}

function CentralPool() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  const particleCount = 300;
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.3 + Math.random() * 0.5;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -state.clock.elapsedTime * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -state.clock.elapsedTime * 0.08;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ring3Ref.current.rotation.x = Math.PI / 3;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.7, 3]} />
        <meshStandardMaterial
          color="#C7A04A"
          emissive="#C7A04A"
          emissiveIntensity={1.2}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh ref={innerRef}>
        <dodecahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial
          color="#FFD580"
          emissive="#FFD580"
          emissiveIntensity={2}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#FFD580"
          size={0.04}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.012, 12, 64]} />
        <meshStandardMaterial
          color="#C7A04A"
          emissive="#C7A04A"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.3, 0.008, 12, 64]} />
        <meshStandardMaterial
          color="#0F6E4F"
          emissive="#0F6E4F"
          emissiveIntensity={0.5}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.5, 0.006, 12, 64]} />
        <meshStandardMaterial
          color="#FFD580"
          emissive="#FFD580"
          emissiveIntensity={0.3}
          transparent
          opacity={0.3}
        />
      </mesh>

      <pointLight color="#FFD580" intensity={3} distance={8} />
    </group>
  );
}

interface FlowStreamProps {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  intensity: number;
}

function FlowStream({ from, to, color, intensity }: FlowStreamProps) {
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y += 0.5;
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [from, to]);

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.04, 12, false), [curve]);

  if (intensity < 0.02) return null;

  return (
    <group>
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial color={color} transparent opacity={0.15 + intensity * 0.25} />
      </mesh>
      {intensity > 0.1 && (
        <Sparkles
          count={Math.floor(intensity * 30)}
          scale={[2, 1.5, 2]}
          size={4}
          speed={0.5}
          color={color}
        />
      )}
    </group>
  );
}

function GridFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[20, 20, 20, 20]} />
        <meshStandardMaterial
          color="#10162A"
          transparent
          opacity={0.4}
          wireframe
          emissive="#C7A04A"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[BASE_RADIUS - 0.02, BASE_RADIUS + 0.02, 64]} />
        <meshBasicMaterial color="#C7A04A" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[BASE_RADIUS * 1.5 - 0.02, BASE_RADIUS * 1.5 + 0.02, 64]} />
        <meshBasicMaterial color="#0F6E4F" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export function PortfolioUniverse() {
  const allocations = useLabStore((s) => s.allocations);
  const cameraMode = useLabStore((s) => s.cameraMode);
  const totalBudget = useLabStore((s) => s.totalBudget);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0);
  void totalAllocated;

  const sectorPositions = useMemo(() => {
    return SECTORS.map((s, i) => {
      const angle = (i / SECTORS.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: s.id,
        arName: s.arName,
        color: s.color,
        position: [
          Math.cos(angle) * BASE_RADIUS,
          0,
          Math.sin(angle) * BASE_RADIUS,
        ] as [number, number, number],
      };
    });
  }, []);

  const getHeight = (allocation: number) => {
    const minA = totalBudget * 0.03;
    const maxA = totalBudget * 0.5;
    const t = Math.max(0, Math.min(1, (allocation - minA) / (maxA - minA)));
    return 0.5 + t * 3.5;
  };

  return (
    <Canvas
      camera={{ position: [0, 4, 10], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#050810']} />
      <fog attach="fog" args={['#050810', 12, 25]} />

      <Suspense fallback={null}>
        <ambientLight intensity={0.2} color="#FFD580" />
        <directionalLight position={[5, 10, 5]} intensity={0.4} color="#FFD580" />
        <pointLight position={[0, 0, 0]} intensity={3} color="#C7A04A" distance={10} />
        <pointLight position={[8, 4, -5]} intensity={0.6} color="#0F6E4F" distance={15} />
        <pointLight position={[-8, 3, 5]} intensity={0.4} color="#FB7185" distance={12} />

        <Stars radius={80} depth={50} count={2000} factor={4} fade speed={0.3} />

        <GridFloor />

        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <CentralPool />
        </Float>

        {sectorPositions.map((s) => {
          const allocation = allocations[s.id] ?? 0;
          const intensity = allocation / totalBudget;
          return (
            <SectorTower
              key={s.id}
              id={s.id}
              color={s.color}
              position={s.position}
              height={getHeight(allocation)}
              isHovered={hoveredId === s.id}
              onHover={(h) => setHoveredId(h ? s.id : null)}
            />
          );
        })}

        {sectorPositions.map((s) => {
          const allocation = allocations[s.id] ?? 0;
          const intensity = allocation / totalBudget;
          if (intensity < 0.01) return null;
          return (
            <FlowStream
              key={`flow-${s.id}`}
              from={[0, 0.5, 0]}
              to={[s.position[0], getHeight(allocation) * 0.5, s.position[2]]}
              color={s.color}
              intensity={intensity}
            />
          );
        })}

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={6}
          maxDistance={18}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={cameraMode === 'cinematic'}
          autoRotateSpeed={0.3}
          target={[0, 1.5, 0]}
          enableDamping
          dampingFactor={0.05}
        />

        <EffectComposer>
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.85}
          />
          <Vignette eskil={false} offset={0.25} darkness={0.7} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
