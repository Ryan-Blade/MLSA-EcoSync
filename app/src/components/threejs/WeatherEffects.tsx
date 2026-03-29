import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Precipitation particles ────────────────────────────────────────────────
function Precipitation({ type }: { type: 'rain' | 'snow' }) {
  const count = type === 'rain' ? 800 : 400;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 20,
        z: (Math.random() - 0.5) * 40,
        speed: type === 'rain' ? 0.3 + Math.random() * 0.2 : 0.05 + Math.random() * 0.05,
        drift: type === 'snow' ? (Math.random() - 0.5) * 0.02 : (Math.random() - 0.5) * 0.01,
      });
    }
    return temp;
  }, [count, type]);

  useFrame(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < 0) {
        p.y = 20;
        p.x = (Math.random() - 0.5) * 40;
      }
      dummy.position.set(p.x, p.y, p.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const geo = type === 'rain'
    ? new THREE.CylinderGeometry(0.01, 0.01, 0.4, 4)
    : new THREE.SphereGeometry(0.05, 4, 4);

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, count]}>
      <meshBasicMaterial
        color={type === 'rain' ? '#94a3b8' : '#ffffff'}
        transparent
        opacity={type === 'rain' ? 0.6 : 0.8}
      />
    </instancedMesh>
  );
}

// ─── Volumetric Cloud Layer (for OVERCAST) ──────────────────────────────────
function CloudLayer() {
  const cloudCount = 18;
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    return Array.from({ length: cloudCount }, (_) => ({
      x: (Math.random() - 0.5) * 50,
      y: 10 + Math.random() * 5,
      z: (Math.random() - 0.5) * 50,
      speed: 0.003 + Math.random() * 0.004,
      scale: 2 + Math.random() * 3,
      opacity: 0.18 + Math.random() * 0.18,
      // Each cloud is a cluster of overlapping spheres
      blobs: Array.from({ length: 5 + Math.floor(Math.random() * 4) }, () => ({
        ox: (Math.random() - 0.5) * 1.5,
        oy: (Math.random() - 0.5) * 0.5,
        oz: (Math.random() - 0.5) * 1.2,
        r:  0.9 + Math.random() * 0.7,
      })),
    }));
  }, []);

  useFrame((_state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((ch, i) => {
      const cloud = clouds[i];
      ch.position.x += cloud.speed;
      if (ch.position.x > 30) ch.position.x = -30;
      // Gentle vertical bob
      ch.position.y = cloud.y + Math.sin(Date.now() * 0.0003 + i) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, ci) => (
        <group
          key={ci}
          position={[cloud.x, cloud.y, cloud.z]}
          scale={[cloud.scale, cloud.scale * 0.4, cloud.scale]}
        >
          {cloud.blobs.map((blob, bi) => (
            <mesh key={bi} position={[blob.ox, blob.oy, blob.oz]}>
              <sphereGeometry args={[blob.r, 8, 8]} />
              <meshBasicMaterial
                color="#b0c4de"
                transparent
                opacity={cloud.opacity}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ─── Wind lines (for HIGH_WIND) ──────────────────────────────────────────────
function HighWind() {
  const count = 100;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 10,
        z: (Math.random() - 0.5) * 40,
        speed: 0.5 + Math.random() * 0.5,
      });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.x += p.speed;
      if (p.x > 20) {
        p.x = -20;
        p.y = Math.random() * 10;
        p.z = (Math.random() - 0.5) * 40;
      }
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.z = Math.PI / 2;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[new THREE.CylinderGeometry(0.01, 0.01, 2, 4), undefined, count]}>
      <meshBasicMaterial color="#cbd5e1" transparent opacity={0.3} />
    </instancedMesh>
  );
}

// ─── Heat wave distortion ────────────────────────────────────────────────────
function HeatWave() {
  const count = 200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 30,
        y: Math.random() * 3,
        z: (Math.random() - 0.5) * 30,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.y += 0.01 + Math.sin(state.clock.elapsedTime * 2 + p.phase) * 0.005;
      if (p.y > 4) {
        p.y = 0;
      }
      dummy.position.set(p.x, p.y, p.z);
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3 + p.phase) * 0.5;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[new THREE.SphereGeometry(0.3, 8, 8), undefined, count]}>
      <meshBasicMaterial color="#fb923c" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

// ─── Lightning Bolt ────────────────────────────────────────────────────────
function Lightning() {
  const [flash, setFlash] = useState(0);
  const lastFlash = useRef(0);

  const bolt = useMemo(() => {
    const points = [];
    const startX = (Math.random() - 0.5) * 40;
    const startZ = (Math.random() - 0.5) * 40;
    let currX = startX;
    let currY = 20;
    let currZ = startZ;
    for (let i = 0; i < 15; i++) {
      points.push(new THREE.Vector3(currX, currY, currZ));
      currY -= 2;
      currX += (Math.random() - 0.5) * 4;
      currZ += (Math.random() - 0.5) * 4;
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [flash]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (time - lastFlash.current > 4 + Math.random() * 6) {
      setFlash((f: number) => f + 1);
      lastFlash.current = time;
    }
  });

  const isFlashing = (Date.now() / 1000 - lastFlash.current) < 0.15;

  return (
    <group>
      {isFlashing && (
        <>
          <pointLight position={[0, 15, 0]} intensity={15} color="#cbd5e1" distance={100} />
          <primitive object={new THREE.Line(bolt, new THREE.LineBasicMaterial({
            color: '#ffffff',
            linewidth: 3,
            transparent: true,
            opacity: 0.9
          }))} />
        </>
      )}
    </group>
  );
}

// ─── Main WeatherEffects Component ──────────────────────────────────────────
export function WeatherEffects({ weather }: { weather: string }) {
  const isClear = !weather || weather === 'CLEAR';

  return (
    <group>
      {/* OVERCAST — fog + floating cloud layer */}
      {weather === 'OVERCAST' && (
        <>
          <fog attach="fog" args={['#334155', 5, 30]} />
          <ambientLight intensity={0.12} />
          <CloudLayer />
        </>
      )}

      {/* STORM — dark fog + heavy rain + lightning */}
      {weather === 'STORM' && (
        <>
          <fog attach="fog" args={['#1e1b4b', 2, 18]} />
          <ambientLight intensity={0.05} />
          <Precipitation type="rain" />
          <CloudLayer />
          <Lightning />
        </>
      )}

      {/* BLIZZARD — white fog + snow + clouds */}
      {weather === 'BLIZZARD' && (
        <>
          <fog attach="fog" args={['#e2e8f0', 2, 15]} />
          <ambientLight intensity={0.4} />
          <Precipitation type="snow" />
          <CloudLayer />
        </>
      )}

      {/* HEAT_WAVE — orange fog + shimmer + intense light */}
      {weather === 'HEAT_WAVE' && (
        <>
          <fog attach="fog" args={['#7c2d12', 8, 35]} />
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 15, 0]} color="#f97316" intensity={3} distance={50} />
          <HeatWave />
        </>
      )}

      {/* HIGH_WIND — wind streaks */}
      {weather === 'HIGH_WIND' && (
        <>
          <HighWind />
        </>
      )}

      {/* CLEAR — standard mild fog */}
      {isClear && (
        <fog attach="fog" args={['#0f172a', 20, 60]} />
      )}
    </group>
  );
}
