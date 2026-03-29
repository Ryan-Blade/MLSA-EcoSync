import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Cesium from 'cesium';
import { Zap, ArrowRight, Search } from 'lucide-react';

const CESIUM_TOKEN = import.meta.env.VITE_CESIUM_TOKEN as string;
if (CESIUM_TOKEN) Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

const ECOSYNC_CITIES = [
  { name: 'Mumbai',        pincode: '400001',   lat: 18.9388,   lng: 72.8354   },
  { name: 'New York',      pincode: '10001',    lat: 40.7484,   lng: -73.9967  },
  { name: 'London',        pincode: 'EC1A',     lat: 51.5194,   lng: -0.1270   },
  { name: 'Tokyo',         pincode: '100-0001', lat: 35.6762,   lng: 139.6503  },
  { name: 'Berlin',        pincode: '10115',    lat: 52.5200,   lng: 13.4050   },
  { name: 'Sydney',        pincode: '2000',     lat: -33.8688,  lng: 151.2093  },
  { name: 'Dubai',         pincode: '00000',    lat: 25.2048,   lng: 55.2708   },
  { name: 'São Paulo',     pincode: '01310',    lat: -23.5505,  lng: -46.6333  },
  { name: 'Singapore',     pincode: '048545',   lat: 1.2789,    lng: 103.8536  },
  { name: 'Paris',         pincode: '75001',    lat: 48.8566,   lng: 2.3522    },
  { name: 'Johannesburg',  pincode: '2000',     lat: -26.2041,  lng: 28.0473   },
  { name: 'New Delhi',     pincode: '110001',   lat: 28.6139,   lng: 77.2090   },
  { name: 'Toronto',       pincode: 'M5H',      lat: 43.6532,   lng: -79.3832  },
  { name: 'Shanghai',      pincode: '200001',   lat: 31.2304,   lng: 121.4737  },
  { name: 'Los Angeles',   pincode: '90001',    lat: 34.0522,   lng: -118.2437 },
  { name: 'Cairo',         pincode: '11511',    lat: 30.0444,   lng: 31.2357   },
  { name: 'Seoul',         pincode: '04524',    lat: 37.5665,   lng: 126.9780  },
  { name: 'Amsterdam',     pincode: '1012',     lat: 52.3676,   lng: 4.9041    },
  { name: 'Chicago',       pincode: '60601',    lat: 41.8781,   lng: -87.6298  },
  { name: 'Nairobi',       pincode: '00100',    lat: -1.2921,   lng: 36.8219   },
];

const STYLES = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(1);   opacity: 0.8; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  #cesium-start-container .cesium-viewer-toolbar,
  #cesium-start-container .cesium-viewer-animationContainer,
  #cesium-start-container .cesium-viewer-timelineContainer,
  #cesium-start-container .cesium-viewer-bottom,
  #cesium-start-container .cesium-infoBox,
  #cesium-start-container .cesium-selection-wrapper,
  #cesium-start-container .cesium-geocoder-container,
  #cesium-start-container .cesium-viewer-geocoderContainer {
    display: none !important;
  }
  #cesium-start-container { background: #040914 !important; }
`;

function addCityMarkers(viewer: Cesium.Viewer) {
  const t0 = Cesium.JulianDate.now();

  ECOSYNC_CITIES.forEach((city, idx) => {
    const position = Cesium.Cartesian3.fromDegrees(city.lng, city.lat, 0);

    viewer.entities.add({
      position,
      name: city.name,
      properties: new Cesium.PropertyBag({ pincode: city.pincode, lat: city.lat, lng: city.lng }),

      // City label
      label: {
        text: city.name,
        font: '12px "Inter", sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.fromCssColorString('#00F5A0'),
        outlineColor: Cesium.Color.fromCssColorString('#001a0a'),
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -18),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12000000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        translucencyByDistance: new Cesium.NearFarScalar(8e6, 1, 1.2e7, 0),
      },

      // Pulsing outer ring
      ellipse: {
        semiMajorAxis: new Cesium.CallbackProperty((time) => {
          const t = Cesium.JulianDate.secondsDifference(time || t0, t0);
          return 80000 + Math.sin(t * 0.5 + idx) * 40000;
        }, false),
        semiMinorAxis: new Cesium.CallbackProperty((time) => {
          const t = Cesium.JulianDate.secondsDifference(time || t0, t0);
          return 80000 + Math.sin(t * 0.5 + idx) * 40000;
        }, false),
        material: Cesium.Color.fromCssColorString('#00F5A0').withAlpha(0.12),
        height: 0,
        outline: true,
        outlineColor: new Cesium.CallbackProperty((time) => {
          const t = Cesium.JulianDate.secondsDifference(time || t0, t0);
          const alpha = 0.5 + 0.5 * Math.sin(t * 0.8 + idx);
          return Cesium.Color.fromCssColorString('#00F5A0').withAlpha(alpha);
        }, false),
        outlineWidth: 2,
      },

      // Center dot
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString('#00F5A0'),
        outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1e6, 1.5, 2e7, 0.4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  });
}

async function geocodeNominatim(query: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=en`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'EcoSync-Hackathon' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
  } catch (e) {
    console.error('Geocode failed:', e);
  }
  return null;
}

