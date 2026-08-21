/* ==================================================================
   Geography for the Newry map view.

   PLACEHOLDER — coordinates are approximate, hand-placed against the
   real relative geography of Newry city centre (the Newry River /
   Newry Canal corridor between Sugar Island and Merchants Quay), modelled
   on the real Newry Flood Alleviation Scheme delivered by DfI Rivers.
   Swap SCHEME and ASSET_COORDS for survey-grade GIS data once available.
   ================================================================== */

/* Default view. Frames Newry city centre on the Newry River, with the
   Newry Canal running south toward Victoria Lock / Carlingford Lough. */
export const NEWRY_VIEW = {
  center: [54.1751, -6.3402],
  zoom: 14,
  minZoom: 10,
  maxZoom: 18,
};

/* Town-centre framing, for the "zoom to town centre" affordance. */
export const TOWN_VIEW = {
  center: [54.1751, -6.3402],
  zoom: 15,
};

export const BASEMAPS = {
  osm: {
    label: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "©OpenStreetMap",
    maxZoom: 19,
  },
  imagery: {
    label: "Aerial imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "©Esri, Maxar, Earthstar Geographics",
    maxZoom: 18,
  },
};

/* Scheme boundary (dashed orange in the Figma) and the flood-wall/canal
   corridor it encloses. Traces the real Newry Flood Alleviation Scheme
   footprint through Sugar Island and Merchants Quay. */
export const SCHEME = {
  name: "Newry Flood Alleviation Scheme",
  boundary: [
    [54.1802, -6.3465],
    [54.1798, -6.3358],
    [54.1738, -6.3320],
    [54.1698, -6.3352],
    [54.1706, -6.3448],
    [54.1758, -6.3488],
  ],
  water: [
    [54.1792, -6.3440],
    [54.1790, -6.3372],
    [54.1742, -6.3340],
    [54.1710, -6.3368],
    [54.1716, -6.3432],
    [54.1760, -6.3462],
  ],
};

/* id → [lat, lon]. Keys match seedAssets in flood-iq-newry.jsx. */
export const ASSET_COORDS = {
  "res-01": [54.1712, -6.3428], // Victoria Lock, top pound level
  "res-fb": [54.1738, -6.3408], // flood wall crest, Merchants Quay
  "spw-01": [54.1748, -6.3358], // sluice / flow control, east bank
  "dot-01": [54.1706, -6.3452], // sluice gate, Sugar Island side
  "pz-04": [54.1690, -6.3462], // SW flood wall piezometer array
  "seep-1": [54.1682, -6.3418], // toe drain seepage, south wall
  "riv-col": [54.1708, -6.3430], // Newry River at Victoria Lock (tidal gauge)
  "riv-lon": [54.1928, -6.3468], // Camlough River confluence, north of town
  "drn-e": [54.1802, -6.3212], // eastern balancing pond, Edward Street catchment
  "drn-n": [54.1938, -6.3372], // northern balancing pond, Newry Canal towpath
  "gw-st": [54.1618, -6.3452], // Bessbrook Road gravels BH-11
  "met-01": [54.1755, -6.3382], // town centre rain gauge, central area
  "met-02": [54.1738, -6.3300], // Sugar Island rain gauge
  "met-03": [54.1610, -6.3378], // Bessbrook rain gauge
  "met-04": [54.1502, -6.3410], // Camlough gauge
  "met-05": [54.1808, -6.3520], // Newtownhamilton road gauge
  "met-06": [54.1720, -6.3350], // Merchants Quay flood-wall gauge
  "riv-ct": [54.1745, -6.3395], // Newry River at Newry Bus Station (real gauge)
  "riv-cb": [54.1880, -6.3492], // Camlough River at Bessbrook confluence
  "riv-tw": [54.1300, -6.2500], // Newry River tidal reach at Carlingford Lough
  "drn-w": [54.1808, -6.3562], // western balancing pond
  "drn-s": [54.1610, -6.3520], // southern detention basin
  "drn-rw": [54.1720, -6.3390], // Merchants Quay culvert catchpit
  "gw-sm": [54.1520, -6.3480], // Camlough BH-07
  "gw-lh": [54.1868, -6.3438], // Bessbrook Road BH-03
  "str-bw": [54.1580, -6.3690], // upland spring feeding the Newry
};

export const latlngFor = (asset) => ASSET_COORDS[asset.id] || NEWRY_VIEW.center;

