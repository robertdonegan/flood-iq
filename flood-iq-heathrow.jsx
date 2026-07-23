import { useState, useEffect, useMemo, useRef } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

/* ==================================================================
   TOKENS — lifted from Flood IQ (Figma: K1jHQ2zUuTxHCtWZdxMHHr)
   ================================================================== */
const T = {
  // neutrals
  n400: "#F3F3F3",
  n600: "#E5E5E5",
  n1000: "#999999",
  n1100: "#666666",
  n1: "#333333",
  n3: "#C8C8C8",
  white: "#FFFFFF",
  borderPrimary: "#E6E6E6",
  surface1: "#FFFFFF",
  // brand
  blue800: "#3B6DE6",
  blueP2: "#0A7DFF",
  blueP1: "#231EDC",
  red800: "#CC334F",
  red100: "#FDE9EC",
  orange100: "#FFECD8",
  orange500: "#FF9735",
  orange600: "#FE7E00",
  orange1200: "#922700",
  orangeP1: "#FF6100",
  orangeP3: "#FFCA8F",
  yellowP2: "#FFB41E",
  // scheme extras
  ground: "#7A5230",
  water: "#BBD9E8",
  waterDeep: "#8FBFD6",
  land: "#F7F6F2",
  tarmac: "#DFDCD6",
  scenario: "#5B4A8A",
  // effects
  shadow: "0px 1px 2px 0px rgba(0,0,0,0.1), 0px 2px 4px 0px rgba(0,0,0,0.1)",
  shadowLg: "0px 2px 4px 0px rgba(0,0,0,0.1), 0px 8px 24px 0px rgba(0,0,0,0.14)",
  // radii
  r2: 2, r4: 4, r8: 8, r16: 16, r20: 20, r32: 32,
};

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.fiq { font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif; }
.fiq-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
@keyframes fiqpulse { 0% { transform: scale(1); opacity: .55; } 70% { transform: scale(2.4); opacity: 0; } 100% { transform: scale(2.4); opacity: 0; } }
.fiq-pulse { animation: fiqpulse 1.8s ease-out infinite; }
@keyframes fiqdash { to { stroke-dashoffset: -14; } }
.fiq-dash { animation: fiqdash 1.4s linear infinite; }
@media (prefers-reduced-motion: reduce) { .fiq-pulse, .fiq-dash { animation: none; } }
.fiq-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.fiq-scroll::-webkit-scrollbar-thumb { background: ${T.n3}; border-radius: 4px; }
.fiq-scroll::-webkit-scrollbar-track { background: transparent; }
input[type=range] { accent-color: ${T.blue800}; }
`;

/* EA three-tier taxonomy + baseline */
const LEVELS = {
  normal:  { label: "Normal",                key: "normal",  fill: T.blueP2,   chipBg: "#E7F2FF", chipBorder: T.blueP2,  chipText: "#0B4C99" },
  alert:   { label: "Flood Alert",           key: "alert",   fill: T.orange500,chipBg: T.orange100, chipBorder: T.orange500, chipText: T.orange1200 },
  warning: { label: "Flood Warning",         key: "warning", fill: T.orange600,chipBg: T.orange100, chipBorder: T.orange600, chipText: T.orange1200 },
  severe:  { label: "Severe Flood Warning",  key: "severe",  fill: T.red800,   chipBg: T.red800,   chipBorder: T.red800,   chipText: T.white },
};
const LEVEL_ORDER = ["normal", "alert", "warning", "severe"];

const GROUP_META = {
  reservoir: { label: "Reservoir body",   ground: "above", short: "RES" },
  structure: { label: "Control structure",ground: "above", short: "STR" },
  embankment:{ label: "Embankment",       ground: "below", short: "EMB" },
  river:     { label: "River gauge",      ground: "above", short: "RIV" },
  drainage:  { label: "Airfield drainage",ground: "above", short: "DRN" },
  ground:    { label: "Groundwater",      ground: "below", short: "GW"  },
  met:       { label: "Met station",      ground: "above", short: "MET" },
};

/* ==================================================================
   ASSETS — Staines reservoir scheme, SSW of Heathrow
   Scheme name is a PLACEHOLDER; swap for the real scheme reference.
   ================================================================== */
const seedAssets = [
  { id: "res-01", name: "Reservoir level", ref: "STR-RES-01", group: "reservoir", unit: "mAOD",
    level: 30.10, min: 26, max: 32.6, alert: 31.10, warning: 31.60, severe: 32.10, x: 322, y: 452, resp: 1.0,
    note: "Top water level 31.90 mAOD. Crest 32.60." },
  { id: "res-fb", name: "Crest freeboard", ref: "STR-RES-FB", group: "reservoir", unit: "m", invert: true,
    level: 2.50, min: 0, max: 4.0, alert: 1.50, warning: 1.00, severe: 0.60, x: 372, y: 424, resp: 1.0,
    note: "Derived: crest level minus water level. Falls as reservoir fills." },
  { id: "spw-01", name: "Spillway weir", ref: "STR-SPW-01", group: "structure", unit: "m³/s",
    level: 0.0, min: 0, max: 45, alert: 6, warning: 18, severe: 32, x: 432, y: 470, resp: 1.4,
    note: "Ogee overflow to Colne. Dry below top water level." },
  { id: "dot-01", name: "Draw-off tower", ref: "STR-DOT-01", group: "structure", unit: "% open",
    level: 15, min: 0, max: 100, alert: 101, warning: 102, severe: 103, x: 288, y: 486, resp: 0.4,
    note: "Controlled release to Colne. Operator setpoint." },
  { id: "pz-04", name: "Embankment piezometers P-04", ref: "STR-PZ-04", group: "embankment", unit: "kPa",
    level: 42, min: 20, max: 110, alert: 68, warning: 82, severe: 95, x: 258, y: 448, resp: 0.45,
    note: "Pore pressure, SW embankment. Lags reservoir level by ~6h." },
  { id: "seep-1", name: "Toe drain seepage", ref: "STR-SEEP-01", group: "embankment", unit: "l/s",
    level: 1.8, min: 0, max: 20, alert: 5.5, warning: 9.0, severe: 14.0, x: 300, y: 522, resp: 0.6,
    note: "Turbidity-flagged. Rising trend during drawdown is the concern." },
  { id: "riv-col", name: "Colne at Wraysbury", ref: "EA-COL-14", group: "river", unit: "m",
    level: 1.24, min: 0, max: 4.2, alert: 2.10, warning: 2.75, severe: 3.40, x: 168, y: 400, resp: 1.2,
    note: "Receives spillway and draw-off. Staines/Wraysbury receptors." },
  { id: "riv-lon", name: "Longford River offtake", ref: "EA-LON-03", group: "river", unit: "m",
    level: 0.62, min: 0, max: 2.4, alert: 1.15, warning: 1.55, severe: 1.95, x: 252, y: 352, resp: 0.95,
    note: "Crosses airfield east–west. Culverted under 09L/27R." },
  { id: "drn-e", name: "Eastern balancing pond", ref: "HAL-BP-E", group: "drainage", unit: "% full",
    level: 28, min: 0, max: 100, alert: 62, warning: 80, severe: 93, x: 688, y: 262, resp: 1.35,
    note: "Serves T2/T3 aprons. Discharge consent limits release rate." },
  { id: "drn-n", name: "Northern balancing pond", ref: "HAL-BP-N", group: "drainage", unit: "% full",
    level: 22, min: 0, max: 100, alert: 62, warning: 80, severe: 93, x: 448, y: 156, resp: 1.25,
    note: "Serves 09R/27L and northern taxiways." },
  { id: "gw-st", name: "Stanwell gravels BH-11", ref: "EA-GW-11", group: "ground", unit: "mAOD",
    level: 15.4, min: 12, max: 22, alert: 18.2, warning: 19.4, severe: 20.6, x: 468, y: 546, resp: 0.28,
    note: "Shallow gravel aquifer. Drives basement/underpass flooding." },
  { id: "met-01", name: "Airfield rain gauge", ref: "HAL-MET-01", group: "met", unit: "mm/h",
    level: 0.4, min: 0, max: 35, alert: 8, warning: 15, severe: 24, x: 560, y: 214, resp: 1.0,
    note: "Tipping bucket, 1-min resolution." },
];

const seedFeeds = [
  { id: 1, source: "official", who: "EA Floodline", when: "3 min", text: "Flood Alert in force — Lower Colne including Wraysbury, Colnbrook and Staines-upon-Thames." },
  { id: 2, source: "official", who: "Met Office", when: "11 min", text: "Amber warning for rain, Greater London and Thames Valley, 16:00 today to 09:00 tomorrow." },
  { id: 3, source: "ops", who: "HAL Ops Control", when: "16 min", text: "Stand 512–518 standing water reported by ground crew. Sweeper deployed." },
  { id: 4, source: "sensor", who: "Telemetry", when: "22 min", text: "P-04 piezometer array rising 3.1 kPa/h — above modelled response for current reservoir level." },
  { id: 5, source: "media", who: "Surrey Live", when: "34 min", text: "Staines residents told to prepare as Colne levels climb for third day running." },
  { id: 6, source: "social", who: "@wraysburyflood", when: "41 min", text: "Water over the road at the Hythe End junction again. Same spot as 2014." },
  { id: 7, source: "ops", who: "Airside Duty Mgr", when: "52 min", text: "Requesting forecast for 09L/27R culvert crossing before evening bank." },
];

const FEED_META = {
  official: { label: "Official", color: T.blue800 },
  ops:      { label: "Airport ops", color: "#0F7C6B" },
  media:    { label: "Media", color: "#6B4E9E" },
  social:   { label: "Social", color: "#B4654A" },
  sensor:   { label: "Sensor", color: T.ground },
};

const AUDIENCES = [
  { id: "public", label: "Downstream residents", detail: "Staines · Wraysbury · Colnbrook · Stanwell", est: "12,400 opted-in" },
  { id: "ops",    label: "Airport operations",   detail: "HAL control · airside duty · ground handling", est: "310 staff" },
  { id: "emerg",  label: "Emergency services",   detail: "LFB · Surrey FRS · airport fire service",     est: "3 control rooms" },
];

/* ==================================================================
   Helpers
   ================================================================== */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* Handles inverted assets (freeboard: lower = worse) */
function levelFor(a, v) {
  if (a.invert) {
    if (v <= a.severe) return "severe";
    if (v <= a.warning) return "warning";
    if (v <= a.alert) return "alert";
    return "normal";
  }
  if (v >= a.severe) return "severe";
  if (v >= a.warning) return "warning";
  if (v >= a.alert) return "alert";
  return "normal";
}
const statusOf = (a) => levelFor(a, a.level);

const fmt = (v, unit) =>
  unit === "% full" || unit === "%" || unit === "% open" || unit === "kPa" ? String(Math.round(v)) : v.toFixed(2);

const nowStamp = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const stampFull = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
  " " + new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/* Scenario projection — reservoir-centric.
   Pre-emptive drawdown buys freeboard but loads the Colne. */
function project(a, p) {
  const intensity = p.rain / Math.max(p.duration, 1);
  const inflow = p.rain * (0.35 + p.catchmentWet / 200);
  const drawdownM = (p.drawdown / 100) * 1.9;

  switch (a.id) {
    case "res-01": {
      const startAdj = (p.startFull - 82) * 0.035;
      return clamp(a.level + startAdj + inflow * 0.021 - drawdownM, a.min, a.max);
    }
    case "res-fb": {
      const res = project(seedAssets.find((x) => x.id === "res-01"), p);
      return clamp(32.6 - res, a.min, a.max);
    }
    case "spw-01": {
      const res = project(seedAssets.find((x) => x.id === "res-01"), p);
      const over = Math.max(0, res - 31.9);
      return clamp(Math.pow(over, 1.5) * 78, a.min, a.max);
    }
    case "dot-01":
      return clamp(15 + p.drawdown * 0.82, a.min, a.max);
    case "pz-04": {
      const res = project(seedAssets.find((x) => x.id === "res-01"), p);
      const head = (res - 29.5) * 21;
      const rapid = p.drawdown > 45 ? p.drawdown * 0.22 : 0; // rapid drawdown raises effective gradient
      return clamp(38 + head + rapid, a.min, a.max);
    }
    case "seep-1": {
      const pz = project(seedAssets.find((x) => x.id === "pz-04"), p);
      return clamp(0.6 + Math.max(0, pz - 40) * 0.135, a.min, a.max);
    }
    case "riv-col": {
      const spw = project(seedAssets.find((x) => x.id === "spw-01"), p);
      const release = p.drawdown * 0.0125;
      return clamp(a.level + intensity * 0.14 * (0.5 + p.catchmentWet / 100) + spw * 0.031 + release, a.min, a.max);
    }
    case "riv-lon":
      return clamp(a.level + intensity * 0.085 * (0.5 + p.catchmentWet / 100), a.min, a.max);
    case "drn-e":
    case "drn-n":
      return clamp(a.level + intensity * 2.6 * a.resp * (0.6 + p.catchmentWet / 160) - (p.pondPreRelease ? 14 : 0), a.min, a.max);
    case "gw-st":
      return clamp(a.level + p.rain * 0.0165 * (p.catchmentWet / 100), a.min, a.max);
    case "met-01":
      return clamp(intensity, a.min, a.max);
    default:
      return a.level;
  }
}

/* ==================================================================
   Primitives matching Flood IQ components
   ================================================================== */

/* FIQAlertPulse + FloodAlert chip */
function AlertChip({ status, children, onClick, active }) {
  const L = LEVELS[status];
  return (
    <button onClick={onClick}
      className="fiq inline-flex items-center gap-1 shrink-0"
      style={{
        height: 20, paddingLeft: 4, paddingRight: 8, borderRadius: T.r16,
        background: L.chipBg, border: `1px solid ${active ? T.n1 : L.chipBorder}`,
        color: L.chipText, fontSize: 12, fontWeight: 500, cursor: onClick ? "pointer" : "default",
      }}>
      <span style={{ position: "relative", width: 12, height: 12, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {status !== "normal" && (
          <span className="fiq-pulse" style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: L.chipText }} />
        )}
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: L.chipText }} />
      </span>
      {children}
    </button>
  );
}

/* FloodCalculationPoint — the Figma's map marker */
function CalcPoint({ value, status, selected, onClick, projected }) {
  const L = LEVELS[status];
  return (
    <button onClick={onClick}
      className="fiq"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: selected ? T.orangeP3 : T.white,
        border: `2px solid ${selected ? T.orangeP1 : T.n1}`,
        borderRadius: T.r8, padding: 1.5, cursor: "pointer",
        boxShadow: T.shadow, whiteSpace: "nowrap",
      }}>
      <span style={{
        background: projected ? T.scenario : L.fill, borderRadius: T.r20,
        padding: "2px 3px", color: T.white, fontSize: 12, fontWeight: 600, lineHeight: 1,
      }}>
        {value}
      </span>
    </button>
  );
}

/* Carried forward from Spate, re-tokened. Nothing in Flood IQ does this job. */
function StageBoard({ asset, height = 128, width = 30, projected = null }) {
  const range = asset.max - asset.min;
  const pct = (v) => clamp(((v - asset.min) / range) * 100, 0, 100);
  const stops = asset.invert
    ? [
        { from: 0, to: pct(asset.severe), color: T.red800 },
        { from: pct(asset.severe), to: pct(asset.warning), color: T.orange600 },
        { from: pct(asset.warning), to: pct(asset.alert), color: T.orange500 },
        { from: pct(asset.alert), to: 100, color: T.blueP2 },
      ]
    : [
        { from: 0, to: pct(asset.alert), color: T.blueP2 },
        { from: pct(asset.alert), to: pct(asset.warning), color: T.orange500 },
        { from: pct(asset.warning), to: pct(asset.severe), color: T.orange600 },
        { from: pct(asset.severe), to: 100, color: T.red800 },
      ];
  const lvl = pct(asset.level);
  const barW = width >= 26 ? 11 : 7;
  const below = GROUP_META[asset.group].ground === "below";
  return (
    <svg width={width} height={height} style={{ flexShrink: 0 }} aria-label={`${asset.name} gauge`}>
      {stops.map((b, i) => (
        <rect key={i} x={5} width={barW} y={height - (b.to / 100) * height}
          height={Math.max(0, ((b.to - b.from) / 100) * height)} fill={b.color} opacity="0.26" />
      ))}
      {[0, 25, 50, 75, 100].map((t) => (
        <rect key={t} x={5} y={height - (t / 100) * height - 0.5} width={t % 50 === 0 ? barW : barW * 0.55} height="1" fill={T.n1} opacity="0.45" />
      ))}
      <rect x={5} y={height - (lvl / 100) * height} width={barW} height={(lvl / 100) * height}
        fill={below ? T.ground : T.waterDeep} opacity="0.9" />
      {projected !== null && (
        <g>
          <rect x={3} y={height - (pct(projected) / 100) * height - 1} width={barW + 4} height="2.5" fill={T.scenario} />
        </g>
      )}
      <polygon
        points={`${5 + barW + 1},${height - (lvl / 100) * height} ${5 + barW + 9},${height - (lvl / 100) * height - 4.5} ${5 + barW + 9},${height - (lvl / 100) * height + 4.5}`}
        fill={T.n1} />
    </svg>
  );
}

function Spark({ data, color, height = 32 }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 3, right: 2, bottom: 0, left: 2 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Floating panel shell — Flood IQ elevation, sits over the map */
function Panel({ title, children, onClose, style, footer }) {
  return (
    <section className="fiq flex flex-col"
      style={{
        background: T.surface1, border: `1px solid ${T.borderPrimary}`,
        borderRadius: T.r4, boxShadow: T.shadow, overflow: "hidden", ...style,
      }}>
      <header className="flex items-center justify-between shrink-0"
        style={{ padding: "6px 8px", borderBottom: `1px solid ${T.borderPrimary}`, background: T.n400 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.n1 }}>{title}</span>
        {onClose && (
          <button onClick={onClose} style={{ fontSize: 12, color: T.n1100, lineHeight: 1, padding: "0 2px" }} aria-label="Close panel">✕</button>
        )}
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto fiq-scroll">{children}</div>
      {footer}
    </section>
  );
}

/* Minimal inline icons (Figma exports expire in 7 days — not embedded) */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={fill} stroke={stroke} strokeWidth="1.35"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const ICONS = {
  live:   <><circle cx="8" cy="8" r="2.2" /><path d="M3.2 3.2a6.8 6.8 0 0 0 0 9.6M12.8 3.2a6.8 6.8 0 0 1 0 9.6" /></>,
  network:<><circle cx="3.5" cy="4" r="1.6" /><circle cx="12.5" cy="4" r="1.6" /><circle cx="8" cy="12" r="1.6" /><path d="M5 4.6 8 10.5M11 4.6 8 10.5" /></>,
  scenario:<><path d="M2 12.5 5.5 7l3 3L14 3" /><path d="M10.5 3H14v3.5" /></>,
  incident:<><path d="M8 2 15 14H1z" /><path d="M8 6.5v3.2M8 11.7v.2" /></>,
  notify: <><path d="M8 2a4 4 0 0 0-4 4v3l-1.2 2.2h10.4L12 9V6a4 4 0 0 0-4-4Z" /><path d="M6.4 13.2a1.7 1.7 0 0 0 3.2 0" /></>,
  layers: <><path d="M8 2 2 5.2 8 8.4l6-3.2z" /><path d="m2 8.8 6 3.2 6-3.2" /></>,
  cursor: <><path d="M4 2.5 12.5 8 8.8 9 7 13z" /></>,
  measure:<><path d="M2 9.5 9.5 2l4.5 4.5L6.5 14z" /><path d="M5 6.5 6.5 8M7 4.5 8.5 6M9 2.5 10.5 4" /></>,
  query:  <><circle cx="7" cy="7" r="4.3" /><path d="m10.2 10.2 3.3 3.3" /></>,
  pan:    <><path d="M8 2v6M8 8V5.5a1.2 1.2 0 0 1 2.4 0V8M10.4 8V6.4a1.2 1.2 0 0 1 2.4 0v3.1c0 2.4-1.7 4.5-4.4 4.5-2 0-3-.9-4-2.4L2.6 9.2a1.2 1.2 0 0 1 1.9-1.4L5.6 9" /></>,
  north:  <><path d="M8 1.5 10 8 8 14.5 6 8z" /><path d="M8 1.5V8" /></>,
  zoom:   <><circle cx="7" cy="7" r="4.3" /><path d="M5.2 7h3.6M7 5.2v3.6M10.2 10.2l3.3 3.3" /></>,
};

/* ==================================================================
   Map — Heathrow + reservoir scheme, schematic
   ================================================================== */
function HeathrowMap({ assets, mode, params, selectedId, onSelect, showScheme }) {
  return (
    <div className="absolute inset-0" style={{ background: T.land }}>
      <svg viewBox="0 0 1000 640" className="w-full h-full" preserveAspectRatio="xMidYMid slice" role="img"
        aria-label="Heathrow and reservoir scheme schematic">
        {/* --- base land --- */}
        <rect x="0" y="0" width="1000" height="640" fill={T.land} />

        {/* built-up blocks */}
        {[[60,60,120,70],[210,40,110,58],[600,70,130,60],[780,150,150,90],[700,430,180,120],[420,560,180,70],[110,560,150,60],[860,330,120,80]]
          .map(([x,y,w,h],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#EFEDE7" stroke="#E2DFD8" strokeWidth="1" />
        ))}

        {/* --- water: River Colne corridor (west) --- */}
        <path d="M150 0 C160 90 138 150 152 220 C166 290 140 340 158 400 C174 456 150 520 166 640"
          fill="none" stroke={T.waterDeep} strokeWidth="7" strokeLinecap="round" opacity="0.85" />
        {/* Wraysbury reservoir (secondary) */}
        <rect x="46" y="392" width="86" height="120" rx="8" fill={T.water} stroke={T.waterDeep} strokeWidth="1.5" />
        <text x="52" y="384" fontSize="10" fill={T.n1100} className="fiq">Wraysbury Res.</text>

        {/* Longford River across the airfield */}
        <path d="M186 366 C280 352 380 344 470 340 C570 336 660 344 760 356"
          fill="none" stroke={T.waterDeep} strokeWidth="3.4" strokeLinecap="round" opacity="0.8" strokeDasharray="0" />
        <text x="600" y="336" fontSize="10" fill={T.n1100} className="fiq">Longford River</text>

        {/* --- THE SCHEME: reservoir SSW of the airport --- */}
        <g>
          {showScheme && (
            <rect x="236" y="404" width="248" height="150" rx="14"
              fill="none" stroke={T.orangeP1} strokeWidth="2" strokeDasharray="6 4" opacity="0.9" />
          )}
          <rect x="248" y="416" width="224" height="126" rx="10" fill={T.water} stroke={T.waterDeep} strokeWidth="2" />
          {/* embankment hatch */}
          <rect x="248" y="416" width="224" height="126" rx="10" fill="none" stroke={T.ground} strokeWidth="5" opacity="0.28" />
          {/* spillway channel to Colne */}
          <path d="M472 470 C500 472 500 500 470 506" fill="none" stroke={T.waterDeep} strokeWidth="3" opacity="0.7" />
          <path d="M248 486 C210 490 186 460 160 452" fill="none" stroke={T.waterDeep} strokeWidth="3" opacity="0.7" />
          <text x="252" y="410" fontSize="11" fontWeight="600" fill={T.n1} className="fiq">Staines Reservoir scheme</text>
        </g>

        {/* --- airport --- */}
        <rect x="256" y="120" width="472" height="204" rx="8" fill={T.tarmac} stroke="#CFCBC3" strokeWidth="1.5" />
        {/* runways */}
        <rect x="278" y="168" width="428" height="15" rx="2" fill="#B8B4AC" />
        <rect x="278" y="276" width="428" height="15" rx="2" fill="#B8B4AC" />
        <text x="282" y="163" fontSize="9" fill={T.n1100} className="fiq-mono">09R / 27L</text>
        <text x="282" y="271" fontSize="9" fill={T.n1100} className="fiq-mono">09L / 27R</text>
        {/* terminals */}
        {[[430,205,64,40],[512,205,52,40],[350,215,52,30],[620,200,58,46]].map(([x,y,w,h],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#E8E5DE" stroke="#D2CEC6" strokeWidth="1" />
        ))}
        <text x="430" y="200" fontSize="10" fontWeight="600" fill={T.n1} className="fiq">Heathrow Airport</text>

        {/* --- roads --- */}
        <path d="M0 62 H1000" stroke="#D8D4CC" strokeWidth="6" fill="none" />
        <text x="16" y="56" fontSize="10" fill={T.n1100} className="fiq-mono">M4</text>
        <path d="M112 0 V640" stroke="#D8D4CC" strokeWidth="6" fill="none" />
        <text x="76" y="24" fontSize="10" fill={T.n1100} className="fiq-mono">M25</text>
        <path d="M0 372 H236 M484 372 H1000" stroke="#E0DCD4" strokeWidth="4" fill="none" />
        <text x="800" y="366" fontSize="10" fill={T.n1100} className="fiq-mono">A30</text>

        {/* --- settlements --- */}
        {[["Colnbrook",176,104],["Longford",236,110],["Harmondsworth",264,86],["Sipson",420,104],
          ["Bedfont",762,344],["Stanwell",512,412],["Staines-upon-Thames",188,566],["Ashford",700,470]]
          .map(([n,x,y])=>(
          <text key={n} x={x} y={y} fontSize="10" fill={T.n1100} className="fiq">{n}</text>
        ))}

        {/* --- asset markers --- */}
        {assets.map((a) => {
          const st = statusOf(a);
          const proj = mode === "scenario" ? project(a, params) : null;
          const projSt = proj !== null ? levelFor(a, proj) : null;
          const changed = proj !== null && projSt !== st;
          const sel = a.id === selectedId;
          return (
            <g key={a.id}>
              {mode === "live" && st === "severe" && (
                <circle cx={a.x} cy={a.y} r="9" fill={T.red800} opacity="0.2" className="fiq-pulse" style={{ transformOrigin: `${a.x}px ${a.y}px` }} />
              )}
              {changed && (
                <circle cx={a.x} cy={a.y} r="16" fill="none" stroke={LEVELS[projSt].fill}
                  strokeWidth="1.6" strokeDasharray="4 3" className="fiq-dash" opacity="0.95" />
              )}
              <foreignObject x={a.x - 26} y={a.y - 11} width="52" height="24" style={{ overflow: "visible" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CalcPoint
                    value={mode === "scenario" ? fmt(proj, a.unit) : fmt(a.level, a.unit)}
                    status={mode === "scenario" ? projSt : st}
                    selected={sel}
                    projected={mode === "scenario"}
                    onClick={() => onSelect(a.id)}
                  />
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ==================================================================
   Chrome
   ================================================================== */
function IconRail({ mode, setMode, panels, togglePanel }) {
  const modeBtns = [
    { k: "live", icon: ICONS.live, title: "Live monitoring" },
    { k: "scenario", icon: ICONS.scenario, title: "Scenario modelling" },
  ];
  const panelBtns = [
    { k: "network", icon: ICONS.network, title: "Network / asset table" },
    { k: "incidents", icon: ICONS.incident, title: "Incidents" },
    { k: "feeds", icon: ICONS.layers, title: "Feeds" },
  ];
  const btn = (active, accent) => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 24, height: 24, borderRadius: T.r2,
    background: active ? (accent || T.blue800) : "transparent",
    color: active ? T.white : T.n1100, cursor: "pointer",
  });
  return (
    <nav className="fiq flex flex-col items-center shrink-0"
      style={{ width: 56, background: T.n400, borderRight: `1px solid ${T.n600}`, padding: "16px 0", gap: 22 }}>
      {/* brand mark stand-in */}
      <div style={{ width: 24, height: 24, borderRadius: 4, background: T.blue800, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: T.white, fontSize: 12, fontWeight: 600 }}>IQ</span>
      </div>

      <div className="flex flex-col items-center" style={{ gap: 6 }}>
        {modeBtns.map((m) => (
          <button key={m.k} onClick={() => setMode(m.k)} title={m.title} aria-label={m.title}
            style={btn(mode === m.k, m.k === "scenario" ? T.scenario : T.blue800)}>
            <Icon d={m.icon} />
          </button>
        ))}
      </div>

      <div style={{ width: 20, height: 1, background: T.n600 }} />

      <div className="flex flex-col items-center" style={{ gap: 6 }}>
        {panelBtns.map((p) => (
          <button key={p.k} onClick={() => togglePanel(p.k)} title={p.title} aria-label={p.title}
            style={btn(panels[p.k], T.n600)}>
            <span style={{ color: panels[p.k] ? T.n1 : T.n1100, display: "flex" }}><Icon d={p.icon} /></span>
          </button>
        ))}
      </div>

      <div className="flex-1" />
      <div style={{ position: "relative" }}>
        <div style={{ width: 24, height: 24, borderRadius: 40, background: "#C9D6E8", border: `1px solid ${T.n600}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: T.n1100 }}>RD</div>
      </div>
    </nav>
  );
}

