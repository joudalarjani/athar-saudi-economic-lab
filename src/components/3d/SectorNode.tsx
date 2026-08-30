import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface SectorNodeProps {
  id: string;
  arName: string;
  enName: string;
  color: string;
  position: [number, number, number];
  allocation: number;
  maxAllocation: number;
  budget: number;
  isHovered?: boolean;
  onClick?: () => void;
  onHover?: (hover: boolean) => void;
}

/**
 * A Sector Node — represents one of the 7 economic sectors.
 * Its size scales with allocation; floats subtly.
 */
export function SectorNode({
  id,
  arName,
  enName,
  color,
  position,
  allocation,
  maxAllocation,
  budget,
  isHovered,
  onClick,
  onHover,
}: SectorNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Size scales with allocation share
  const allocationShare = allocation / maxAllocation;
  const baseSize = 0.18;
  const maxSize = 0.55;
  const size = baseSize + Math.pow(allocationShare, 0.6) * (maxSize - baseSize);

  // Different geometry per sector for visual distinction
  const geometry = useMemo(() => {
    const geometries = [
      () => new THREE.OctahedronGeometry(size, 1),
      () => new THREE.DodecahedronGeometry(size, 1),
      () => new THREE.IcosahedronGeometry(size, 1),
      () => new THREE.TetrahedronGeometry(size, 1),
      () => new THREE.OctahedronGeometry(size, 0),
      () => new THREE.DodecahedronGeometry(size, 0),
      () => new THREE.IcosahedronGeometry(size, 0),
    ];
    const idx = Math.abs(hashCode(id)) % geometries.length;
    return geometries[idx]();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, id]);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.05;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    onHover?.(true);
  };
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    onHover?.(false);
  };

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        scale={isHovered ? 1.15 : 1}
        onClick={onClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 1.0 : 0.6}
          metalness={0.7}
          roughness={0.25}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Wireframe outline */}
      <mesh>
        <primitive object={geometry} attach="geometry" />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Label below */}
      <Text
        position={[0, -size - 0.2, 0]}
        fontSize={0.12}
        color={isHovered ? '#FFD580' : '#E8E9F0'}
        anchorX="center"
        anchorY="top"
        outlineWidth={0.005}
        outlineColor="#0A0E1A"
      >
        {arName}
      </Text>

      {/* Allocation % */}
      <Text
        position={[0, -size - 0.4, 0]}
        fontSize={0.08}
        color={color}
        anchorX="center"
        anchorY="top"
      >
        {budget > 0 ? ((allocation / budget) * 100).toFixed(1) : '0.0'}%
      </Text>
    </group>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
