/* ==================================================================
   Geography for the Heathrow map view.

   The prototype's assets originally carried SVG x/y coordinates against
   a hand-drawn schematic. They now carry real WGS84 positions so they
   can sit on an OpenStreetMap basemap.

   PLACEHOLDER — the scheme is modelled on the King George VI / Staines
   reservoir group SSW of the airport, matching the "Staines Reservoir
   scheme" placeholder in the prototype. Swap SCHEME and ASSET_COORDS
   for the real scheme reference once confirmed.
   ================================================================== */

/* Default view. Frames the airport with the reservoir scheme in the
   lower-left, which is the framing used in the Figma concept
   (node 2001:13170). */
export const HEATHROW_VIEW = {
  center: [51.4700, -0.4545],
  zoom: 14,
  minZoom: 10,
  maxZoom: 18,
};

/* Terminal-area framing, for the "zoom to terminals" affordance. */
export const TERMINAL_VIEW = {
  center: [51.4706, -0.4545],
  zoom: 14,
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

/* Scheme boundary (dashed orange in the Figma) and the reservoir body
   it encloses. Coordinates trace the King George VI / Staines pair. */
export const SCHEME = {
  name: "Staines Reservoir scheme",
  boundary: [
    [51.4498, -0.5075],
    [51.4498, -0.4818],
    [51.4438, -0.4788],
    [51.4318, -0.4838],
    [51.4306, -0.4988],
    [51.4372, -0.5090],
  ],
  water: [
    [51.4486, -0.5040],
    [51.4486, -0.4840],
    [51.4432, -0.4818],
    [51.4332, -0.4862],
    [51.4322, -0.4972],
    [51.4380, -0.5062],
  ],
};

/* Longford River — artificial channel taken off the Colne at Longford,
   running east across the south of the airfield. */
export const LONGFORD_RIVER = [
  [51.4838, -0.4958],
  [51.4795, -0.4880],
  [51.4720, -0.4790],
  [51.4640, -0.4700],
  [51.4585, -0.4560],
  [51.4560, -0.4380],
  [51.4540, -0.4180],
];

/* id → [lat, lon]. Keys match seedAssets in flood-iq-heathrow.jsx. */
export const ASSET_COORDS = {
  "res-01": [51.4402, -0.4952], // reservoir body, centre
  "res-fb": [51.4462, -0.4930], // crest, north embankment
  "spw-01": [51.4398, -0.4842], // spillway, east side to the Colne
  "dot-01": [51.4408, -0.5038], // draw-off tower, west side
  "pz-04": [51.4344, -0.5008], // SW embankment piezometer array
  "seep-1": [51.4324, -0.4930], // south toe drain
  "riv-col": [51.4562, -0.5178], // Colne at Wraysbury
  "riv-lon": [51.4838, -0.4958], // Longford River offtake
  "drn-e": [51.4688, -0.4405], // eastern balancing pond, T2/T3 aprons
  "drn-n": [51.4805, -0.4590], // northern balancing pond
  "gw-st": [51.4562, -0.4718], // Stanwell gravels BH-11
  "met-01": [51.4716, -0.4528], // airfield rain gauge, central area
  "met-02": [51.4690, -0.4435], // T2 Terminal rain gauge
  "met-03": [51.4735, -0.4660], // T5 Terminal rain gauge
  "met-04": [51.4510, -0.4880], // Stanwell Moor gauge
  "met-05": [51.4620, -0.5030], // Colnbrook gauge
  "met-06": [51.4710, -0.4580], // Runway 09L rain gauge
  "riv-ct": [51.4590, -0.5120], // Colne at Staines Bridge
  "riv-cb": [51.4640, -0.4990], // Colne Brook at Brands Hill
  "riv-tw": [51.4650, -0.5280], // Thames at Datchet
  "drn-w": [51.4740, -0.4700], // Western balancing pond
  "drn-s": [51.4570, -0.4770], // Southern detention basin
  "drn-rw": [51.4685, -0.4550], // Runway 09L/27R catchpit
  "gw-sm": [51.4530, -0.4830], // Stanwell Moor BH-07
  "gw-lh": [51.4610, -0.4970], // Longford House BH-03
  "str-bw": [51.4630, -0.5100], // Bourne Chalk spring
};

export const latlngFor = (asset) => ASSET_COORDS[asset.id] || HEATHROW_VIEW.center;
