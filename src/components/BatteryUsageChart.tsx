import React, { useState, useMemo } from 'react';
import {
  Battery,
  BatteryCharging,
  Zap,
  TrendingDown,
  Clock,
  Sparkles,
  Activity,
  Cpu,
  Monitor,
  Volume2,
  Wifi,
  RotateCcw,
  PlusCircle,
  MinusCircle,
  Info,
  Timer,
  AlertCircle,
  ArrowUpRight,
  Gauge,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { BatteryUsagePoint, DeviceBatteryInfo } from '../utils/useDeviceStatus';
import { LanguageMode } from '../types/deka';

interface BatteryUsageChartProps {
  battery: DeviceBatteryInfo;
  batteryHistory: BatteryUsagePoint[];
  language?: LanguageMode;
  batterySaver?: boolean;
  is24Hour?: boolean;
  onSimulateDrain?: (pct?: number) => void;
  onSimulateCharge?: (pct?: number) => void;
  onResetHistory?: () => void;
  onSetManualLevel?: (level: number) => void;
}

export const BatteryUsageChart: React.FC<BatteryUsageChartProps> = ({
  battery,
  batteryHistory,
  language = 'auto',
  batterySaver = false,
  is24Hour = false,
  onSimulateDrain,
  onSimulateCharge,
  onResetHistory,
  onSetManualLevel,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '12h' | '6h'>('24h');
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: BatteryUsagePoint;
    x: number;
    y: number;
  } | null>(null);

  const isHindi = language === 'hi';

  // Filter history points based on selected range
  const filteredPoints = useMemo(() => {
    if (!batteryHistory || batteryHistory.length === 0) return [];
    const now = Date.now();
    const hours = timeRange === '24h' ? 24 : timeRange === '12h' ? 12 : 6;
    const cutoff = now - hours * 60 * 60 * 1000;
    const inRange = batteryHistory.filter((p) => p.timestamp >= cutoff);

    // Ensure we always have at least 2 points to render a meaningful line
    if (inRange.length === 0) {
      return [
        { timestamp: now - hours * 3600000, level: battery.level, charging: battery.charging },
        { timestamp: now, level: battery.level, charging: battery.charging },
      ];
    }
    if (inRange.length === 1) {
      return [
        { timestamp: inRange[0].timestamp - 3600000, level: inRange[0].level, charging: inRange[0].charging },
        inRange[0],
      ];
    }
    return inRange.sort((a, b) => a.timestamp - b.timestamp);
  }, [batteryHistory, timeRange, battery.level, battery.charging]);

  // Compute comprehensive drain & charge metrics with multi-stage Lithium-Ion modeling
  const metrics = useMemo(() => {
    // 1. Calculate observed discharge and charge rates from history points
    let netDischarge = 0;
    let dischargeHours = 0;
    let netCharge = 0;
    let chargeHours = 0;
    let chargingCycles = 0;

    for (let i = 1; i < filteredPoints.length; i++) {
      const prev = filteredPoints[i - 1];
      const curr = filteredPoints[i];
      const segHours = Math.max(0.005, (curr.timestamp - prev.timestamp) / (1000 * 60 * 60));

      if (!curr.charging && prev.level > curr.level) {
        netDischarge += prev.level - curr.level;
        dischargeHours += segHours;
      } else if (curr.charging && curr.level > prev.level) {
        netCharge += curr.level - prev.level;
        chargeHours += segHours;
      }

      if (curr.charging && !prev.charging) {
        chargingCycles++;
      }
    }

    // Observed discharge drain rate (% per hour)
    const observedDrainRate = dischargeHours > 0.08
      ? netDischarge / dischargeHours
      : 3.8;

    // Apply baseline bounds and battery saver modifier
    const baseDrainRate = Math.min(25, Math.max(1.8, observedDrainRate));
    const effectiveDrainRate = batterySaver ? baseDrainRate * 0.72 : baseDrainRate;

    // Observed charging rate (% per hour)
    const observedChargeRate = chargeHours > 0.08
      ? netCharge / chargeHours
      : 28.0;
    const effectiveChargeRate = Math.min(65, Math.max(12, observedChargeRate));

    // Calculate Time to Full or Estimated Time Remaining
    const isCharging = battery.charging;
    let totalMinutes = 0;
    let isFullyCharged = false;

    if (isCharging) {
      if (battery.level >= 100) {
        isFullyCharged = true;
        totalMinutes = 0;
      } else if (battery.chargingTime && isFinite(battery.chargingTime) && battery.chargingTime > 0) {
        totalMinutes = Math.round(battery.chargingTime / 60);
      } else {
        // Multi-stage lithium-ion charging curve:
        // - Stage 1 (Bulk fast charge up to 80%): full effectiveChargeRate
        // - Stage 2 (Constant voltage / saturation above 80%): ~45% of fast rate to protect cell
        if (battery.level < 80) {
          const fastPct = 80 - battery.level;
          const tricklePct = 20;
          const hours = (fastPct / effectiveChargeRate) + (tricklePct / (effectiveChargeRate * 0.45));
          totalMinutes = Math.max(1, Math.round(hours * 60));
        } else {
          const tricklePct = 100 - battery.level;
          const hours = tricklePct / (effectiveChargeRate * 0.45);
          totalMinutes = Math.max(1, Math.round(hours * 60));
        }
      }
    } else {
      // Discharging
      if (battery.level <= 0) {
        totalMinutes = 0;
      } else if (battery.dischargingTime && isFinite(battery.dischargingTime) && battery.dischargingTime > 0) {
        totalMinutes = Math.round(battery.dischargingTime / 60);
      } else {
        const hours = battery.level / effectiveDrainRate;
        totalMinutes = Math.max(1, Math.round(hours * 60));
      }
    }

    const safeMinutes = (isFinite(totalMinutes) && !isNaN(totalMinutes) && totalMinutes >= 0)
      ? Math.round(totalMinutes)
      : (isCharging ? 45 : 360);

    // Format human-friendly time duration
    const hrs = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    let timeFormatted = '';
    let timeFormattedShort = '';

    if (isCharging && isFullyCharged) {
      timeFormatted = isHindi ? 'पूर्ण चार्ज (100%)' : 'Fully Charged';
      timeFormattedShort = isHindi ? '100% फुल' : '100% Full';
    } else if (hrs > 0) {
      timeFormatted = isHindi
        ? `${hrs} घंटे ${mins} मिनट`
        : `${hrs} hr ${mins} min`;
      timeFormattedShort = `${hrs}h ${mins}m`;
    } else {
      timeFormatted = isHindi ? `${mins} मिनट` : `${mins} min`;
      timeFormattedShort = `${mins}m`;
    }

    // Estimated target clock time (when will it be full or empty)
    const targetTimestamp = Date.now() + safeMinutes * 60 * 1000;
    const targetDate = new Date(targetTimestamp);
    const now = new Date();
    const isToday = targetDate.getDate() === now.getDate() && targetDate.getMonth() === now.getMonth();
    const isTomorrow = targetDate.getDate() === (now.getDate() + 1) && targetDate.getMonth() === now.getMonth();

    const timeOption: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24Hour,
    };
    const targetClockTime = targetDate.toLocaleTimeString([], timeOption);
    const targetDayLabel = isToday
      ? (isHindi ? 'आज' : 'Today')
      : isTomorrow
      ? (isHindi ? 'कल' : 'Tomorrow')
      : targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

    let projectedDescription = '';
    if (isCharging) {
      if (isFullyCharged) {
        projectedDescription = isHindi
          ? 'बैटरी पूरी तरह चार्ज है • ओवरचार्ज सुरक्षा सक्रिय'
          : 'Battery at full capacity • Protection active';
      } else {
        projectedDescription = isHindi
          ? `अनुमानित फुल चार्ज: ${targetClockTime} (${targetDayLabel})`
          : `Full by ~${targetClockTime} (${targetDayLabel})`;
      }
    } else {
      if (battery.level <= 15) {
        projectedDescription = isHindi
          ? `⚠️ बैटरी बेहद कम है! लगभग ${targetClockTime} (${targetDayLabel}) तक चलेगी`
          : `⚠️ Critically low! Runs until ~${targetClockTime} (${targetDayLabel})`;
      } else {
        projectedDescription = isHindi
          ? `लगभग ${targetClockTime} (${targetDayLabel}) तक चलेगी`
          : `Runs until ~${targetClockTime} (${targetDayLabel})`;
      }
    }

    // Eco saver extra time calculation (how much longer with Battery Saver)
    const normalHours = battery.level / baseDrainRate;
    const ecoHours = battery.level / (baseDrainRate * 0.72);
    const extraMinutes = Math.max(0, Math.round((ecoHours - normalHours) * 60));
    const extraHrs = Math.floor(extraMinutes / 60);
    const extraMins = extraMinutes % 60;
    const extraTimeFormatted = extraHrs > 0
      ? `${extraHrs}h ${extraMins}m`
      : `${extraMinutes}m`;

    return {
      isCharging,
      isFullyCharged,
      totalMinutes,
      hrs,
      mins,
      timeFormatted,
      timeFormattedShort,
      projectedDescription,
      targetClockTime,
      targetDayLabel,
      activeRate: isCharging ? Number(effectiveChargeRate.toFixed(1)) : Number(effectiveDrainRate.toFixed(1)),
      baseDrainRate: Number(baseDrainRate.toFixed(1)),
      effectiveDrainRate: Number(effectiveDrainRate.toFixed(1)),
      effectiveChargeRate: Number(effectiveChargeRate.toFixed(1)),
      netDischarge,
      chargingCycles: Math.max(1, chargingCycles),
      extraTimeFormatted,
    };
  }, [filteredPoints, battery, batterySaver, isHindi, is24Hour]);

  // SVG Chart Geometry
  const width = 560;
  const height = 180;
  const padding = { top: 20, right: 25, bottom: 35, left: 35 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const minTime = filteredPoints[0]?.timestamp || Date.now() - 24 * 3600000;
  const maxTime = filteredPoints[filteredPoints.length - 1]?.timestamp || Date.now();
  const timeSpan = Math.max(1, maxTime - minTime);

  const getCoordinates = (point: BatteryUsagePoint) => {
    const x = padding.left + ((point.timestamp - minTime) / timeSpan) * graphWidth;
    // Y: 100% at top, 0% at bottom
    const y = padding.top + (1 - point.level / 100) * graphHeight;
    return { x, y };
  };

  // Generate SVG path string with smooth smoothing
  const pathD = useMemo(() => {
    if (filteredPoints.length === 0) return '';
    const coords = filteredPoints.map(getCoordinates);
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [filteredPoints]);

  // Area path for gradient fill below line
  const areaD = useMemo(() => {
    if (!pathD || filteredPoints.length === 0) return '';
    const coords = filteredPoints.map(getCoordinates);
    const first = coords[0];
    const last = coords[coords.length - 1];
    const bottomY = padding.top + graphHeight;
    return `${pathD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [pathD, filteredPoints]);

  return (
    <div className="rounded-3xl bg-[#080d1a] border border-cyan-500/25 p-4 sm:p-5 shadow-[0_0_30px_rgba(0,240,255,0.12)] space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/15 pb-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl border transition-all ${
              battery.charging
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                : battery.level < 20
                ? 'bg-red-500/20 text-red-400 border-red-400/40 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
            }`}
          >
            {battery.charging ? (
              <BatteryCharging className="w-5 h-5 animate-pulse" />
            ) : (
              <Battery className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {isHindi ? 'बैटरी खपत रुझान (Battery Usage Trends)' : 'Battery Consumption & Trends'}
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  battery.charging
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                }`}
              >
                {battery.charging ? '⚡ Charging' : 'Discharging'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isHindi
                ? 'समय के साथ वास्तविक बिजली खपत और बैटरी स्तर का ग्राफ़'
                : 'Real-time telemetry tracking power drain, charge cycles, and hardware draw'}
            </p>
          </div>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 bg-[#0b1528] p-1 rounded-xl border border-cyan-500/20 self-start sm:self-auto">
          {(['6h', '12h', '24h'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                timeRange === range
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* PROMINENT HERO DISPLAY: Time to Full OR Estimated Time Remaining */}
      <div
        className={`relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 ${
          battery.charging
            ? 'bg-gradient-to-r from-emerald-950/40 via-[#0b1c2b] to-[#07131e] border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
            : battery.level <= 15
            ? 'bg-gradient-to-r from-red-950/40 via-[#1a0c14] to-[#0d070b] border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
            : 'bg-gradient-to-r from-cyan-950/35 via-[#0b182e] to-[#070e1c] border-cyan-500/35 shadow-[0_0_25px_rgba(0,240,255,0.15)]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-mono ${
                  battery.charging
                    ? 'text-emerald-400'
                    : battery.level <= 15
                    ? 'text-red-400'
                    : 'text-cyan-400'
                }`}
              >
                {battery.charging ? (
                  <>
                    <Zap className="w-4 h-4 animate-bounce text-emerald-400" />
                    <span>{isHindi ? 'फुल चार्ज होने में समय (Time to Full)' : 'Time to Full'}</span>
                  </>
                ) : (
                  <>
                    <Timer className="w-4 h-4 text-cyan-400" />
                    <span>{isHindi ? 'अनुमानित शेष समय (Estimated Time Remaining)' : 'Estimated Time Remaining'}</span>
                  </>
                )}
              </span>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  battery.charging
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : batterySaver
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                }`}
              >
                {battery.charging
                  ? '+ ' + metrics.activeRate + '%/hr Fast'
                  : '- ' + metrics.activeRate + '%/hr Drain'}
              </span>
            </div>

            {/* Giant Time Remaining / Full Value */}
            <div className="flex items-baseline gap-3">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  battery.charging
                    ? 'text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : battery.level <= 15
                    ? 'text-red-300 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                    : 'text-white drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                }`}
              >
                {metrics.timeFormatted}
              </span>

              {battery.charging ? (
                <span className="text-xs text-emerald-400/90 font-mono">
                  {metrics.isFullyCharged ? '⚡ 100%' : `(${100 - battery.level}% left)`}
                </span>
              ) : (
                <span className="text-xs text-cyan-400/90 font-mono">
                  ({battery.level}% remaining)
                </span>
              )}
            </div>

            {/* Projected Target Time Explanation */}
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{metrics.projectedDescription}</span>
            </p>
          </div>

          {/* Right Side Telemetry Badges */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            {battery.charging ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {battery.level < 80
                    ? (isHindi ? 'फेज़ 1: 25W फास्ट चार्ज (<80%)' : 'Stage 1: Fast Bulk (<80%)')
                    : (isHindi ? 'फेज़ 2: ट्रिकल सेफ चार्ज (>80%)' : 'Stage 2: Trickle Protect (>80%)')}
                </span>
              </div>
            ) : batterySaver ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isHindi
                    ? `बैटरी सेवर सक्रिय (+~${metrics.extraTimeFormatted} अतिरिक्त)`
                    : `Eco Mode Active (+~${metrics.extraTimeFormatted} gained)`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {isHindi
                    ? `सेवर ऑन करने पर: +~${metrics.extraTimeFormatted}`
                    : `Eco saver potential: +~${metrics.extraTimeFormatted}`}
                </span>
              </div>
            )}

            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span>{isHindi ? 'लक्ष्य घड़ी समय:' : 'Target Time:'}</span>
              <span className="text-white font-bold">{metrics.targetClockTime}</span>
              <span className="text-slate-500">({metrics.targetDayLabel})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Status Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Stat 1: Current Level */}
        <div className="p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/15 flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] uppercase font-mono flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            {isHindi ? 'वर्तमान स्तर' : 'Current Level'}
          </span>
          <span className="text-lg font-black font-mono text-white mt-1">
            {battery.level}%
          </span>
          <span className="text-[10px] text-cyan-400/80 mt-0.5">
            {battery.charging ? 'Plugged In ⚡' : `${100 - battery.level}% consumed`}
          </span>
        </div>

        {/* Stat 2: Time to Full or Estimated Time Remaining */}
        <div className="p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/15 flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] uppercase font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            {battery.charging
              ? (isHindi ? 'फुल चार्ज समय' : 'Time to Full')
              : (isHindi ? 'अनुमानित शेष' : 'Time Remaining')}
          </span>
          <span
            className={`text-lg font-black font-mono mt-1 ${
              battery.charging ? 'text-emerald-300' : 'text-cyan-300'
            }`}
          >
            {metrics.timeFormattedShort}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 truncate" title={metrics.projectedDescription}>
            {battery.charging ? 'Until 100% full' : `Until 0% empty`}
          </span>
        </div>

        {/* Stat 3: Current Drain / Charge Rate */}
        <div className="p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/15 flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] uppercase font-mono flex items-center gap-1">
            <TrendingDown className={`w-3 h-3 ${battery.charging ? 'text-emerald-400 rotate-180' : 'text-amber-400'}`} />
            {battery.charging
              ? (isHindi ? 'चार्जिंग दर' : 'Charge Rate')
              : (isHindi ? 'औसत खपत दर' : 'Avg Drain Rate')}
          </span>
          <span
            className={`text-lg font-black font-mono mt-1 ${
              battery.charging ? 'text-emerald-300' : 'text-amber-300'
            }`}
          >
            {battery.charging ? '+' : '-'}{metrics.activeRate}%/hr
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {battery.charging ? '25W Fast Active' : batterySaver ? '🔋 Eco Throttled' : 'Standard 60Hz'}
          </span>
        </div>

        {/* Stat 4: Target Clock Time */}
        <div className="p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/15 flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] uppercase font-mono flex items-center gap-1">
            <Timer className="w-3 h-3 text-cyan-400" />
            {battery.charging
              ? (isHindi ? 'फुल चार्ज लक्ष्य' : 'Full By Target')
              : (isHindi ? 'समाप्ति लक्ष्य' : 'Depleted By')}
          </span>
          <span className="text-lg font-black font-mono text-cyan-300 mt-1">
            {metrics.targetClockTime}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {metrics.targetDayLabel}
          </span>
        </div>
      </div>

      {/* SVG Line / Area Graph */}
      <div className="relative rounded-2xl bg-[#060a12] border border-cyan-500/20 p-2 sm:p-3 overflow-hidden">
        {/* Glow backdrop inside chart */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 sm:h-52 select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#080c14" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="batteryLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="70%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor={battery.charging ? '#10b981' : '#22d3ee'} />
              </linearGradient>

              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {[100, 75, 50, 25, 0].map((pct) => {
              const y = padding.top + (1 - pct / 100) * graphHeight;
              return (
                <g key={pct}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="rgba(0, 240, 255, 0.08)"
                    strokeDasharray={pct === 0 || pct === 100 ? undefined : '3,3'}
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    fill="rgba(148, 163, 184, 0.6)"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Gradient Area */}
            {areaD && (
              <path
                d={areaD}
                fill="url(#batteryGrad)"
                className="transition-all duration-300"
              />
            )}

            {/* Glowing Main Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="url(#batteryLineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#neonGlow)"
                className="transition-all duration-300"
              />
            )}

            {/* Data Points on Line */}
            {filteredPoints.map((p, idx) => {
              const { x, y } = getCoordinates(p);
              const isLast = idx === filteredPoints.length - 1;
              return (
                <g
                  key={`${p.timestamp}-${idx}`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredPoint({ point: p, x, y })}
                  onClick={() => setHoveredPoint({ point: p, x, y })}
                >
                  {/* Invisible larger hit target */}
                  <circle cx={x} cy={y} r="12" fill="transparent" />

                  {/* Charging ring marker */}
                  {p.charging && (
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Main point circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isLast ? '4.5' : '3'}
                    fill={p.charging ? '#10b981' : isLast ? '#00f0ff' : '#0284c7'}
                    stroke="#080c14"
                    strokeWidth="1.5"
                    className="transition-transform group-hover:scale-150"
                  />
                </g>
              );
            })}

            {/* Time labels on X Axis */}
            {filteredPoints.length > 0 && (
              <>
                <text
                  x={padding.left}
                  y={height - 10}
                  fill="rgba(148, 163, 184, 0.6)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {new Date(minTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </text>
                <text
                  x={padding.left + graphWidth / 2}
                  y={height - 10}
                  fill="rgba(148, 163, 184, 0.6)"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {new Date(minTime + timeSpan / 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </text>
                <text
                  x={width - padding.right}
                  y={height - 10}
                  fill="#00f0ff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {isHindi ? 'अभी (Now)' : 'Now'}
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none p-2 rounded-xl bg-[#0b1528]/95 border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.4)] text-[11px] backdrop-blur-md transition-all duration-150"
            style={{
              left: `${Math.min(width - 150, Math.max(10, (hoveredPoint.x / width) * 100))}%`,
              top: '10px',
            }}
          >
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  hoveredPoint.point.charging ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
                }`}
              />
              <span className="font-mono text-cyan-300">{hoveredPoint.point.level}%</span>
              <span className="text-[10px] text-slate-300">
                {hoveredPoint.point.charging ? '⚡ Charging' : 'Discharging'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {new Date(hoveredPoint.point.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              {' • '}
              {new Date(hoveredPoint.point.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>

      {/* Power Consumption by Subsystem Breakdown */}
      <div className="p-3.5 rounded-2xl bg-[#0b1528] border border-cyan-500/15 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            {isHindi ? 'हार्डवेयर व घटक ऊर्जा खपत' : 'Power Usage by Subsystem'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {isHindi ? 'अंतिम 24 घंटे का अनुमान' : 'Est. Last 24h'}
          </span>
        </div>

        <div className="space-y-2 text-[11px]">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                DEKA AI Neural Brain & GenAI API
              </span>
              <span className="font-mono text-cyan-300 font-bold">36%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: '36%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3 h-3 text-blue-400" />
                Display & Futuristic Neon Shaders (60Hz)
              </span>
              <span className="font-mono text-blue-300 font-bold">29%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '29%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 text-purple-400" />
                Speech Synthesis (TTS) & Microphone
              </span>
              <span className="font-mono text-purple-300 font-bold">18%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '18%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-emerald-400" />
                Network & Local-First IndexedDB Sync
              </span>
              <span className="font-mono text-emerald-300 font-bold">17%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '17%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation / Test Bar */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-[#060c18] to-[#0a1426] border border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px]">
            {isHindi ? 'सिमुलेशन और टेस्ट टूल्स:' : 'Interactive Telemetry Simulation:'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {onSimulateDrain && (
            <button
              type="button"
              onClick={() => onSimulateDrain(5)}
              className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Simulate -5% battery drain"
            >
              <MinusCircle className="w-3 h-3" />
              -5% Drain
            </button>
          )}

          {onSimulateCharge && (
            <button
              type="button"
              onClick={() => onSimulateCharge(10)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Simulate +10% charge"
            >
              <PlusCircle className="w-3 h-3" />
              +10% Charge ⚡
            </button>
          )}

          {onResetHistory && (
            <button
              type="button"
              onClick={onResetHistory}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Reset 24h sample data"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Graph
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