function TopNav({ assets, published, onChipClick, mode }) {
  const counts = useMemo(() => {
    const c = { normal: 0, alert: 0, warning: 0, severe: 0 };
    assets.forEach((a) => c[statusOf(a)]++);
    return c;
  }, [assets]);
  const active = LEVEL_ORDER.filter((k) => k !== "normal" && counts[k] > 0);
  return (
    <header className="fiq flex items-center shrink-0"
      style={{ height: 64, padding: "0 20px", background: T.n400, borderBottom: `1px solid ${T.n600}`, gap: 24 }}>
      <div className="flex items-baseline" style={{ gap: 4, minWidth: 0 }}>
        <span style={{ fontSize: 12, color: T.n1000 }}>Last published:</span>
        <span className="truncate" style={{ fontSize: 12, color: T.n1100 }}>{published}</span>
      </div>
      <div className="flex items-baseline" style={{ gap: 4 }}>
        <span style={{ fontSize: 12, color: T.n1000 }}>Scheme:</span>
        <span style={{ fontSize: 12, color: T.n1100 }}>Staines Reservoir · Heathrow SSW</span>
      </div>
      <div className="flex items-baseline" style={{ gap: 4 }}>
        <span style={{ fontSize: 12, color: T.n1000 }}>Mode:</span>
        <span style={{ fontSize: 12, color: mode === "scenario" ? T.scenario : T.n1100, fontWeight: mode === "scenario" ? 600 : 400 }}>
          {mode === "scenario" ? "Scenario" : "Live"}
        </span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center" style={{ gap: 4 }}>
        {active.length === 0 && (
          <AlertChip status="normal">All stations normal</AlertChip>
        )}
        {active.map((k) => (
          <AlertChip key={k} status={k} onClick={() => onChipClick(k)}>
            {counts[k]} {LEVELS[k].label}
          </AlertChip>
        ))}
      </div>
    </header>
  );
}

