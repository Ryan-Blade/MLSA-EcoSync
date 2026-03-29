import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlantProps {
  position: [number, number, number];
}

export function WindTurbine({ position }: PlantProps) {
  const bladesRef = useRef<THREE.Group>(null);
  
  // Animate the spinning blades continuously
  useFrame(() => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z -= 0.04; 
    }
  });

  return (
    <group position={position} scale={0.7}>
      {/* Tower Mast */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.15, 0.35, 8, 16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Generator Hub Nacelle */}
      <mesh position={[0, 8, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.25, 1.2, 16, 16]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.2} roughness={0.5} />
      </mesh>
      
      {/* Rotor Assembly */}
      <group ref={bladesRef} position={[0, 8, 0.9]}>
        {/* Hub */}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.4} />
        </mesh>
        
        {/* Three Blades spaced 120 degrees */}
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <mesh position={[0, 2.5, 0]}>
              <boxGeometry args={[0.1, 5, 0.02]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Ground Pad */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export function SolarPlant({ position }: PlantProps) {
  return (
    <group position={position} scale={0.8}>
      {/* Base Foundation */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      
      {/* Grid of Solar Arrays */}
      {[-3.5, -1.5, 0.5, 2.5].map((z, rowI) => (
        <group key={rowI} position={[0, 0, z]}>
          {[-3, -1, 1, 3].map((x, colI) => (
            <group key={colI} position={[x, 0.5, 0]}>
              {/* Tilted Solar Panel */}
              <mesh rotation={[Math.PI / 6, 0, 0]}>
                <boxGeometry args={[1.8, 0.05, 1.6]} />
                <meshStandardMaterial 
                  color="#0284c7" 
                  emissive="#0369a1" 
                  emissiveIntensity={0.3} 
                  roughness={0.1} 
                  metalness={0.9} 
                />
              </mesh>
              {/* Support column */}
              <mesh position={[0, -0.25, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.5]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Cybernetic Ground Glow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color="#eab308" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export function ThermalPlant({ position }: PlantProps) {
  // Simple upward drifting smoke particles
  const smokeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (smokeRef.current) {
      smokeRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime) * 0.2;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      smokeRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position} scale={0.7}>
      {/* Main Generator Block */}
      <mesh position={[0, 1.5, -1]}>
        <boxGeometry args={[5, 3, 4]} />
        <meshStandardMaterial color="#334155" roughness={0.8} metalness={0.3} />
      </mesh>
      
      {/* Primary Cooling Tower */}
      <mesh position={[-2, 3, 2]}>
        {/* Cooling towers are classically hyperboloid, but a cylinder works fine for distance view */}
        <cylinderGeometry args={[0.7, 1.2, 6, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>
      
      {/* Secondary Cooling Tower */}
      <mesh position={[2, 3, 2]}>
        <cylinderGeometry args={[0.7, 1.2, 6, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>
      
      {/* Exhaust Chimney Stack */}
      <mesh position={[0, 4, -2]}>
        <cylinderGeometry args={[0.3, 0.4, 8, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      
      {/* Emissive Warning Light on Stack */}
      <mesh position={[0, 8.1, -2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Pulsing Smoke/Exhaust representation */}
      <group ref={smokeRef} position={[0, 8, -2]}>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Industrial Base Aura */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export function HydroPlant({ position }: PlantProps) {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (waterRef.current && waterRef.current.material) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group position={position} scale={0.7}>
      {/* Concrete Dam Arc */}
      <mesh position={[0, 2, 0]} rotation={[0, Math.PI, 0]}>
        {/* Cut cylinder for dam arc */}
        <cylinderGeometry args={[4, 5, 4, 32, 1, false, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>
      
      {/* Left buttress */}
      <mesh position={[-3.5, 2, -1]}>
        <boxGeometry args={[1.5, 4, 3]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Right buttress */}
      <mesh position={[0, 2, 2.5]}>
        <boxGeometry args={[3, 4, 1.5]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Glowing Water Output Spillage */}
      <mesh ref={waterRef} position={[-1.7, 1, 0.7]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[3, 2, 0.2]} />
        <meshStandardMaterial color="#3b82f6" emissive="#60a5fa" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>

      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}