export default function StartScreen() {
  const navigate = useNavigate();
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef          = useRef<Cesium.Viewer | null>(null);
  const rotationRef        = useRef<number | null>(null);
  const isAnimatingRef     = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUI, setShowUI]           = useState(false);
  const [error, setError]             = useState('');
  const [flyingTo, setFlyingTo]       = useState('');

  useEffect(() => {
    if (!cesiumContainerRef.current || viewerRef.current) return;

    let viewer: Cesium.Viewer;

    const initViewer = async () => {
      try {
        let baseLayer: Cesium.ImageryLayer;
        try {
          const provider = await Cesium.IonImageryProvider.fromAssetId(2);
          baseLayer = new Cesium.ImageryLayer(provider);
        } catch {
          const provider = new Cesium.OpenStreetMapImageryProvider({ url: 'https://a.tile.openstreetmap.org/' });
          baseLayer = new Cesium.ImageryLayer(provider);
        }

        let terrainProvider: Cesium.TerrainProvider;
        try {
          terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
        } catch {
          terrainProvider = new Cesium.EllipsoidTerrainProvider();
        }

        viewer = new Cesium.Viewer(cesiumContainerRef.current!, {
          baseLayer,
          terrainProvider,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          shadows: false,
          shouldAnimate: true,
          requestRenderMode: false,
        });

        viewerRef.current = viewer;

        viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#040914');
        viewer.scene.globe.enableLighting = true;
        if (viewer.scene.skyBox) viewer.scene.skyBox.show = true;

        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(20, 20, 20000000),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
        });

        addCityMarkers(viewer);

        // Slow rotation
        const rotate = () => {
          if (!viewerRef.current || isAnimatingRef.current) {
            rotationRef.current = requestAnimationFrame(rotate);
            return;
          }
          try { viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.00005); } catch { /* ignore */ }
          rotationRef.current = requestAnimationFrame(rotate);
        };
        rotationRef.current = requestAnimationFrame(rotate);

        // Click-to-select city
        viewer.screenSpaceEventHandler.setInputAction((click: any) => {
          const picked = viewer.scene.pick(click.position);
          if (Cesium.defined(picked) && picked.id) {
            const entity = picked.id as Cesium.Entity;
            if (entity.properties) {
              const lat = entity.properties.lat?.getValue(Cesium.JulianDate.now());
              const lng = entity.properties.lng?.getValue(Cesium.JulianDate.now());
              const name = entity.name ?? '';
              if (lat != null && lng != null) handleLocationSelect({ lat, lng, name });
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        setTimeout(() => setShowUI(true), 300);
      } catch (err) {
        console.error('Cesium init failed:', err);
      }
    };

    initViewer();

    return () => {
      if (rotationRef.current) cancelAnimationFrame(rotationRef.current);
      if (viewerRef.current && !viewerRef.current.isDestroyed()) viewerRef.current.destroy();
      viewerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationSelect = useCallback((loc: { lat: number; lng: number; name: string }) => {
    if (!viewerRef.current || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    setFlyingTo(loc.name);
    setError('');

    const viewer = viewerRef.current;

    // Step 1: zoom to continent level
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, 3000000),
      duration: 2.0,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      complete: () => {
        // Step 2: zoom to city level
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, 80000),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
          duration: 1.5,
          easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
          complete: () => {
            setTimeout(() => {
              navigate('/map', {
                state: { coords: { lat: loc.lat, lng: loc.lng }, country: loc.name },
              });
            }, 300);
          },
        });
      },
    });
  }, [navigate]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setError('');
    const result = await geocodeNominatim(searchQuery);
    if (!result) {
      setError('Location not found');
      return;
    }
    handleLocationSelect({ lat: result.lat, lng: result.lng, name: searchQuery.trim() });
  }, [searchQuery, handleLocationSelect]);

  return (
    <div className="fixed inset-0 bg-[#040914] overflow-hidden">
      <style>{STYLES}</style>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      <div id="cesium-start-container" ref={cesiumContainerRef} className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* Header title */}
      <div
        className={`absolute top-8 left-1/2 -translate-x-1/2 z-50 text-center transition-all duration-700 ${showUI ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center gap-3 justify-center mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-4 h-4 text-[#040914] fill-current" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent tracking-tight">EcoSync</span>
        </div>
        <p className="text-[11px] text-emerald-600/80 font-medium tracking-[0.2em] uppercase">Smart Energy Grid Simulator</p>
      </div>

      {/* Search widget */}
      <div
        className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 transition-all duration-700 ${showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="flex flex-col gap-2">
          {/* Search bar */}
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#0B1526]/85 backdrop-blur-md border border-emerald-500/20 shadow-2xl shadow-black/50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
              <Search className="w-4 h-4 text-[#040914]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search any city or pincode..."
              disabled={isAnimating}
              className="flex-1 bg-transparent border-none px-2 py-2 text-sm text-emerald-50 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={isAnimating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-bold border border-emerald-500/30 hover:scale-105 active:scale-95"
            >
              {isAnimating ? (
                <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              ) : (
                <><ArrowRight className="w-3.5 h-3.5" />Go</>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-500 font-medium tracking-wide">
            {error
              ? <span className="text-red-400">{error}</span>
              : isAnimating
              ? <span className="text-emerald-400 animate-pulse">Flying to {flyingTo}…</span>
              : 'Click a glowing city · or type any location'}
          </p>
        </div>
      </div>

      {/* Flying overlay */}
      {isAnimating && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-emerald-500/40 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-emerald-400 text-sm font-bold animate-pulse">Navigating to {flyingTo}</p>
            <p className="text-emerald-600 text-xs mt-1">Loading real-time satellite view…</p>
          </div>
        </div>
      )}
    </div>
  );
}