function MapTools() {
  const card = { background: T.surface1, border: `1px solid ${T.borderPrimary}`, borderRadius: T.r4, padding: 8, boxShadow: T.shadow };
  const tool = { display: "flex", alignItems: "center", justifyContent: "center", padding: 4, borderRadius: T.r2, color: T.n1, cursor: "pointer" };
  const round = { background: T.surface1, border: `1px solid ${T.borderPrimary}`, borderRadius: T.r32,
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: T.n1, cursor: "pointer", boxShadow: T.shadow };
  return (
    <>
      <div className="absolute flex flex-col" style={{ left: 8, top: 8, gap: 8, ...card, width: 40 }}>
        {[ICONS.cursor, ICONS.measure, ICONS.query, ICONS.layers].map((d, i) => (
          <button key={i} style={tool}><Icon d={d} /></button>
        ))}
      </div>
      <div className="absolute flex flex-col" style={{ right: 8, top: 8, gap: 4 }}>
        <button style={round}><Icon d={ICONS.north} /></button>
        <button style={round}><Icon d={ICONS.zoom} /></button>
        <button style={round}><Icon d={ICONS.pan} /></button>
      </div>
    </>
  );
}

function MapScale() {
  return (
    <div className="fiq absolute flex items-end" style={{ right: 8, bottom: 8, gap: 8 }}>
      <div style={{ width: 173 }}>
        <div className="flex justify-between" style={{ fontSize: 10, fontWeight: 500, color: T.n1, paddingBottom: 2 }}>
          <span>0</span><span>2.5km</span><span>5km</span>
        </div>
        <div style={{ position: "relative", height: 2, background: T.n3, border: `1px solid ${T.white}`, borderRadius: 4 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: 2, width: 41, background: "#000", borderRadius: 4 }} />
        </div>
        <div style={{ fontSize: 10, fontWeight: 500, color: T.n1, textAlign: "right", marginTop: 4 }}>©OpenStreetMap</div>
      </div>
      <button style={{ width: 34, height: 34, borderRadius: T.r2, border: `1px solid ${T.white}`, boxShadow: T.shadow,
        background: `linear-gradient(135deg, ${T.water}, ${T.tarmac})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.n1 }}>
        <Icon d={ICONS.layers} />
      </button>
    </div>
  );
}

function Legend() {
  return (
    <div className="fiq absolute" style={{ left: 8, bottom: 8, background: T.surface1, border: `1px solid ${T.borderPrimary}`,
      borderRadius: T.r4, boxShadow: T.shadow, padding: 8, width: 178 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.n1, marginBottom: 6 }}>Legend</div>
      {LEVEL_ORDER.map((k) => (
        <div key={k} className="flex items-center" style={{ gap: 6, marginBottom: 4 }}>
          <span style={{ width: 20, height: 14, borderRadius: T.r8, border: `2px solid ${T.n1}`, background: T.white,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: 12, height: 8, borderRadius: T.r20, background: LEVELS[k].fill }} />
          </span>
          <span style={{ fontSize: 11, color: T.n1100 }}>{LEVELS[k].label}</span>
        </div>
      ))}
      <div style={{ height: 1, background: T.borderPrimary, margin: "6px 0" }} />
      <div className="flex items-center" style={{ gap: 6 }}>
        <svg width="20" height="14"><circle cx="10" cy="7" r="6" fill="none" stroke={T.scenario} strokeWidth="1.6" strokeDasharray="3 2" /></svg>
        <span style={{ fontSize: 11, color: T.n1100 }}>Projected change</span>
      </div>
      <div className="flex items-center" style={{ gap: 6, marginTop: 4 }}>
        <svg width="20" height="14"><rect x="2" y="2" width="16" height="10" rx="3" fill="none" stroke={T.orangeP1} strokeWidth="1.6" strokeDasharray="4 3" /></svg>
        <span style={{ fontSize: 11, color: T.n1100 }}>Scheme boundary</span>
      </div>
    </div>
  );
}

/* ==================================================================
   Panels
   ================================================================== */
function NetworkPanel({ assets, mode, params, selectedId, onSelect, onClose, filter, setFilter }) {
  const groups = ["all", ...Object.keys(GROUP_META)];
  const shown = assets.filter((a) => filter === "all" || a.group === filter);
  return (
    <Panel title={`Network / asset table · ${shown.length}`} onClose={onClose}
      style={{ position: "absolute", left: 56, top: 8, width: 296, maxHeight: "calc(100% - 16px)" }}>
      <div className="flex" style={{ gap: 4, padding: 8, borderBottom: `1px solid ${T.borderPrimary}`, flexWrap: "wrap" }}>
        {groups.map((g) => (
          <button key={g} onClick={() => setFilter(g)}
            style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: T.r16,
              background: filter === g ? T.n1 : T.white, color: filter === g ? T.white : T.n1100,
              border: `1px solid ${filter === g ? T.n1 : T.borderPrimary}` }}>
            {g === "all" ? "All" : GROUP_META[g].short}
          </button>
        ))}
      </div>
      {shown.map((a) => {
        const st = statusOf(a);
        const proj = mode === "scenario" ? project(a, params) : null;
        const projSt = proj !== null ? levelFor(a, proj) : null;
        const sel = a.id === selectedId;
        return (
          <button key={a.id} onClick={() => onSelect(a.id)} className="w-full text-left flex items-center"
            style={{ gap: 8, padding: "7px 8px", borderBottom: `1px solid ${T.borderPrimary}`,
              background: sel ? "#EEF4FE" : "transparent", borderLeft: `3px solid ${LEVELS[st].fill}` }}>
            <StageBoard asset={a} height={34} width={18} projected={proj} />
            <div className="flex-1 min-w-0">
              <div className="truncate" style={{ fontSize: 12, fontWeight: 500, color: T.n1 }}>{a.name}</div>
              <div className="fiq-mono truncate" style={{ fontSize: 10, color: T.n1000 }}>{a.ref}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="fiq-mono" style={{ fontSize: 12, fontWeight: 600, color: T.n1 }}>
                {fmt(a.level, a.unit)}
              </div>
              {proj !== null ? (
                <div className="fiq-mono" style={{ fontSize: 10, color: LEVELS[projSt].fill, fontWeight: 600 }}>
                  → {fmt(proj, a.unit)}
                </div>
              ) : (
                <div className="fiq-mono" style={{ fontSize: 10, color: T.n1000 }}>{a.unit}</div>
              )}
            </div>
          </button>
        );
      })}
    </Panel>
  );
}

function DetailPanel({ asset, history, mode, params, onRaise, onClose }) {
  if (!asset) return null;
  const st = statusOf(asset);
  const proj = mode === "scenario" ? project(asset, params) : null;
  const projSt = proj !== null ? levelFor(asset, proj) : null;
  const below = GROUP_META[asset.group].ground === "below";
  const rows = asset.invert ? ["alert", "warning", "severe"] : ["alert", "warning", "severe"];
  return (
    <Panel title="Station detail" onClose={onClose}
      style={{ position: "absolute", right: 8, top: 48, width: 300, maxHeight: "calc(100% - 120px)" }}>
      <div style={{ padding: 10 }}>
        <div style={{ fontSize: 10, color: below ? T.ground : T.blue800, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {GROUP_META[asset.group].label} · {GROUP_META[asset.group].ground} ground
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.n1, lineHeight: 1.25, marginTop: 2 }}>{asset.name}</div>
        <div className="fiq-mono" style={{ fontSize: 10, color: T.n1000, marginBottom: 6 }}>{asset.ref}</div>
        <AlertChip status={st}>{LEVELS[st].label}</AlertChip>

        <div className="flex" style={{ gap: 10, marginTop: 10 }}>
          <StageBoard asset={asset} height={136} projected={proj} />
          <div className="flex-1 min-w-0">
            <div className="fiq-mono" style={{ fontSize: 22, fontWeight: 600, color: T.n1, lineHeight: 1 }}>
              {fmt(asset.level, asset.unit)}
              <span style={{ fontSize: 11, color: T.n1000, fontWeight: 400 }}> {asset.unit}</span>
            </div>
            {proj !== null && (
              <div className="fiq-mono" style={{ fontSize: 12, color: LEVELS[projSt].fill, fontWeight: 600, marginTop: 3 }}>
                projected {fmt(proj, asset.unit)} {asset.unit}
              </div>
            )}
            <Spark data={history} color={below ? T.ground : T.waterDeep} height={44} />
            <table style={{ width: "100%", fontSize: 11 }}>
              <tbody>
                {rows.map((k) => (
                  <tr key={k}>
                    <td style={{ padding: "1px 0", color: T.n1100 }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: LEVELS[k].fill, marginRight: 5 }} />
                      {LEVELS[k].label.replace("Flood ", "")}
                    </td>
                    <td className="fiq-mono" style={{ textAlign: "right", color: T.n1 }}>{fmt(asset[k], asset.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ fontSize: 11, color: T.n1100, marginTop: 8, lineHeight: 1.45 }}>{asset.note}</p>

        {(st === "warning" || st === "severe") && (
          <button onClick={() => onRaise(asset)}
            style={{ marginTop: 10, width: "100%", padding: "7px 10px", borderRadius: T.r2, background: T.n1,
              color: T.white, fontSize: 12, fontWeight: 600 }}>
            Raise incident
          </button>
        )}
      </div>
    </Panel>
  );
}

function ScenarioPanel({ params, setParams, assets, onClose }) {
  const S = ({ label, k, min, max, unit, help }) => (
    <label className="block" style={{ marginBottom: 9 }}>
      <div className="flex justify-between items-baseline">
        <span style={{ fontSize: 12, fontWeight: 500, color: T.n1 }}>{label}</span>
        <span className="fiq-mono" style={{ fontSize: 11, color: T.scenario, fontWeight: 600 }}>{params[k]}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={params[k]}
        onChange={(e) => setParams((p) => ({ ...p, [k]: Number(e.target.value) }))}
        className="w-full" style={{ accentColor: T.scenario }} />
      {help && <div style={{ fontSize: 10, color: T.n1000, marginTop: -2 }}>{help}</div>}
    </label>
  );

  const fb = assets.find((a) => a.id === "res-fb");
  const fbProj = project(fb, params);
  const fbSt = levelFor(fb, fbProj);
  const colne = assets.find((a) => a.id === "riv-col");
  const colneProj = project(colne, params);
  const colneSt = levelFor(colne, colneProj);
  const spw = project(assets.find((a) => a.id === "spw-01"), params);
  const pz = assets.find((a) => a.id === "pz-04");
  const pzProj = project(pz, params);
  const pzSt = levelFor(pz, pzProj);

  return (
    <Panel title="Scenario — reservoir operation" onClose={onClose}
      style={{ position: "absolute", right: 8, top: 48, width: 300, maxHeight: "calc(100% - 120px)" }}>
      <div style={{ padding: 10 }}>
        <S label="Storm rainfall" k="rain" min={10} max={160} unit="mm" />
        <S label="Storm duration" k="duration" min={2} max={48} unit="h" />
        <S label="Catchment wetness" k="catchmentWet" min={10} max={100} unit="%" />
        <S label="Starting reservoir fill" k="startFull" min={55} max={100} unit="%" />
        <S label="Pre-emptive drawdown" k="drawdown" min={0} max={100} unit="%"
          help="Buys freeboard — at the cost of Colne flow downstream." />
        <label className="flex items-center" style={{ gap: 7, marginTop: 2, marginBottom: 10 }}>
          <input type="checkbox" checked={params.pondPreRelease}
            onChange={(e) => setParams((p) => ({ ...p, pondPreRelease: e.target.checked }))} />
          <span style={{ fontSize: 12, color: T.n1 }}>Pre-release balancing ponds</span>
        </label>

        <div style={{ height: 1, background: T.borderPrimary, margin: "4px 0 10px" }} />

        <div style={{ fontSize: 11, fontWeight: 600, color: T.n1000, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
          Outcome
        </div>

        {[
          { label: "Crest freeboard", v: `${fbProj.toFixed(2)} m`, st: fbSt, note: fbSt === "severe" ? "Below safe operating margin" : "Margin to embankment crest" },
          { label: "Spillway discharge", v: `${spw.toFixed(1)} m³/s`, st: spw > 18 ? "warning" : spw > 6 ? "alert" : "normal", note: spw > 0.2 ? "Spillway active" : "No overflow" },
          { label: "Colne at Wraysbury", v: `${colneProj.toFixed(2)} m`, st: colneSt, note: "Staines / Wraysbury receptors" },
          { label: "Embankment pore pressure", v: `${Math.round(pzProj)} kPa`, st: pzSt, note: params.drawdown > 45 ? "Rapid drawdown penalty applied" : "Within modelled response" },
        ].map((r) => (
          <div key={r.label} className="flex items-start" style={{ gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.borderPrimary}` }}>
            <span style={{ width: 4, alignSelf: "stretch", background: LEVELS[r.st].fill, borderRadius: 2 }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 12, color: T.n1, fontWeight: 500 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: T.n1000 }}>{r.note}</div>
            </div>
            <span className="fiq-mono" style={{ fontSize: 13, fontWeight: 600, color: LEVELS[r.st].fill }}>{r.v}</span>
          </div>
        ))}

        <div style={{ marginTop: 10, padding: 8, borderRadius: T.r4, background: T.orange100, border: `1px solid ${T.orange500}` }}>
          <div style={{ fontSize: 11, color: T.orange1200, lineHeight: 1.45 }}>
            <strong>The trade-off.</strong> Drawdown protects the embankment and buys freeboard, but every percent
            released raises the Colne through Wraysbury and Staines. Two populations, opposite directions.
          </div>
        </div>

        <div style={{ fontSize: 10, color: T.n1000, marginTop: 8, lineHeight: 1.45 }}>
          Simplified response surface for prototyping. Swap for Flood Modeller / reservoir routing outputs via API.
        </div>
      </div>
    </Panel>
  );
}

