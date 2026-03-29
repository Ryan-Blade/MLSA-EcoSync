import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuildingTelemetry } from '@/types';

// Map power themes to neon glow colors
const SOURCE_COLORS: Record<string, { base: number[], glow: number[] }> = {
  solar:  { base: [0.6, 0.5, 0.0], glow: [1.0, 0.85, 0.0] },
  wind:   { base: [0.0, 0.4, 0.6], glow: [0.0, 0.83, 1.0] },
  hydro:  { base: [0.0, 0.2, 0.6], glow: [0.0, 0.4, 1.0] },
  gas:    { base: [0.6, 0.25, 0.0], glow: [1.0, 0.42, 0.0] },
  trade:  { base: [0.0, 0.8, 0.2], glow: [0.0, 1.0, 0.4] },
};

interface EnergyWireProps {
  source: [number, number, number];
  target: [number, number, number];
  colorTheme: string;
  active: boolean;
  intensity: number;
  radius: number;
  reverseDirection?: boolean;
  maxHeight?: number;
}

function EnergyWire({ source, target, colorTheme, active, intensity, radius, reverseDirection = false, maxHeight = 0.4 }: EnergyWireProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const colors = SOURCE_COLORS[colorTheme] || SOURCE_COLORS.trade;

  const geometry = useMemo(() => {
    const start = new THREE.Vector3(...source);
    start.y = 0.5;
    const end = new THREE.Vector3(...target);
    end.y = 0.5;

    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.y = maxHeight + start.distanceTo(end) * 0.1;

    const curve = new THREE.CatmullRomCurve3([start, mid, end], false, 'catmullrom', 0.5);
    return new THREE.TubeGeometry(curve, 32, radius, 8, false);
  }, [source, target, radius, maxHeight]);

  const uniforms = useMemo(() => ({
    uTime:      { value: Math.random() * 10 },
    uBaseColor: { value: new THREE.Vector3(...colors.base) },
    uGlowColor: { value: new THREE.Vector3(...colors.glow) },
    uIntensity: { value: intensity },
    uActive:    { value: active ? 1.0 : 0.0 },
    uDirection: { value: reverseDirection ? -1.0 : 1.0 }
  }), [colors, intensity, active, reverseDirection]);

  useFrame((_state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;

      matRef.current.uniforms.uActive.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uActive.value,
        active ? 1.0 : 0.0,
        0.05
      );
      matRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uIntensity.value,
        intensity,
        0.05
      );
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uBaseColor;
          uniform vec3 uGlowColor;
          uniform float uIntensity;
          uniform float uActive;
          uniform float uDirection;
          varying vec2 vUv;

          void main() {
            float pulse = sin((vUv.x * uDirection) * 8.0 - uTime * 2.0);
            float glow = smoothstep(0.3, 0.7, pulse) * uIntensity;
            
            vec3 color = mix(uBaseColor * 0.3, uGlowColor, glow);
            
            float baseAlpha = mix(0.08, 0.6, uActive); 
            float alpha = baseAlpha + glow * 0.4 * uActive;
            
            gl_FragColor = vec4(color, alpha);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Map configuration for External Power Sources
export const POWER_SOURCE_POSITIONS: Record<string, [number, number, number]> = {
  solar: [-25, 0, -25],
  wind:  [25, 0, -25],
  hydro: [-25, 0, 25],
  gas:   [25, 0, 25],
};

interface NeuralWiresProps {
  buildings: BuildingTelemetry[];
  buildingPositions: Record<number, [number, number, number]>;
  activePowerSources: Record<string, boolean>;
  destroyedBuildings?: Set<number>;
}

export function NeuralWires({ buildings, buildingPositions, activePowerSources, destroyedBuildings = new Set() }: NeuralWiresProps) {
  // Filter out destroyed buildings for ALL wire calculations
  const activeBuildings = useMemo(
    () => buildings.filter(b => !destroyedBuildings.has(b.building_id)),
    [buildings, destroyedBuildings]
  );

  // Trunk wires from power plants → priority/critical buildings
  const trunkWires = useMemo(() => {
    const wires: { id: string; sourceType: string; source: [number, number, number]; target: [number, number, number] }[] = [];
    const priorityBuildings = activeBuildings.filter(b => b.is_priority || b.is_critical);

    Object.keys(POWER_SOURCE_POSITIONS).forEach((sourceType) => {
      if (!activePowerSources[sourceType]) return;

      const sourcePos = POWER_SOURCE_POSITIONS[sourceType];

      const targets = priorityBuildings
        .map(b => {
          const p = buildingPositions[b.building_id] || [0, 0, 0] as [number, number, number];
          const dist = Math.sqrt(Math.pow(p[0] - sourcePos[0], 2) + Math.pow(p[2] - sourcePos[2], 2));
          return { id: b.building_id, pos: p as [number, number, number], dist };
        })
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3);

      targets.forEach(t => {
        wires.push({
          id: `trunk-${sourceType}-${t.id}`,
          sourceType,
          source: sourcePos,
          target: t.pos
        });
      });
    });
    return wires;
  }, [activeBuildings, buildingPositions, activePowerSources]);

  // P2P trade wires — sellers → nearest buyers (both must be alive)
  const tradeWires = useMemo(() => {
    const wires: { id: string; source: [number, number, number]; target: [number, number, number] }[] = [];
    const sellers = activeBuildings.filter(b => b.is_selling);
    const buyers  = activeBuildings.filter(b => b.is_buying);

    sellers.forEach((seller) => {
      const sPos = buildingPositions[seller.building_id];
      if (!sPos) return;

      let closestBuyerId: number | null = null;
      let minDist = Infinity;

      buyers.forEach(buyer => {
        const bPos = buildingPositions[buyer.building_id];
        if (!bPos) return;
        const dist = Math.sqrt(Math.pow(sPos[0] - bPos[0], 2) + Math.pow(sPos[2] - bPos[2], 2));
        if (dist < minDist) {
          minDist = dist;
          closestBuyerId = buyer.building_id;
        }
      });

      if (closestBuyerId !== null) {
        const targetPos = buildingPositions[closestBuyerId];
        if (targetPos) {
          wires.push({
            id: `trade-${seller.building_id}-${closestBuyerId}`,
            source: sPos,
            target: targetPos,
          });
        }
      }
    });
    return wires;
  }, [activeBuildings, buildingPositions]);

  return (
    <group>
      {/* 1. External Grid TRUNK WIRES */}
      {trunkWires.map(({ id, sourceType, source, target }) => (
        <EnergyWire
          key={id}
          source={source}
          target={target}
          colorTheme={sourceType}
          active={true}
          intensity={0.8}
          radius={0.06}
          maxHeight={1.5}
        />
      ))}

      {/* 2. P2P TRADE WIRES */}
      {tradeWires.map(({ id, source, target }) => (
        <EnergyWire
          key={id}
          source={source}
          target={target}
          colorTheme="trade"
          active={true}
          intensity={0.6}
          radius={0.03}
          maxHeight={1.0}
        />
      ))}
    </group>
  );
}
