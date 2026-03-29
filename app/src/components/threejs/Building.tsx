import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import type { BuildingTelemetry } from '@/types';

interface BuildingProps {
  data: BuildingTelemetry;
  position: [number, number, number];
  geoScaleY?: number;
  geoShape?: THREE.Shape;
  onClick?: (data: BuildingTelemetry) => void;
  isDestroyed?: boolean;
  destroyMode?: boolean;
}

// ─── Explosion Effect (Brief) ────────────────────────────────────────────────
function Explosion({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + (state.clock.elapsedTime % 0.5) * 10;
      meshRef.current.scale.setScalar(scale);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (state.clock.elapsedTime % 0.5) * 2);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.8} />
    </mesh>
  );
}

// ─── Rubble mesh shown when a building is destroyed ───────────────────────
function RubbleMesh({ color }: { color: string }) {
  const pieces = useMemo(() => Array.from({ length: 12 }, (_) => ({
    x: (Math.random() - 0.5) * 0.8,
    z: (Math.random() - 0.5) * 0.8,
    ry: Math.random() * Math.PI,
    rz: Math.random() * Math.PI,
    w: 0.1 + Math.random() * 0.3,
    d: 0.1 + Math.random() * 0.3,
    h: 0.05 + Math.random() * 0.15,
  })), []);

  const smokeRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (smokeRef.current) {
      smokeRef.current.children.forEach((s, i) => {
        s.position.y += 0.01 + Math.sin(state.clock.elapsedTime + i) * 0.005;
        if (s.position.y > 2) s.position.y = 0.4;
        s.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2);
      });
    }
  });

  return (
    <group>
      {/* Scorch mark on ground */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 16]} />
        <meshBasicMaterial color="#1a0a0a" transparent opacity={0.9} />
      </mesh>
      {/* Rubble chunks */}
      {pieces.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2, p.z]} rotation={[0, p.ry, p.rz]}>
          <boxGeometry args={[p.w, p.h, p.d]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#475569" : color} roughness={0.9} metalness={0.1} />
        </mesh>
      ))}
      {/* Persistent Smoke wisps */}
      <group ref={smokeRef}>
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * 0.4, 0.5 + i * 0.3, (Math.random() - 0.5) * 0.4]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshBasicMaterial color="#4a4a4a" transparent opacity={0.15} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Building({ data, position, geoScaleY = 1, geoShape, onClick, isDestroyed = false, destroyMode = false }: BuildingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Group>(null);
  const topRef = useRef<THREE.Mesh>(null);
  const reticleRef = useRef<THREE.Mesh>(null);
  const isHovered = useRef(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const explodedRef = useRef(false);

  useEffect(() => {
    if (isDestroyed && !explodedRef.current) {
      setShowExplosion(true);
      explodedRef.current = true;
      const t = setTimeout(() => setShowExplosion(false), 800);
      return () => clearTimeout(t);
    }
  }, [isDestroyed]);

  const { color, emissive, height, scaleY } = useMemo(() => {
    let color = '#3b82f6';
    let emissive = '#1e40af';
    let height = geoScaleY ?? 1;
    let scaleY = 1;

    if (data.is_critical) {
      color = '#ef4444';
      emissive = '#dc2626';
      height = Math.max(height, 1.5);
    } else if (data.is_selling) {
      color = '#22c55e';
      emissive = '#16a34a';
      height = Math.max(height, 1.2 + (data.battery_soc / 100) * 0.4);
      scaleY = 1 + (data.battery_soc / 100) * 0.3;
    } else if (data.is_buying) {
      color = '#f59e0b';
      emissive = '#d97706';
      height = Math.max(height, 0.9);
    } else if (data.is_priority) {
      color = '#a855f7';
      emissive = '#7c3aed';
      height = Math.max(height, 1.6);
    }

    switch (data.building_type) {
      case 'hospital':   height *= 2;   break;
      case 'datacenter': height *= 1.8; break;
      case 'commercial': height *= 1.4; break;
      case 'residential':height *= 0.9; break;
      default:           height *= 1.1; break;
    }

    return { color, emissive, height, scaleY };
  }, [data, geoScaleY]);

  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#0f172a';
      context.fillRect(0, 0, 128, 128);
      const winColor = data.is_critical ? '#ef4444' :
                      (data.is_selling ? '#4ade80' :
                      (data.is_buying ? '#fcd34d' : '#38bdf8'));
      context.fillStyle = winColor;
      for (let x = 8; x < 128; x += 24) {
        for (let y = 8; y < 128; y += 28) {
          if (Math.random() > 0.2) {
            context.fillRect(x, y, 12, 16);
            context.fillStyle = '#ffffff';
            context.fillRect(x + 2, y + 2, 8, 12);
            context.fillStyle = winColor;
          }
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, height * scaleY * 1.5);
    return tex;
  }, [data.is_critical, data.is_selling, data.is_buying, height, scaleY]);

  useFrame((state) => {
    if (isDestroyed) return;

    if (meshRef.current) {
      if (data.is_critical) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.05;
        meshRef.current.scale.setScalar(pulse);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }

    if (glowRef.current) {
      glowRef.current.rotation.y += 0.02;
      glowRef.current.position.y = (height / 2) + Math.sin(state.clock.elapsedTime * 2 + data.building_id) * 0.15;
    }

    if (topRef.current) {
      topRef.current.rotation.y -= 0.03;
    }

    // Reticle pulses in destroy mode
    if (reticleRef.current && destroyMode) {
      const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.4;
      const mat = reticleRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = pulse * (isHovered.current ? 1 : 0.5);
    }
  });

  if (isDestroyed) {
    return (
      <group position={position}>
        <RubbleMesh color={emissive} />
        {showExplosion && <Explosion position={[0, 1, 0]} />}
      </group>
    );
  }

  const buildingHeight = height * scaleY;

  return (
    <group position={position}>
      {/* Main Building Body */}
      <mesh
        ref={meshRef}
        position={[0, buildingHeight / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(data);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          isHovered.current = true;
          document.body.style.cursor = destroyMode ? 'crosshair' : 'pointer';
        }}
        onPointerOut={() => {
          isHovered.current = false;
          document.body.style.cursor = 'auto';
        }}
      >
        {geoShape ? (
          <extrudeGeometry args={[geoShape, { depth: buildingHeight, bevelEnabled: false }]} />
        ) : (
          <boxGeometry args={[0.8, buildingHeight, 0.8]} />
        )}
        <meshStandardMaterial
          color={color}
          map={windowTexture}
          emissive={emissive}
          emissiveIntensity={0.6}
          emissiveMap={windowTexture}
          roughness={0.2}
          metalness={0.9}
        />
        <Edges scale={1.01} color={emissive} />
      </mesh>

      {/* Destroy mode targeting reticle */}
      {destroyMode && (
        <mesh
          ref={reticleRef}
          position={[0, buildingHeight + 0.5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.6, 0.04, 8, 32]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* Building top spire */}
      <mesh ref={topRef} position={[0, buildingHeight + 0.25, 0]}>
        <cylinderGeometry args={[0.15, 0.35, 0.5, 4]} />
        <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={1.2} />
        <Edges scale={1.05} color="#ffffff" />
      </mesh>

      {/* Holographic rings for active buildings */}
      {(data.is_selling || data.is_buying || data.is_critical) && (
        <group ref={glowRef} position={[0, height / 2, 0]}>
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.7, 0.02, 16, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.9, 0.01, 16, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {/* Energy flow beacon */}
      {data.net_energy !== 0 && (
        <mesh position={[0, buildingHeight + 0.8, 0]}>
          <sphereGeometry args={[data.is_critical ? 0.2 : 0.12, 16, 16]} />
          <meshBasicMaterial color={data.net_energy > 0 ? '#22c55e' : '#f59e0b'} />
        </mesh>
      )}

      {/* Ground footprint / base plate */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial color={emissive} transparent opacity={data.is_critical ? 0.6 : 0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
