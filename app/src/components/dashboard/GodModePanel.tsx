import { memo, useState } from 'react';
import {
  ShieldAlert, DollarSign, Cloud, CloudLightning, Sun, Wind, Snowflake, Flame,
  Zap, Droplets, Fuel, Bomb, Wrench
} from 'lucide-react';

interface GodModePanelProps {
  onTriggerEvent: (type: string, payload?: any) => void;
  activeWeather: string;
  activePowerSources: Record<string, boolean>;
  onTogglePowerSource: (source: string) => void;
  destroyMode?: boolean;
  onToggleDestroyMode?: () => void;
  destroyedCount?: number;
}

const WEATHER_MODES = [
  { id: 'CLEAR',     label: 'Clear Sky',  icon: Sun,            color: '#f59e0b', ring: 'ring-amber-500/60',   bg: 'bg-amber-500/10',   text: 'text-amber-300',   border: 'border-amber-500/50' },
  { id: 'OVERCAST',  label: 'Overcast',   icon: Cloud,          color: '#94a3b8', ring: 'ring-slate-500/60',   bg: 'bg-slate-500/10',   text: 'text-slate-300',   border: 'border-slate-500/50' },
  { id: 'STORM',     label: 'Storm',      icon: CloudLightning, color: '#818cf8', ring: 'ring-indigo-500/60',  bg: 'bg-indigo-500/10',  text: 'text-indigo-300',  border: 'border-indigo-500/50' },
  { id: 'HEAT_WAVE', label: 'Heat Wave',  icon: Flame,          color: '#f97316', ring: 'ring-orange-500/60',  bg: 'bg-orange-500/10',  text: 'text-orange-300',  border: 'border-orange-500/50' },
  { id: 'BLIZZARD',  label: 'Blizzard',   icon: Snowflake,      color: '#67e8f9', ring: 'ring-cyan-400/60',    bg: 'bg-cyan-400/10',    text: 'text-cyan-200',    border: 'border-cyan-400/50' },
  { id: 'HIGH_WIND', label: 'High Wind',  icon: Wind,           color: '#60a5fa', ring: 'ring-blue-500/60',    bg: 'bg-blue-500/10',    text: 'text-blue-300',    border: 'border-blue-500/50' },
];