/* ==================================================================
   "Detail level" overlays — for the Regional / Level 1 / Level 2 / Level 3
   view switcher requested for the sales presentation. Geometry below is
   original (redrawn from place names and descriptions in the DfI report),
   not traced from the report's own copyrighted figures.
   ================================================================== */

/* Regional view — a wide, zoomed-out framing of the wider South East /
   Newry, Mourne & Down area, for the "amber blob 3 days out" forecast ask. */
export const REGIONAL_VIEW = {
  center: [54.1751, -6.3402],
  zoom: 11,
};

/* Regional forecast "blob" — an amber advisory zone over the Newry area,
   loosely modelled on the catchment extent in the report's Figure 2-5
   (defences + pumping stations spread along the river corridor). Purely
   illustrative — not an official DfI Rivers/Met Office forecast product. */
export const REGIONAL_FORECAST = {
  severity: "amber",
  horizon: "3 days out",
  label: "Elevated river levels possible",
  center: [54.1751, -6.3402],
  radiusM: 6000,
};

/* NI Rivers-style catchment outline for the Regional view — the wider
   Newry River catchment draining Camlough, Bessbrook and the surrounding
   uplands down to Carlingford Lough. Approximate/illustrative boundary,
   not the surveyed DfI Rivers catchment polygon. */
export const NEWRY_CATCHMENT = {
  name: "Newry River catchment",
  boundary: [
    [54.2050, -6.3700],
    [54.1980, -6.3100],
    [54.1850, -6.2850],
    [54.1600, -6.2700],
    [54.1350, -6.2950],
    [54.1250, -6.3350],
    [54.1400, -6.3750],
    [54.1650, -6.4050],
    [54.1900, -6.4000],
  ],
};

/* Level 2 — approximate flood-extent polygons for the town centre, redrawn
   (not traced) from the real streets named as flooded/at-risk in the DfI
   review (Sugar Island, New Street, Canal Quay, Sugar House Quay,
   Merchants Quay, Basin Walk) and the flood-bank overtopping location
   (Table 3-13, incident FD164). Two tiers: what was actually observed
   flooded in Oct 2023, and the wider modelled 1% AEP (1-in-100-year)
   fluvial extent from the same report. */
export const FLOOD_EXTENT = {
  observed: [
    [54.1772, -6.3448],
    [54.1768, -6.3392],
    [54.1744, -6.3368],
    [54.1720, -6.3388],
    [54.1718, -6.3432],
    [54.1744, -6.3452],
  ],
  modelled: [
    [54.1792, -6.3468],
    [54.1786, -6.3352],
    [54.1748, -6.3312],
    [54.1700, -6.3348],
    [54.1696, -6.3448],
    [54.1738, -6.3480],
  ],
};

/* Level 3 — street-level risk, using the real streets named in the DfI
   review's executive summary and defence-performance tables. Coordinates
   are approximate placements for demo purposes, not surveyed addresses. */
export const STREET_RISK = [
  { name: "Sugar Island", risk: "high", lat: 54.1742, lng: -6.3398, note: "Worst-affected street in the Oct 2023 event; adjacent to the flood-bank overtopping (FD164)." },
  { name: "New Street", risk: "high", lat: 54.1748, lng: -6.3412, note: "Flooded Oct 2023 as river levels exceeded the flood bank to the north of the city." },
  { name: "Canal Quay", risk: "high", lat: 54.1730, lng: -6.3420, note: "Flooded Oct 2023 — low-lying, adjacent to the Newry Canal." },
  { name: "Sugar House Quay", risk: "high", lat: 54.1736, lng: -6.3404, note: "Flooded Oct 2023, riverside frontage." },
  { name: "Merchants Quay", risk: "high", lat: 54.1744, lng: -6.3388, note: "Flooded Oct 2023; flood-wall gauge sited here for early warning." },
  { name: "Basin Walk", risk: "medium", lat: 54.1726, lng: -6.3438, note: "Flooded Oct 2023, canal-adjacent." },
  { name: "Bridge Street", risk: "medium", lat: 54.1752, lng: -6.3378, note: "At risk near the Town Hall — site of the FD1161 wall collapse just downstream." },
  { name: "Monaghan Street", risk: "low", lat: 54.1718, lng: -6.3406, note: "Near-miss in Oct 2023 — levels approached but did not flood the street." },
  { name: "Ballinacraig Way", risk: "medium", lat: 54.1804, lng: -6.3286, note: "Flooded Oct 2023 in the wider NMD area (surface water / watercourse)." },
  { name: "Fathom Line", risk: "medium", lat: 54.1568, lng: -6.3312, note: "Newry Canal overtopped onto a residential property, Oct 2023." },
];

