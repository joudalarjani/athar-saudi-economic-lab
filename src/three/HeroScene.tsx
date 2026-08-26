import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function CapitalCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.1;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.06;
      wireRef.current.rotation.z = t * 0.04;
    }
    if (glowRef.current) {
      const scale = 1.8 + Math.sin(t * 0.6) * 0.08;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.15}>
      <group>
        <mesh ref={glowRef}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color="#198754"
            transparent
            opacity={0.04}
            side={THREE.BackSide}
          />
        </mesh>

        <mesh ref={wireRef}>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshBasicMaterial
            color="#198754"
            wireframe
            transparent
            opacity={0.12}
          />
        </mesh>

        <mesh ref={meshRef}>
          <sphereGeometry args={[0.85, 64, 64]} />
          <meshStandardMaterial
            color="#0a2e1a"
            emissive="#198754"
            emissiveIntensity={0.35}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshBasicMaterial color="#20C997" transparent opacity={0.6} />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.6, 0.008, 16, 100]} />
          <meshBasicMaterial color="#C9A227" transparent opacity={0.3} />
        </mesh>

        <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
          <torusGeometry args={[1.9, 0.005, 16, 100]} />
          <meshBasicMaterial color="#198754" transparent opacity={0.15} />
        </mesh>

        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          const radius = 2.8;
          return (
            <SectorNode
              key={i}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              index={i}
            />
          );
        })}
      </group>
    </Float>
  );
}

function SectorNode({ position, index }: { position: [number, number, number]; index: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const pulse = 0.06 + Math.sin(t * 0.5 + index * 0.9) * 0.02;
      ref.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#198754" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Particles() {
  const count = 80;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.015;
      const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        const y = posAttr.getY(i);
        posAttr.setY(i, y + Math.sin(t * 0.3 + i) * 0.001);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#198754"
        size={0.02}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

export function HeroScene() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}
    >
      <Canvas
        camera={{ position: [0, 2.5, 7], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 8, 5]} intensity={0.4} color="#f0f0e8" />
        <pointLight position={[0, 0, 0]} intensity={0.8} color="#198754" distance={8} />
        <pointLight position={[0, 2, 0]} intensity={0.3} color="#20C997" distance={12} />
        <CapitalCore />
        <Particles />
      </Canvas>
    </div>
  );
}