function IncidentsPanel({ incidents, setIncidents, assets, selectedIncId, setSelectedIncId, onDraftAlert, onClose }) {
  const open = incidents.filter((i) => i.status !== "closed");
  const inc = incidents.find((i) => i.id === selectedIncId) || open[0];

  const addLog = (id, text) =>
    setIncidents((c) => c.map((i) => (i.id === id ? { ...i, log: [{ t: nowStamp(), text }, ...i.log] } : i)));
  const setStatus = (id, status) => {
    setIncidents((c) => c.map((i) => (i.id === id ? { ...i, status } : i)));
    addLog(id, `Status changed to ${status}`);
  };
  const notifyServices = (id) => {
    setIncidents((c) => c.map((i) => (i.id === id ? { ...i, servicesNotified: true } : i)));
    addLog(id, "Emergency services notified — Surrey FRS + airport fire service acknowledged");
  };

  return (
    <Panel title={`Incidents · ${open.length} open`} onClose={onClose}
      style={{ position: "absolute", left: 360, bottom: 8, width: 380, maxHeight: 330 }}>
      {open.length === 0 && (
        <div style={{ padding: 12, fontSize: 12, color: T.n1000, lineHeight: 1.5 }}>
          No open incidents. Raise one from any station at Flood Warning or above — or run the storm simulation
          and wait for the reservoir to climb.
        </div>
      )}

      {open.length > 0 && (
        <>
          <div className="flex" style={{ gap: 4, padding: 8, borderBottom: `1px solid ${T.borderPrimary}`, overflowX: "auto" }}>
            {open.map((i) => (
              <button key={i.id} onClick={() => setSelectedIncId(i.id)}
                className="shrink-0"
                style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: T.r16,
                  background: inc && inc.id === i.id ? T.n1 : T.white, color: inc && inc.id === i.id ? T.white : T.n1100,
                  border: `1px solid ${inc && inc.id === i.id ? T.n1 : T.borderPrimary}` }}>
                INC-{String(i.id).padStart(3, "0")}
              </button>
            ))}
          </div>

          {inc && (
            <div style={{ padding: 10 }}>
              <div className="flex items-start justify-between" style={{ gap: 8 }}>
                <div className="min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.n1, lineHeight: 1.3 }}>{inc.title}</div>
                  <div className="fiq-mono" style={{ fontSize: 10, color: T.n1000 }}>
                    opened {inc.opened} · {inc.status}{inc.servicesNotified ? " · services ✓" : ""}
                  </div>
                </div>
                <AlertChip status={inc.severity}>{LEVELS[inc.severity].label}</AlertChip>
              </div>

              <div className="flex" style={{ gap: 5, marginTop: 9, flexWrap: "wrap" }}>
                <button onClick={() => !inc.servicesNotified && notifyServices(inc.id)} disabled={inc.servicesNotified}
                  style={{ fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: T.r2,
                    background: inc.servicesNotified ? T.n400 : T.red800, color: inc.servicesNotified ? T.n1000 : T.white }}>
                  {inc.servicesNotified ? "✓ Services notified" : "Alert emergency services"}
                </button>
                <button onClick={() => onDraftAlert(inc)}
                  style={{ fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: T.r2, background: T.n1, color: T.white }}>
                  Draft public alert
                </button>
                {inc.status === "open" && (
                  <button onClick={() => setStatus(inc.id, "monitoring")}
                    style={{ fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: T.r2, background: T.white, color: T.n1, border: `1px solid ${T.borderPrimary}` }}>
                    Monitoring
                  </button>
                )}
                <button onClick={() => setStatus(inc.id, "closed")}
                  style={{ fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: T.r2, background: T.white, color: T.n1, border: `1px solid ${T.borderPrimary}` }}>
                  Close
                </button>
              </div>

              <div style={{ marginTop: 9, paddingTop: 7, borderTop: `1px solid ${T.borderPrimary}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.n1000, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  Action log
                </div>
                {inc.log.slice(0, 6).map((l, i) => (
                  <div key={i} className="flex" style={{ gap: 7, padding: "1.5px 0" }}>
                    <span className="fiq-mono shrink-0" style={{ fontSize: 10, color: T.n1000, minWidth: 34 }}>{l.t}</span>
                    <span style={{ fontSize: 11, color: T.n1, lineHeight: 1.4 }}>{l.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Panel>
  );
}

function FeedsPanel({ feeds, incidents, setIncidents, selectedIncId, onClose }) {
  const [filter, setFilter] = useState("all");
  const shown = feeds.filter((f) => filter === "all" || f.source === filter);
  const inc = incidents.find((i) => i.id === selectedIncId && i.status !== "closed");
  const attach = (f) => {
    if (!inc) return;
    setIncidents((c) => c.map((i) =>
      i.id === inc.id ? { ...i, log: [{ t: nowStamp(), text: `Feed attached — ${f.who}` }, ...i.log] } : i));
  };
  return (
    <Panel title="Feeds · official, ops, media, social" onClose={onClose}
      style={{ position: "absolute", right: 8, bottom: 8, width: 340, maxHeight: 300 }}>
      <div className="flex" style={{ gap: 4, padding: 8, borderBottom: `1px solid ${T.borderPrimary}`, flexWrap: "wrap" }}>
        {["all", ...Object.keys(FEED_META)].map((k) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: T.r16,
              background: filter === k ? T.n1 : T.white, color: filter === k ? T.white : T.n1100,
              border: `1px solid ${filter === k ? T.n1 : T.borderPrimary}` }}>
            {k === "all" ? "All" : FEED_META[k].label}
          </button>
        ))}
      </div>
      {shown.map((f) => (
        <div key={f.id} className="flex items-start" style={{ gap: 8, padding: "7px 8px",
          borderBottom: `1px solid ${T.borderPrimary}`, borderLeft: `3px solid ${FEED_META[f.source].color}` }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline" style={{ gap: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: FEED_META[f.source].color }}>{f.who}</span>
              <span className="fiq-mono" style={{ fontSize: 10, color: T.n1000 }}>{f.when}</span>
            </div>
            <p style={{ fontSize: 11, color: T.n1, lineHeight: 1.45, marginTop: 1 }}>{f.text}</p>
          </div>
          {inc && (
            <button onClick={() => attach(f)} className="shrink-0"
              style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: T.r2,
                border: `1px solid ${T.borderPrimary}`, color: T.n1100 }}>
              Attach
            </button>
          )}
        </div>
      ))}
    </Panel>
  );
}

/* ==================================================================
   Notify drawer — three audiences
   ================================================================== */
function NotifyDrawer({ open, onClose, message, setMessage, assets, audience, setAudience }) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const segments = Math.max(1, Math.ceil(message.length / 153));

  const worst = useMemo(
    () => [...assets].sort((a, b) => LEVEL_ORDER.indexOf(statusOf(b)) - LEVEL_ORDER.indexOf(statusOf(a))),
    [assets]
  );

  const draft = () => {
    const w = worst[0];
    const st = statusOf(w);
    const aud = AUDIENCES.find((a) => a.id === audience);
    if (audience === "ops") {
      setMessage(`HEATHROW OPS — ${LEVELS[st].label.toUpperCase()}. ${w.name} at ${fmt(w.level, w.unit)}${w.unit}. Expect standing water on aprons and possible stand closures. Airside duty manager to brief ground handling. Drainage team to eastern balancing pond.`);
    } else if (audience === "emerg") {
      setMessage(`MULTI-AGENCY — ${LEVELS[st].label.toUpperCase()} declared, Staines Reservoir scheme. ${w.name} at ${fmt(w.level, w.unit)}${w.unit}. Reservoir undertaker on site. Requesting standby at Hythe End and Colnbrook. Off-site plan reference held by Surrey FRS.`);
    } else {
      setMessage(`FLOOD ${st === "severe" ? "DANGER" : "WARNING"} — Staines, Wraysbury and Colnbrook. River levels are rising and flooding of roads and some homes is likely tonight. Do not walk or drive through flood water. Move your car and anything valuable upstairs or to higher ground now. Updates: Floodline 0345 988 1188.`);
    }
  };

  const simplify = async () => {
    setBusy(true);
    try {
      const ctx = worst.slice(0, 5).map((a) => `${a.name} (${a.ref}): ${fmt(a.level, a.unit)}${a.unit}, ${LEVELS[statusOf(a)].label}`).join("; ");
      const aud = AUDIENCES.find((a) => a.id === audience);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You write flood alerts for a UK flood authority operating a reservoir scheme south-south-west of Heathrow Airport. Telemetry: ${ctx}. Audience: ${aud.label} — ${aud.detail}. Draft: "${message}". Rewrite as a single SMS for that audience. For the public, use plain English at reading age 9, calm but urgent, concrete actions, no jargon, and include Floodline 0345 988 1188. For airport operations or emergency services, keep operational precision and name the specific assets. Under 300 characters. Respond with ONLY the SMS text.`,
          }],
        }),
      });
      const data = await res.json();
      const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      if (text) setMessage(text);
    } catch (e) {
      console.error("rewrite failed", e);
    } finally {
      setBusy(false);
    }
  };

  const smsHref = `sms:${phone.replace(/\s+/g, "")}?&body=${encodeURIComponent(message)}`;
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex: 60, background: "rgba(51,51,51,0.4)" }} onClick={onClose}>
      <div className="fiq h-full overflow-y-auto fiq-scroll" style={{ width: "100%", maxWidth: 400, background: T.n400, boxShadow: T.shadowLg }}
        onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between sticky top-0"
          style={{ height: 64, padding: "0 20px", background: T.n400, borderBottom: `1px solid ${T.n600}`, zIndex: 2 }}>
          <div>
            <div style={{ fontSize: 12, color: T.n1000 }}>Public communication</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.n1 }}>Notify</div>
          </div>
          <button onClick={onClose} style={{ fontSize: 12, fontWeight: 600, color: T.n1100, padding: "5px 9px",
            border: `1px solid ${T.n600}`, borderRadius: T.r2, background: T.white }}>Close</button>
        </header>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* audience */}
          <div style={{ background: T.surface1, border: `1px solid ${T.borderPrimary}`, borderRadius: T.r4, padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.n1000, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
              Audience
            </div>
            {AUDIENCES.map((a) => (
              <button key={a.id} onClick={() => setAudience(a.id)} className="w-full text-left flex items-center"
                style={{ gap: 8, padding: "7px 8px", borderRadius: T.r2, marginBottom: 4,
                  background: audience === a.id ? "#EEF4FE" : "transparent",
                  border: `1px solid ${audience === a.id ? T.blue800 : T.borderPrimary}` }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${audience === a.id ? T.blue800 : T.n3}`,
                  background: audience === a.id ? T.blue800 : T.white }} />
                <span className="flex-1 min-w-0">
                  <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.n1 }}>{a.label}</span>
                  <span style={{ display: "block", fontSize: 10, color: T.n1000 }}>{a.detail}</span>
                </span>
                <span className="fiq-mono shrink-0" style={{ fontSize: 10, color: T.n1000 }}>{a.est}</span>
              </button>
            ))}
          </div>

          {/* composer */}
          <div style={{ background: T.surface1, border: `1px solid ${T.borderPrimary}`, borderRadius: T.r4, padding: 10 }}>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6}
              className="w-full fiq"
              style={{ border: `1px solid ${T.borderPrimary}`, borderRadius: T.r2, padding: 8, fontSize: 12,
                color: T.n1, background: T.white, lineHeight: 1.5, resize: "vertical" }}
              placeholder="Draft an alert, or generate one from live telemetry." />
            <div className="fiq-mono" style={{ fontSize: 10, color: segments > 2 ? T.orange600 : T.n1000, marginTop: 4 }}>
              {message.length} chars · {segments} SMS segment{segments > 1 ? "s" : ""}
            </div>
            <div className="flex" style={{ gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <button onClick={draft}
                style={{ fontSize: 12, fontWeight: 600, padding: "6px 10px", borderRadius: T.r2, background: T.n1, color: T.white }}>
                Draft from live status
              </button>
              <button onClick={simplify} disabled={busy || !message}
                style={{ fontSize: 12, fontWeight: 600, padding: "6px 10px", borderRadius: T.r2,
                  background: busy ? T.n400 : T.blue800, color: busy ? T.n1000 : T.white }}>
                {busy ? "Rewriting…" : "Tune for audience with AI"}
              </button>
            </div>
          </div>

          {/* preview */}
          <div style={{ background: T.n1, borderRadius: T.r4, padding: 16, display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 268 }}>
              <div className="fiq-mono" style={{ fontSize: 10, color: T.n1000, textAlign: "center", marginBottom: 8 }}>
                PREVIEW — RECIPIENT'S PHONE
              </div>
              <div style={{ background: "#454545", borderRadius: 16, padding: 10 }}>
                <div className="fiq-mono" style={{ fontSize: 10, color: T.n3, marginBottom: 5 }}>FLOODALERT · now</div>
                <div style={{ background: "#EDEDED", borderRadius: 12, padding: 9, fontSize: 12, color: T.n1, lineHeight: 1.5, minHeight: 40 }}>
                  {message || "Your alert text will appear here."}
                </div>
              </div>
            </div>
          </div>

          {/* send */}
          <div style={{ background: T.surface1, border: `1px solid ${T.borderPrimary}`, borderRadius: T.r4, padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.n1000, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
              Send a real test text
            </div>
            <p style={{ fontSize: 11, color: T.n1100, lineHeight: 1.5, marginBottom: 8 }}>
              Opens your Messages app with the alert pre-filled — works on mobile. Production would broadcast via
              GOV.UK Notify or an SMS gateway, targeted by postcode for the public and by role for ops and responders.
            </p>
            <div className="flex items-center" style={{ gap: 6, flexWrap: "wrap" }}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 7700 900123"
                className="fiq-mono flex-1"
                style={{ minWidth: 150, border: `1px solid ${T.borderPrimary}`, borderRadius: T.r2, padding: 8, fontSize: 12, color: T.n1 }} />
              <a href={message && phone ? smsHref : undefined}
                style={{ fontSize: 12, fontWeight: 600, padding: "9px 14px", borderRadius: T.r2,
                  background: message && phone ? T.red800 : T.n400, color: message && phone ? T.white : T.n1000,
                  pointerEvents: message && phone ? "auto" : "none" }}>
                Text this phone
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   App
   ================================================================== */
export default function FloodIqHeathrow() {
  const [assets, setAssets] = useState(seedAssets);
  const [histories, setHistories] = useState(() =>
    Object.fromEntries(seedAssets.map((a) => [a.id, Array.from({ length: 26 }, () => a.level + (Math.random() - 0.5) * 0.05 * (a.max - a.min))]))
  );
  const [storm, setStorm] = useState(false);
  const [mode, setMode] = useState("live");
  const [params, setParams] = useState({ rain: 70, duration: 14, catchmentWet: 72, startFull: 88, drawdown: 20, pondPreRelease: false });
  const [selectedId, setSelectedId] = useState("res-01");
  const [incidents, setIncidents] = useState([]);
  const [selectedIncId, setSelectedIncId] = useState(null);
  const [panels, setPanels] = useState({ network: true, incidents: true, feeds: true, detail: true });
  const [groupFilter, setGroupFilter] = useState("all");
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("public");
  const [published, setPublished] = useState(stampFull());
  const nextInc = useRef(1);
  const stormRef = useRef(storm);
  stormRef.current = storm;

  /* telemetry tick */
  useEffect(() => {
    const id = setInterval(() => {
      setAssets((cur) => {
        const res = cur.find((a) => a.id === "res-01");
        return cur.map((a) => {
          const range = a.max - a.min;
          const noise = (Math.random() - 0.5) * 0.01 * range;
          let drift;
          if (a.id === "res-fb") {
            // freeboard is derived from reservoir level
            return { ...a, level: clamp(32.6 - res.level, a.min, a.max) };
          }
          if (a.id === "dot-01") {
            drift = 0; // operator-controlled
          } else if (stormRef.current) {
            drift = 0.017 * range * a.resp * (0.55 + Math.random() * 0.85);
          } else {
            drift = (a.level > a.min + range * 0.22 ? -0.007 : 0.001) * range;
          }
          return { ...a, level: clamp(a.level + drift + noise, a.min, a.max) };
        });
      });
      setPublished(stampFull());
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setHistories((h) => {
      const n = { ...h };
      assets.forEach((a) => { n[a.id] = [...(n[a.id] || []).slice(-41), a.level]; });
      return n;
    });
  }, [assets]);

  const togglePanel = (k) => setPanels((p) => ({ ...p, [k]: !p[k] }));

  const raiseIncident = (asset) => {
    const st = statusOf(asset);
    const inc = {
      id: nextInc.current++,
      title: `${asset.name} — ${LEVELS[st].label}`,
      severity: st,
      assetIds: [asset.id],
      status: "open",
      servicesNotified: false,
      opened: nowStamp(),
      log: [{ t: nowStamp(), text: `Raised from telemetry: ${asset.ref} at ${fmt(asset.level, asset.unit)}${asset.unit}` }],
    };
    setIncidents((c) => [inc, ...c]);
    setSelectedIncId(inc.id);
    setPanels((p) => ({ ...p, incidents: true }));
  };

  const draftFromIncident = (inc) => {
    const names = assets.filter((a) => inc.assetIds.includes(a.id)).map((a) => a.name).join(", ");
    setMessage(`FLOOD ${inc.severity === "severe" ? "DANGER" : "WARNING"} — Staines, Wraysbury and Colnbrook. ${names} has reached ${LEVELS[inc.severity].label}. Flooding of roads and some homes is likely. Do not walk or drive through flood water. Move your car and valuables to higher ground now. Updates: Floodline 0345 988 1188.`);
    setNotifyOpen(true);
  };

  const selected = assets.find((a) => a.id === selectedId);

  const jumpToWorst = (level) => {
    const hit = assets.find((a) => statusOf(a) === level);
    if (hit) { setSelectedId(hit.id); setPanels((p) => ({ ...p, detail: true })); }
  };

  return (
    <div className="fiq flex" style={{ height: "100vh", background: T.surface1, color: T.n1 }}>
      <style>{FONT_CSS}</style>

      <IconRail mode={mode} setMode={setMode} panels={panels} togglePanel={togglePanel} />

      <div className="flex flex-col flex-1 min-w-0">
        <TopNav assets={assets} published={published} onChipClick={jumpToWorst} mode={mode} />

        <div className="relative flex-1 min-h-0" style={{ overflow: "hidden" }}>
          <HeathrowMap assets={assets} mode={mode} params={params}
            selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setPanels((p) => ({ ...p, detail: true })); }}
            showScheme />

          <MapTools />
          <MapScale />
          <Legend />

          {/* storm sim + notify — floating action cluster */}
          <div className="absolute flex" style={{ left: "50%", transform: "translateX(-50%)", top: 8, gap: 6 }}>
            <button onClick={() => setStorm(!storm)}
              style={{ fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: T.r2,
                background: storm ? T.red800 : T.surface1, color: storm ? T.white : T.n1,
                border: `1px solid ${storm ? T.red800 : T.borderPrimary}`, boxShadow: T.shadow }}>
              {storm ? "■ Stop storm sim" : "▶ Simulate storm"}
            </button>
            <button onClick={() => setNotifyOpen(true)}
              style={{ fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: T.r2,
                background: T.blue800, color: T.white, boxShadow: T.shadow, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d={ICONS.notify} size={14} /> Notify
            </button>
          </div>

          {panels.network && (
            <NetworkPanel assets={assets} mode={mode} params={params} selectedId={selectedId}
              onSelect={(id) => { setSelectedId(id); setPanels((p) => ({ ...p, detail: true })); }}
              onClose={() => togglePanel("network")} filter={groupFilter} setFilter={setGroupFilter} />
          )}

          {mode === "scenario" ? (
            <ScenarioPanel params={params} setParams={setParams} assets={assets} onClose={() => setMode("live")} />
          ) : (
            panels.detail && selected && (
              <DetailPanel asset={selected} history={histories[selectedId] || []} mode={mode} params={params}
                onRaise={raiseIncident} onClose={() => togglePanel("detail")} />
            )
          )}

          {panels.incidents && (
            <IncidentsPanel incidents={incidents} setIncidents={setIncidents} assets={assets}
              selectedIncId={selectedIncId} setSelectedIncId={setSelectedIncId}
              onDraftAlert={draftFromIncident} onClose={() => togglePanel("incidents")} />
          )}

          {panels.feeds && (
            <FeedsPanel feeds={seedFeeds} incidents={incidents} setIncidents={setIncidents}
              selectedIncId={selectedIncId} onClose={() => togglePanel("feeds")} />
          )}
        </div>
      </div>

      <NotifyDrawer open={notifyOpen} onClose={() => setNotifyOpen(false)}
        message={message} setMessage={setMessage} assets={assets}
        audience={audience} setAudience={setAudience} />
    </div>
  );
}