const POWER_SOURCES = [
  { id: 'solar', label: 'Solar',  icon: Sun,      color: '#fbbf24', bg: 'bg-yellow-500/10', text: 'text-yellow-300', border: 'border-yellow-500/50' },
  { id: 'wind',  label: 'Wind',   icon: Wind,     color: '#22d3ee', bg: 'bg-cyan-500/10',   text: 'text-cyan-300',   border: 'border-cyan-500/50' },
  { id: 'hydro', label: 'Hydro',  icon: Droplets, color: '#60a5fa', bg: 'bg-blue-500/10',   text: 'text-blue-300',   border: 'border-blue-500/50' },
  { id: 'gas',   label: 'Gas',    icon: Fuel,     color: '#fb923c', bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/50' },
];

export const GodModePanel = memo(function GodModePanel({
  onTriggerEvent,
  activeWeather,
  activePowerSources,
  onTogglePowerSource,
  destroyMode = false,
  onToggleDestroyMode,
  destroyedCount = 0,
}: GodModePanelProps) {
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const handleWeather = (id: string) => {
    setLastClicked(id);
    onTriggerEvent('weather_change', { weather: id, active: id !== 'CLEAR' });
    setTimeout(() => setLastClicked(null), 600);
  };

  return (
    <div className="space-y-5">

      {/* ── Weather Controls ──────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CloudLightning className="w-3.5 h-3.5 text-indigo-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weather Control</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {WEATHER_MODES.map(mode => {
            const isActive = activeWeather === mode.id;
            const isClicked = lastClicked === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                id={`weather-btn-${mode.id.toLowerCase()}`}
                onClick={() => handleWeather(mode.id)}
                style={isActive ? { boxShadow: `0 0 12px ${mode.color}40, inset 0 0 8px ${mode.color}15` } : {}}
                className={`
                  relative h-9 flex items-center gap-2 px-3 rounded-lg text-[10px] font-bold tracking-wider
                  transition-all duration-200 border overflow-hidden
                  ${isActive
                    ? `${mode.border} ${mode.bg} ${mode.text} ring-1 ${mode.ring}`
                    : 'border-slate-700/40 bg-slate-800/30 text-slate-500 hover:border-slate-600/60 hover:bg-slate-700/40 hover:text-slate-300'
                  }
                  ${isClicked ? 'scale-95' : 'hover:scale-[1.02] active:scale-95'}
                `}
              >
                {/* Active shimmer */}
                {isActive && (
                  <span
                    className="absolute inset-0 opacity-30 pointer-events-none animate-pulse"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${mode.color}40, transparent 70%)` }}
                  />
                )}
                <Icon
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? 'animate-pulse' : ''}`}
                  style={isActive ? { color: mode.color } : {}}
                />
                {mode.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: mode.color, boxShadow: `0 0 4px ${mode.color}` }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* ── Power Sources ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Power Sources</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {POWER_SOURCES.map(src => {
            const isActive = !!activePowerSources[src.id];
            const Icon = src.icon;
            return (
              <button
                key={src.id}
                id={`power-btn-${src.id}`}
                onClick={() => onTogglePowerSource(src.id)}
                style={isActive ? { boxShadow: `0 0 10px ${src.color}30` } : {}}
                className={`
                  h-9 flex items-center gap-2 px-3 rounded-lg text-[10px] font-bold tracking-wider
                  transition-all duration-200 border
                  ${isActive
                    ? `${src.border} ${src.bg} ${src.text}`
                    : 'border-slate-700/40 bg-slate-800/30 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }
                  hover:scale-[1.02] active:scale-95
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} style={isActive ? { color: src.color } : {}} />
                {src.label}
                <span className={`ml-auto text-[8px] font-black px-1.5 py-0.5 rounded-sm ${
                  isActive ? 'bg-emerald-500/25 text-emerald-300' : 'bg-slate-700/50 text-slate-600'
                }`}>
                  {isActive ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* ── Chaos Injection ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chaos Injection</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-grid-failure"
            onClick={() => onTriggerEvent('grid_failure', { duration: 60, active: true })}
            className="h-9 flex items-center gap-2 px-3 rounded-lg text-[10px] font-bold tracking-wider border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />Grid Failure
          </button>
          <button
            id="btn-restore-grid"
            onClick={() => onTriggerEvent('grid_failure', { duration: 0, active: false })}
            className="h-9 flex items-center gap-2 px-3 rounded-lg text-[10px] font-bold tracking-wider border border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Wrench className="w-3.5 h-3.5" />Restore Grid
          </button>
          <button
            id="btn-spike-price"
            onClick={() => onTriggerEvent('price_update', { price: +(Math.random() * 0.8 + 0.3).toFixed(2) })}
            className="h-9 flex items-center gap-2 px-3 rounded-lg text-[10px] font-bold tracking-wider border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <DollarSign className="w-3.5 h-3.5" />Spike Price
          </button>
          <button
            id="btn-reset-price"
            onClick={() => onTriggerEvent('price_update', { price: 0.15 })}
            className="h-9 flex items-center gap-2 px-3 rounded-lg text-[10px] font-bold tracking-wider border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />Reset Price
          </button>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* ── Building Destruction Mode ─────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bomb className="w-3.5 h-3.5 text-red-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tactical Decommissioning</h3>
        </div>
        <button
          id="btn-destroy-mode"
          onClick={onToggleDestroyMode}
          style={destroyMode ? { boxShadow: '0 0 20px rgba(239,68,68,0.6), inset 0 0 10px rgba(239,68,68,0.2)' } : {}}
          className={`
            w-full h-11 flex items-center justify-center gap-2 px-3 rounded-lg text-xs font-black tracking-widest uppercase
            transition-all duration-300 border
            ${destroyMode
              ? 'border-red-500 bg-red-500/20 text-red-400 animate-pulse ring-2 ring-red-500/50'
              : 'border-red-500/20 bg-red-500/5 text-red-500/60 hover:border-red-500/60 hover:bg-red-500/15 hover:text-red-400'
            }
            hover:scale-[1.01] active:scale-98
          `}
        >
          <Bomb className={`w-4 h-4 ${destroyMode ? 'animate-bounce' : ''}`} />
          {destroyMode ? '⚡ SELECT TARGET BUILDING' : '🎯 TARGET & DESTROY'}
          {destroyedCount > 0 && (
            <span className="ml-auto text-[9px] bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded font-mono">
              {destroyedCount}
            </span>
          )}
        </button>
        {destroyMode ? (
          <div className="mt-2.5 p-2 rounded bg-red-950/20 border border-red-900/40 text-center">
            <p className="text-[9px] text-red-400 font-bold animate-pulse uppercase tracking-tighter">
              Awaiting Target Selection...
            </p>
            <button 
              onClick={onToggleDestroyMode} 
              className="mt-1 text-[8px] text-slate-500 hover:text-red-400 underline uppercase tracking-widest"
            >
              Cancel Mission
            </button>
          </div>
        ) : (
          <p className="mt-1.5 text-[9px] text-slate-500 text-center italic">
            Select a building on the map to decommission it permanently.
          </p>
        )}
      </div>
    </div>
  );
});
