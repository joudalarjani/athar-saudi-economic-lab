import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MoneyFlowProps {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  intensity: number; // 0-1, controls particle count and speed
}

/**
 * Money Flow — particles traveling from Capital Pool to a Sector Node.
 * The number and speed of particles are proportional to the allocation.
 */
export function MoneyFlow({ from, to, color, intensity }: MoneyFlowProps) {
  const particlesRef = useRef<THREE.Points>(null);

  // Particle count scales with intensity (min 5, max 100)
  const particleCount = Math.max(5, Math.floor(intensity * 100));

  // Generate random initial positions along the path
  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      const point = getBezierPoint(from, to, t);
      arr[i * 3] = point[0];
      arr[i * 3 + 1] = point[1];
      arr[i * 3 + 2] = point[2];
    }
    return arr;
  }, [particleCount, from, to]);

  // Phase offset for each particle
  const phases = useMemo(() => {
    return new Float32Array(particleCount).map(() => Math.random());
  }, [particleCount]);

  // Trail geometry: draw a thin curved line from pool to node
  const curvePoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const p = getBezierPoint(from, to, t);
      points.push(new THREE.Vector3(p[0], p[1], p[2]));
    }
    return new THREE.CatmullRomCurve3(points);
  }, [from, to]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const t = state.clock.elapsedTime;
    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      // Progress along the path (with phase offset)
      const progress = ((t * 0.15 + phases[i]) % 1);
      const point = getBezierPoint(from, to, progress);
      positions[i * 3] = point[0];
      positions[i * 3 + 1] = point[1];
      positions[i * 3 + 2] = point[2];
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Curved trail */}
      <mesh>
        <tubeGeometry args={[curvePoints, 32, 0.005, 8, false]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15 + intensity * 0.2}
        />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.04 + intensity * 0.04}
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function getBezierPoint(
  from: [number, number, number],
  to: [number, number, number],
  t: number
): [number, number, number] {
  // Quadratic bezier with control point at midpoint + Y offset for arc
  const midX = (from[0] + to[0]) / 2;
  const midY = (from[1] + to[1]) / 2 + 0.5;
  const midZ = (from[2] + to[2]) / 2;

  const x = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * midX + t * t * to[0];
  const y = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * midY + t * t * to[1];
  const z = (1 - t) * (1 - t) * from[2] + 2 * (1 - t) * t * midZ + t * t * to[2];

  return [x, y, z];
}
