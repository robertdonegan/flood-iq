/* ==================================================================
   Environment Agency flood warnings — real-time flood-monitoring API.

   https://environment.data.gov.uk/flood-monitoring/doc/reference
   Open Government Licence, no key, and the service sends
   Access-Control-Allow-Origin: * so the browser can call it directly.

   Two endpoints are used:
     /id/floods      — warnings currently in force, nationally
     /id/floodAreas  — the warning/alert areas themselves, always present
                       whether or not anything is in force

   England is dry more often than not, so /id/floods is frequently empty.
   When it is, we fall back to a demonstration set pinned to *real* EA area
   codes around the scheme, flagged `source: "demo"` so the UI can say so.
   Nothing here invents an area, a name or a boundary.
   ================================================================== */

const BASE = "https://environment.data.gov.uk/flood-monitoring";

/* EA severity taxonomy. 4 is "no longer in force" and is dropped. */
export const EA_SEVERITY = {
  1: { key: "severe", label: "Severe Flood Warning", rank: 3 },
  2: { key: "warning", label: "Flood Warning", rank: 2 },
  3: { key: "alert", label: "Flood Alert", rank: 1 },
};

/* Real EA areas covering the Colne, Colne Brook, Thames and Ash around the
   scheme. Codes, labels and centroids are as published by the EA. Only the
   severity assignment is ours, and only when nothing is live. */
const DEMO_AREAS = [
  { code: "062FWF28WDrayton", severity: 1, lat: 51.46957, long: -0.50246, label: "River Colne and Frays River at West Drayton and Stanwell Moor" },
  { code: "062FWF28Colnbrk", severity: 2, lat: 51.45854, long: -0.54525, label: "Colne Brook at Colnbrook" },
  { code: "061FWF23Wraysbry", severity: 2, lat: 51.45612, long: -0.55905, label: "River Thames at Wraysbury" },
  { code: "062WAF28LowColne", severity: 3, lat: 51.52882, long: -0.49476, label: "Lower River Colne and Frays River" },
  { code: "061WAF23Datchet", severity: 3, lat: 51.4396, long: -0.5347, label: "River Thames from Datchet to Shepperton Green" },
  { code: "062WAF31AshMidd", severity: 3, lat: 51.41714, long: -0.45743, label: "River Ash in the Borough of Spelthorne" },
  { code: "062FWF31Ashford", severity: 3, lat: 51.41534, long: -0.46789, label: "River Ash at Ashford and Staines" },
];

const DEMO_MESSAGE =
  "Demonstration severities on real Environment Agency flood areas. No EA warnings are in force nationally right now, so nothing live could be shown.";

const within = (item, centre, distKm) => {
  if (item.lat == null || item.long == null) return false;
  const dLat = (item.lat - centre[0]) * 111.32;
  const dLon = (item.long - centre[1]) * 111.32 * Math.cos((centre[0] * Math.PI) / 180);
  return Math.hypot(dLat, dLon) <= distKm;
};

const normalise = (flood) => {
  const area = flood.floodArea || {};
  return {
    id: flood.floodAreaID || area.notation,
    code: flood.floodAreaID || area.notation,
    severity: flood.severityLevel,
    tier: EA_SEVERITY[flood.severityLevel]?.key,
    label: EA_SEVERITY[flood.severityLevel]?.label,
    area: flood.description || area.description || area.label,
    river: area.riverOrSea,
    message: flood.message,
    raised: flood.timeRaised,
    changed: flood.timeSeverityChanged,
    lat: area.lat,
    long: area.long,
    polygon: area.polygon,
  };
};

/**
 * Warnings in force near a point, or a flagged demonstration set when the
 * country is quiet. Never throws — the map degrades to no layer.
 */
export async function fetchEaFloods({ centre, distKm = 25, signal } = {}) {
  try {
    const res = await fetch(`${BASE}/id/floods`, { signal });
    if (!res.ok) throw new Error(`floods ${res.status}`);
    const { items = [] } = await res.json();

    const live = items
      .filter((f) => EA_SEVERITY[f.severityLevel])
      .map(normalise)
      .filter((f) => within(f, centre, distKm))
      .sort((a, b) => EA_SEVERITY[b.severity].rank - EA_SEVERITY[a.severity].rank);

    if (live.length) return { source: "live", nationalCount: items.length, items: live };

    return {
      source: "demo",
      nationalCount: items.length,
      note: DEMO_MESSAGE,
      items: DEMO_AREAS.map((a) => ({
        id: a.code,
        code: a.code,
        severity: a.severity,
        tier: EA_SEVERITY[a.severity].key,
        label: EA_SEVERITY[a.severity].label,
        area: a.label,
        lat: a.lat,
        long: a.long,
        polygon: `${BASE}/id/floodAreas/${a.code}/polygon`,
        demo: true,
      })),
    };
  } catch (err) {
    if (err.name === "AbortError") return null;
    console.error("EA flood fetch failed", err);
    return { source: "error", items: [], note: String(err.message || err) };
  }
}

/** GeoJSON boundary for one flood area. Cached — these are static. */
const polygonCache = new Map();

export async function fetchEaPolygon(url, signal) {
  if (!url) return null;
  if (polygonCache.has(url)) return polygonCache.get(url);
  try {
    /* The API advertises http:// in its own payloads; force https so the
       request isn't blocked as mixed content. */
    const res = await fetch(url.replace(/^http:/, "https:"), { signal });
    if (!res.ok) throw new Error(`polygon ${res.status}`);
    const geo = await res.json();
    polygonCache.set(url, geo);
    return geo;
  } catch (err) {
    if (err.name !== "AbortError") console.error("EA polygon fetch failed", err);
    return null;
  }
}

/** GeoJSON is [long, lat]; Leaflet wants [lat, long]. */
export function geoJsonToLatLngs(geo) {
  if (!geo?.features?.length) return [];
  const rings = [];
  for (const f of geo.features) {
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === "MultiPolygon" ? g.coordinates : g.type === "Polygon" ? [g.coordinates] : [];
    for (const poly of polys) {
      for (const ring of poly) rings.push(ring.map(([lng, lat]) => [lat, lng]));
    }
  }
  return rings;
}
