import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CapitalPoolProps {
  totalAllocated: number;
  totalBudget: number;
}

/**
 * The Capital Pool — central 3D element representing 100M SAR.
 * A glowing gold sphere with internal particles and a pulsing aura.
 */
export function CapitalPool({ totalAllocated, totalBudget }: CapitalPoolProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Particle data — internal "atoms"
  const particleCount = 200;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.3 + Math.random() * 0.4;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  // Remaining budget affects color intensity
  const remainingRatio = totalBudget > 0 ? 1 - totalAllocated / totalBudget : 0;
  const goldIntensity = Math.max(0.3, 0.5 + remainingRatio * 0.5);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -state.clock.elapsedTime * 0.15;
      innerRef.current.rotation.z = state.clock.elapsedTime * 0.08;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer glow sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.7, 3]} />
        <meshStandardMaterial
          color="#C7A04A"
          emissive="#C7A04A"
          emissiveIntensity={goldIntensity}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Inner solid core */}
      <mesh ref={innerRef}>
        <dodecahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial
          color="#FFD580"
          emissive="#FFD580"
          emissiveIntensity={1.2}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Particle system inside */}
      <points ref={particlesRef}>
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
          size={0.025}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Outer ring (decorative) */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.0, 0.008, 8, 64]} />
        <meshStandardMaterial
          color="#C7A04A"
          emissive="#C7A04A"
          emissiveIntensity={0.6}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Second decorative ring (perpendicular) */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.15, 0.005, 8, 64]} />
        <meshStandardMaterial
          color="#0F6E4F"
          emissive="#0F6E4F"
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
