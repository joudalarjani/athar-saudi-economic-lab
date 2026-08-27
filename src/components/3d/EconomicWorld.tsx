import { useMemo, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { CapitalPool } from './CapitalPool';
import { SectorNode } from './SectorNode';
import { MoneyFlow } from './MoneyFlow';
import { SECTORS } from '../../data/sectors';
import { useLabStore } from '../../state/labStore';
import { TOTAL_BUDGET } from '../../data/sectors';

const SECTOR_RADIUS = 2.5;

/**
 * The Economic World — the 3D interactive scene.
 * 7 sector nodes arranged in a circle around the central Capital Pool,
 * with money flowing from pool to nodes based on allocation.
 */
export function EconomicWorld() {
  const allocations = useLabStore((s) => s.allocations);
  const setStage = useLabStore((s) => s.setStage);
  const showLabels = useLabStore((s) => s.showLabels);
  const cameraMode = useLabStore((s) => s.cameraMode);

  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  // Calculate total allocated
  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0);

  // Position sectors in a circle
  const sectorPositions = useMemo(() => {
    return SECTORS.map((s, i) => {
      const angle = (i / SECTORS.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: s.id,
        arName: s.arName,
        enName: s.enName,
        color: s.color,
        position: [
          Math.cos(angle) * SECTOR_RADIUS,
          0,
          Math.sin(angle) * SECTOR_RADIUS,
        ] as [number, number, number],
      };
    });
  }, []);

  // Camera position based on mode
  const cameraPosition: [number, number, number] =
    cameraMode === 'top'
      ? [0, 6, 0.001]
      : cameraMode === 'cinematic'
      ? [0, 1.5, 5.5]
      : [0, 1.5, 5.5];

  return (
    <Canvas
      camera={{ position: cameraPosition, fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#0A0E1A']} />
      <fog attach="fog" args={['#0A0E1A', 8, 18]} />

      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.4} color="#FFD580" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#C7A04A" distance={5} />
      <pointLight position={[3, 2, -3]} intensity={0.6} color="#0F6E4F" distance={8} />
      <pointLight position={[-3, -2, 3]} intensity={0.4} color="#FB7185" distance={6} />

      {/* Stars background */}
      <Stars radius={50} depth={50} count={1000} factor={3} fade speed={0.5} />

      {/* Distant grid floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#10162A"
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>

      {/* Central Capital Pool */}
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <CapitalPool totalAllocated={totalAllocated} totalBudget={TOTAL_BUDGET} />
      </Float>

      {/* Sector nodes */}
      {sectorPositions.map((s) => (
        <SectorNode
          key={s.id}
          id={s.id}
          arName={s.arName}
          enName={s.enName}
          color={s.color}
          position={s.position}
          allocation={allocations[s.id] ?? 0}
          maxAllocation={TOTAL_BUDGET * 0.6}
          isHovered={hoveredSector === s.id}
          onHover={(hover: boolean) => setHoveredSector(hover ? s.id : null)}
          onClick={() => setStage('analysis')}
        />
      ))}

      {/* Money flows from pool to each node */}
      {sectorPositions.map((s) => {
        const allocation = allocations[s.id] ?? 0;
        const intensity = allocation / TOTAL_BUDGET;
        if (intensity < 0.01) return null;
        return (
          <MoneyFlow
            key={`flow-${s.id}`}
            from={[0, 0, 0]}
            to={s.position}
            color={s.color}
            intensity={intensity}
          />
        );
      })}

      {/* Connection circles on the ground (subtle decoration) */}
      {[2.5, 3.5].map((r, i) => (
        <mesh key={`ring-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
          <ringGeometry args={[r - 0.01, r + 0.01, 64]} />
          <meshBasicMaterial
            color={i === 0 ? '#C7A04A' : '#0F6E4F'}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3.5}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={cameraMode === 'cinematic'}
        autoRotateSpeed={0.3}
        target={[0, 0, 0]}
      />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
