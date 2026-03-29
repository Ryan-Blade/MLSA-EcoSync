import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Building } from './Building';
import { WeatherEffects } from './WeatherEffects';
import { NeuralWires, POWER_SOURCE_POSITIONS } from './NeuralWires';
import { Particles } from './Particles';
import { WindTurbine, SolarPlant, ThermalPlant, HydroPlant } from './PowerPlants';
import type { BuildingTelemetry } from '@/types';

// Convert WGS84 coordinates to EPSG:3857 Web Mercator to flawlessly map the flat raster floor tile distortions
function latLngToMercator(lng: number, lat: number) {
  const R = 6378137;
  const x = R * (lng * Math.PI / 180);
  const y = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));
  return { x, y };
}

interface CityGridProps {
  buildings: BuildingTelemetry[];
  geoBuildings?: any[];
  onBuildingClick?: (data: BuildingTelemetry) => void;
  activeWeather?: string;
  activeEvents?: { type: string }[];
  activePowerSources?: Record<string, boolean>;
}

// Animated energy particles flowing between buildings
function EnergyParticles({ activeWeather, activeEvents }: { activeWeather?: string, activeEvents?: { type: string }[] }) {
  const pointsRef    = useRef<THREE.Points>(null);
  const particleCount = 50;           // was 100 — halved for performance
  const frameRef     = useRef(0);     // for throttling drift calculation

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Green for energy flow
      colors[i * 3] = 0.13;
      colors[i * 3 + 1] = 0.77;
      colors[i * 3 + 2] = 0.37;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      frameRef.current++;
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const computeDrift = frameRef.current % 2 === 0; // drift only every other frame
      
      for (let i = 0; i < particleCount; i++) {
        // Slow down based on grid conditions
        const hasGridFailure = activeEvents?.some(e => e.type === 'grid_failure');
        const speedMultiplier = hasGridFailure ? 0.1 : (activeWeather === 'STORM' ? 0.5 : (activeWeather === 'HEAT_WAVE' ? 0.2 : 1.0));
        
        // Animate particles flowing upward
        positions[i * 3 + 1] += 0.02 * speedMultiplier;
        
        // Reset if too high
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = 0;
        }

        // Slight horizontal drift (throttled — sin/cos every other frame)
        if (computeDrift) {
          const t = state.clock.elapsedTime;
          positions[i * 3]     += Math.sin(t + i) * 0.002;
          positions[i * 3 + 2] += Math.cos(t + i) * 0.002;
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function GridFloor() {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Underlying dark plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      {/* Glowing cyber grid - evenly spaced uniform bottom */}
      <gridHelper args={[100, 50, '#10b981', '#065f46']} position={[0, 0.01, 0]} />
    </group>
  );
}

// Scene content
function Scene({ buildings, geoBuildings, onBuildingClick, activeWeather = 'CLEAR', activeEvents = [], activePowerSources = {} }: CityGridProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Arrange buildings uniformly on synth grid, keeping external geoShapes
  const { layout: buildingLayout, bgBuildings } = useMemo(() => {
    const layout: { [key: number]: { position: [number, number, number], scaleY: number, geoShape?: THREE.Shape } } = {};
    const bgBuildings: { position: [number, number, number], scaleY: number, geoShape?: THREE.Shape }[] = [];
    
    // Geospatial layout
    if (geoBuildings && geoBuildings.length > 0 && buildings.length > 0) {
      const cols = 10;
      const spacing = 3;
      const offsetX = ((cols - 1) * spacing) / 2;
      const offsetZ = ((Math.ceil(buildings.length / cols) - 1) * spacing) / 2;
      const localScale = 0.05; // Base map scale multiplier for shapes (1 meter = 0.05 units)
      
      const geoCenters = geoBuildings.map(f => {
        const geom = f.geometry;
        let rings: any[] = [];
        
        if (geom?.type === 'Polygon') {
          rings = geom.coordinates;
        } else if (geom?.type === 'MultiPolygon') {
          rings = geom.coordinates[0];
        }
        
        return { height: f.properties?.render_height || f.properties?.height || 10, rings };
      });
      
      // Evenly spread across a synthetic grid via row/col math
      geoCenters.forEach((geo, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * spacing - offsetX;
        const z = row * spacing - offsetZ;
        const scaleY = Math.max(0.5, Math.min(5, geo.height / 10)); // Height extrusion limit
        
        let geoShape: THREE.Shape | undefined = undefined;
        if (geo.rings && geo.rings.length > 0) {
          geoShape = new THREE.Shape();
          const ring = geo.rings[0];
          
          let minM_X = Infinity, maxM_X = -Infinity, minM_Y = Infinity, maxM_Y = -Infinity;
          const mercatorPoints = ring.map((coord: number[]) => {
             const vM = latLngToMercator(coord[0], coord[1]);
             minM_X = Math.min(minM_X, vM.x);
             maxM_X = Math.max(maxM_X, vM.x);
             minM_Y = Math.min(minM_Y, vM.y);
             maxM_Y = Math.max(maxM_Y, vM.y);
             return vM;
          });
          
          const centerM_X = minM_X + (maxM_X - minM_X) / 2;
          const centerM_Y = minM_Y + (maxM_Y - minM_Y) / 2;
          
          mercatorPoints.forEach((vM: any, i: number) => {
             const localX = (vM.x - centerM_X) * localScale;
             const localY = -((vM.y - centerM_Y) * localScale); // Reverse Y for shape projection
             if (i === 0) geoShape!.moveTo(localX, localY);
             else geoShape!.lineTo(localX, localY);
          });
        }
        
        // Associate to API buildings sequentially
        if (index < buildings.length) {
          layout[buildings[index].building_id] = { position: [x, 0, z], scaleY, geoShape };
        } else {
          bgBuildings.push({ position: [x, 0, z], scaleY, geoShape });
        }
      });
      
      // Fill missing layout spots if GeoJSON returned < 50 buildings
      for (let i = geoCenters.length; i < buildings.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        layout[buildings[i].building_id] = { position: [col * spacing - offsetX, 0, row * spacing - offsetZ], scaleY: 1 };
      }
      
      return { layout, bgBuildings };
    }
    
    // Fallback grid pattern if GeoJSON fails
    const cols = 10;
    const spacing = 3;
    const offsetX = ((cols - 1) * spacing) / 2;
    const offsetZ = ((Math.ceil(buildings.length / cols) - 1) * spacing) / 2;

    buildings.forEach((building, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      layout[building.building_id] = {
        position: [col * spacing - offsetX, 0, row * spacing - offsetZ],
        scaleY: 1
      };
    });

    return { layout, bgBuildings };
  }, [buildings, geoBuildings]);

  const buildingPositions = useMemo(() => {
    const posRecord: Record<number, [number, number, number]> = {};
    Object.keys(buildingLayout).forEach(k => {
      posRecord[Number(k)] = buildingLayout[Number(k)].position;
    });
    return posRecord;
  }, [buildingLayout]);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation of the entire city
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <GridFloor />
      <WeatherEffects weather={activeWeather} />
      <EnergyParticles activeWeather={activeWeather} activeEvents={activeEvents} />
      <Particles />
      
      {/* Background GeoJSON Buildings */}
      {bgBuildings.map((b, i) => (
         <group key={`bg-${i}`} position={b.position}>
            {/* Base rotation aligns extruded shapes vertically to snap to the floor plane */}
            <mesh position={b.geoShape ? [0, 0, 0] : [0, b.scaleY / 2, 0]} rotation={b.geoShape ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
               {b.geoShape ? (
                  <extrudeGeometry args={[b.geoShape, { depth: b.scaleY, bevelEnabled: false }]} />
               ) : (
                  <boxGeometry args={[0.8, b.scaleY, 0.8]} />
               )}
               {/* Extremely subtle dark styling for ambient background surroundings */}
               <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} transparent opacity={0.6} />
            </mesh>
         </group>
      ))}

      {/* Simulated Focus Buildings */}
      {buildings.map((building) => {
        const layout = buildingLayout[building.building_id] || { position: [0,0,0], scaleY: 1 };
        return (
          <Building
            key={building.building_id}
            data={building}
            position={layout.position}
            geoScaleY={layout.scaleY}
            geoShape={layout.geoShape}
            onClick={onBuildingClick}
          />
        );
      })}

      {/* External Power Plants visual representations */}
      {Object.entries(POWER_SOURCE_POSITIONS).map(([sourceType, pos]) => {
        if (!activePowerSources[sourceType]) return null;
        
        switch (sourceType) {
          case 'wind': return <WindTurbine key={sourceType} position={pos as [number,number,number]} />;
          case 'solar': return <SolarPlant key={sourceType} position={pos as [number,number,number]} />;
          case 'gas': return <ThermalPlant key={sourceType} position={pos as [number,number,number]} />;
          case 'hydro': return <HydroPlant key={sourceType} position={pos as [number,number,number]} />;
          default: return null;
        }
      })}

      {/* Live Glowing Energy Paths */}
      <NeuralWires 
        buildings={buildings} 
        buildingPositions={buildingPositions}
        activePowerSources={activePowerSources}
      />

      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.5}
        color="#ffffff"
      />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#00ff00" />
      
      {/* Stars background */}
      <Stars
        radius={50}
        depth={50}
        count={1000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
    </group>
  );
}

// Main CityGrid component
export function CityGrid({ buildings, geoBuildings, onBuildingClick, activeWeather, activeEvents, activePowerSources }: CityGridProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [25, 20, 25], fov: 45 }}
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
        dpr={[1, 1.5]}                          // cap pixel ratio for performance
        performance={{ min: 0.5 }}              // auto scale-down on slow GPU
      >
        <Suspense fallback={null}>
          <Scene 
            buildings={buildings} 
            geoBuildings={geoBuildings} 
            onBuildingClick={onBuildingClick} 
            activeWeather={activeWeather} 
            activeEvents={activeEvents}
            activePowerSources={activePowerSources} 
          />
        </Suspense>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={40}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      </Canvas>
    </div>
  );
}
