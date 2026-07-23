# Flood IQ — Heathrow view: design inventory

Source: [Flood IQ Opportunities, node 2001:13170](https://www.figma.com/design/K1jHQ2zUuTxHCtWZdxMHHr/Flood-IQ-Opportunities?node-id=2001-13170)
Prototype: `flood-iq-heathrow.jsx`

Three buckets: what the Figma already defines, what the Figma explicitly
marks as undesigned, and what the prototype invented with no design behind it.

---

## 1. Tokens — extracted, confirmed against Figma variables

These came back from `get_variable_defs` and match the `T` object in the
prototype. No gaps.

| Token | Value | Used for |
| --- | --- | --- |
| `neutral/neutral-400` | `#F3F3F3` | nav surfaces |
| `neutral/neutral-600` | `#E5E5E5` | nav borders, active nav item |
| `neutral/neutral-1000` | `#999999` | label text |
| `neutral/neutral-1100` | `#666666` | secondary text |
| `color/brand/neutral/n1` · `text/text-primary` | `#333333` | primary text, marker border |
| `core/neutral/n3-neutral` | `#C8C8C8` | scale track, scrollbar |
| `surface/surface-1` | `#FFFFFF` | panels, cards |
| `border/border-primary` | `#E6E6E6` | card borders |
| `blue/blue-800` | `#3B6DE6` | primary action, active mode |
| `core/blue/p2-blue` | `#0A7DFF` | calc point — normal |
| `core/blue/p1-blue` | `#231EDC` | calc point — selected fill |
| `blue/blue-1100` | `#10288C` | — (unused in prototype) |
| `orange/orange-100` | `#FFECD8` | alert chip bg |
| `orange/orange-500` | `#FF9735` | alert chip border, Flood Alert |
| `orange/orange-600` | `#FE7E00` | Flood Warning |
| `orange/orange-1200` · `core/orange/p4-orange` | `#922700` | alert chip text |
| `core/orange/p1-orange` | `#FF6100` | selected marker border, scheme boundary |
| `core/orange/p3-orange` | `#FFCA8F` | selected marker bg |
| `red/red-800` | `#CC334F` | Severe Flood Warning |
| `core/red/p2-red` | `#FF465F` | — (unused) |
| `core/red/p4-red` | `#690A28` | — (unused) |
| `Brand/Primary/Yellows/P2-Yellow` | `#FFB41E` | **annotation stubs only — not UI** |
| `spacing/spacing-xxs · xs · s` | `2 · 4 · 8` | gaps, padding |
| `font/family/system` | IBM Plex Sans | all text |
| `font/size/xs` | `12` | body, chips, markers |
| `font/weight/Regular · Semi Bold` | 400 · 600 | — |
| `Elevation/Active` | `0 1px 2px #0000001A, 0 2px 4px #0000001A` | panels, markers, tools |

**Note:** the map-scheme colours in the prototype's `T` (`ground`, `water`,
`waterDeep`, `land`, `tarmac`, `scenario`) are **not** Figma variables. They
were invented for the hand-drawn schematic. `scenario: #5B4A8A` is doing real
work (projected-value fill) and needs a real token — see §4.

---

## 2. Components the Figma already defines

Buildable against as-is. Assets exported to `src/assets/figma/`.

| Component | Node | Notes |
| --- | --- | --- |
| `FIQSideNavigation` | 2097:4518 | 64px, state `collapsed v3.2`. Jacobs Flood IQ mark, home item, `FIQModeGroup` (5 modes), separators, `FloodAvatar`, edge grip |
| `FIQTopNavigation` | 2114:4647 | 64px. "Last published" + `FloodBreadcrumb`, "Forecast" slot, alert chip group |
| `FloodAlert` chip | 2114:4643–5 | Amber: `orange-100` bg / `orange-500` border / `orange-1200` text. Red: `red-800` bg / white text, no border |
| `FIQAlertAmberPulse` / `FIQAlertRedPulse` | 2114:4575 / 2114:4588 | 12px pulse dot |
| `FloodAlertGroupExample` | 2114:4642 | Chip row with `+N` overflow count |
| `FloodCalculationPoint` | 2098:4393 / 4397 | Default: white bg, 2px `n1` border, r8, inner pill r20. Selected: `p3-orange` bg, `p1-orange` border, `p1-blue` inner |
| `fm-v8.0-tools` | 2032:4533 | 40px palette: cursor-select, rectangle-select, measure, point-query. Last two carry a corner "has options" dot |
| `FM-v8-Move-tools` | 2032:4456 | 32px round: north-star, zoom, pan |
| `FloodMapScale` | 2101:4340 | 173px track, 0 / mid / max labels, ©OpenStreetMap |
| `FPBasemapIcon` | 2101:4339 | 32px basemap thumbnail + go-to-map icon |
| `FloodAvatar` + `FloodCoin` | 2001:6279 | 24px, optional coin badge |
| `FloodBreadcrumb` | 4418:124402 | Text breadcrumb |
| EA warning triangles | 2060:5268–71 | Severe / Warning / Alert, raster @4x |
| Scheme boundary vector | 2111:4932 | Catchment outline |

### Assets saved and wired in

32 files in `src/assets/figma/` — icons as SVG, EA triangles and avatar as PNG.
Figma asset URLs expire after ~7 days, so these are the committed copies.

`src/ui/FigIcon.jsx` is the registry. The exports are bare glyph paths rather
than padded 16×16 tiles, so each icon carries the inset it had inside its Figma
frame. They render through a CSS mask rather than `<img>` so the glyph inherits
`currentColor` and works on both light and dark chrome.

> The mask URL must be **quoted** — `url("…")`. Vite inlines these SVGs as data
> URIs containing single quotes, and an unquoted `url()` token rejects them
> silently, leaving a solid filled box.

Still unused: `scheme-boundary.svg` (the map draws the boundary as a Leaflet
polygon on real coordinates) and `cursor-select-lg.svg` (a canvas cursor
artifact). The inline `ICONS` set survives only for glyphs Figma has no
equivalent for — see §4.

---

## 3. Outstanding — flagged in the Figma itself

Yellow `#FFB41E` "Requirements" stubs — placeholders the concept deliberately
left undesigned. Each now has a **prototype proposal to react to**, but none has
a Figma design behind it. **This is still your design list.**

| Stub | Node | Prototype proposal | Still needed |
| --- | --- | --- | --- |
| **Legend** | 2032:4238 | Bottom-left card floating over the map, resting above the dock. Status swatches plus projected-change and scheme-boundary keys | Sizing, collapse behaviour, whether it should be a layer control instead |
| **Network / Asset table** | 2032:4217 | Full-width bottom dock, per the Figma's reserved 1376×200 rect (2026:4421). Columns: station, ref, group, status, reading, the three thresholds, trend. Incidents share the dock as a second tab. Collapses to a 36px tab strip | Column set and order, sort, grouping, density, empty and overflow states |
| **Feedback / AI chat / Social** | 2036:4835 | Absorbed into the **Comms** drawer — a right-hand drawer opened from the top-right nav, tabbed Feed / Notify | Whether feedback and AI chat belong in the same drawer as outbound notify, or want their own surface |
| **Forecast** | 2114:4654 | Top nav now carries a real forecast line (headline + window) instead of "To be designed", and the concept opens mid-event so the alert badges have content on load | The actual control — time selector, horizon, ensemble/run picker |

---

## 4. Outstanding — prototype invented, no Figma design

The prototype is well ahead of the concept here. All of this is currently
**unvalidated design** that you may want to formalise in Figma, or discard.

| Prototype element | Where | Status |
| --- | --- | --- |
| `Panel` shell | header + close + scroll body | No Figma equivalent. Every floating panel uses it |
| `DetailPanel` (Station detail) | right side | Threshold list, current value, note. No design |
| `StageBoard` gauge | in DetailPanel | Vertical threshold gauge. Comment in code says "carried forward from Spate, re-tokened. Nothing in Flood IQ does this job" — **explicitly an orphan** |
| `Spark` sparkline | in DetailPanel | Recharts line. No design, no token for its stroke |
| `IncidentsPanel` + incident lifecycle | bottom centre | Raise / triage / draft alert. No design |
| Comms drawer — Feed tab | right drawer | Five source types (official / airport ops / media / social / sensor) with filter chips. Source colours `#0F7C6B`, `#6B4E9E`, `#B4654A` are **invented, not tokens** |
| Comms drawer — Notify tab | right drawer | Three audiences, message composer, character budget. No design. This is a high-consequence surface — public flood messaging — and it has no design review behind it |
| Unread count on the Comms button | top nav | Currently just the seeded feed length. No read/unread model exists |
| `ScenarioPanel` | replaces detail in scenario mode | Six storm parameters (rain, duration, catchment wetness, start full, drawdown, pond pre-release). No design |
| Group filter chips | in NetworkPanel | RES / STR / EMB / RIV / DRN / GW / MET taxonomy. No design |
| Live vs Scenario mode | icon rail | Figma has `FIQModeGroup` with 5 modes but no semantics. Prototype uses 2 |
| Projected-value colour | `#5B4A8A` | Invented. Needs a real token |

---

## 5. Layout — resolved and outstanding

Resolved in favour of the concept:

1. **Network table is a dock**, not a floating panel — full width, below the map.
2. **Map is full-bleed again.** Feeds moved into the Comms drawer, incidents
   into the dock. Only the tool palettes, legend and station detail sit over it.
3. **Scale bar is visible.** Nothing occupies bottom-right at rest any more.
4. **Left nav expands in flow** (64 → 216px), so the map and its tool palette
   are pushed across rather than overlaid.

Still open:

- **Station detail** is the one panel still floating over the map, top-right.
  The concept has no right-hand panels at all. Options: move it into the dock as
  a third tab, make it a drawer, or accept the overlay.
- **Top nav content.** Figma: last-published, forecast, alert chips. Prototype
  also carries Mode and the Comms button. At narrow widths the published stamp
  truncates first, which is a guess at priority, not a designed rule.

---

## 6. Open questions

- **Scheme identity.** The prototype calls it "Staines Reservoir scheme" and
  its own comment marks the name a placeholder. `src/map/geo.js` now traces
  the King George VI / Staines reservoir group SSW of the airport. Confirm the
  real scheme and I'll correct the geometry.
- **Basemap.** The concept renders aerial imagery but attributes
  ©OpenStreetMap. You asked for OpenStreetMap, so OSM is the default and
  imagery is on the basemap toggle. Confirm which is canonical.
- **Mode count.** `FIQModeGroup` has 5 modes. The rail now spends them on Live,
  Scenario, Network, Incidents and Comms — a guess. The five Figma glyphs were
  assigned in file order, so **the icon-to-function mapping needs your call**.
- **EA triangles.** Resolved — now data-driven from the live EA API, one per
  warning area. See §8.
- **Opening state.** The concept now opens mid-event: 1 severe, 4 warning,
  4 alert, 3 normal, driven by a forecast of 45–60mm over 17h. Confirm that's
  the right story to open on, and whether the badge copy (`tier · station`)
  is what an operator wants to scan.

---

## 7. What changed in the map

`HeathrowMap` was a hand-drawn SVG schematic. It is now a Leaflet map on real
geography, framed on the Heathrow terminal area as in the concept.

- `src/map/geo.js` — view config, basemaps, scheme polygons, Longford River,
  and real WGS84 coordinates for all 12 assets (they previously carried SVG
  x/y against the schematic).
- Markers render as `FloodCalculationPoint` via Leaflet `divIcon`
  (`calcPointHtml` mirrors `<CalcPoint>` — keep the two in step).
- `FloodMapScale` now reads live map scale instead of fixed "0 / 2.5km / 5km".
- Move tools are wired: reset view, zoom in, zoom to terminals. Leaflet has no
  rotation, so north-star resets rather than reorients — a divergence from the
  concept's north control.
- Basemap toggle switches OSM ↔ aerial imagery.
- The original SVG is retained as `HeathrowMapSchematic`, out of the tree, as
  the reference for what the OSM layers replaced.

**Default view** is zoom 13 centred on the airport, which keeps all 12 assets
on screen. The concept's tighter framing (airport filling ~55% of width) is
zoom 14 — available on the third move-tool button. Tighter framing pushes the
reservoir scheme assets off screen, which is why it isn't the default.

---

## 8. EA national flood warnings — live data

`src/map/eaFloods.js` pulls from the Environment Agency's real-time
flood-monitoring API. Open Government Licence, **no API key**, and the service
sends `Access-Control-Allow-Origin: *`, so the browser calls it directly — no
proxy, no server.

| Endpoint | Use |
| --- | --- |
| `/id/floods` | Warnings currently in force, nationally |
| `/id/floodAreas?lat&long&dist` | The warning/alert areas themselves — always present |
| `/id/floodAreas/{code}/polygon` | GeoJSON boundary for one area (WGS84, MultiPolygon) |

Severity maps straight onto the taxonomy already in the prototype:
`1` Severe Flood Warning → `2` Flood Warning → `3` Flood Alert. Level `4`
("no longer in force") is dropped.

Rendered as the EA's own triangles — the Figma raster exports — at each area
centroid, above the scheme's own telemetry. Clicking one fetches and draws that
area's real boundary and opens a detail card with the EA's area name, code,
rivers and message. The layer toggles from the legend.

### The honest bit about the demo data

England has **no flood warnings in force** at the time of writing, so
`/id/floods` returns an empty list and there is genuinely nothing live to draw.
Rather than show an empty map, the module falls back to a demonstration set of
seven warnings pinned to **real EA flood areas** around the scheme — the Colne
and Frays at West Drayton and Stanwell Moor, Colne Brook at Colnbrook, the
Thames at Wraysbury, the Ash at Ashford and Staines, and others.

Codes, names and boundaries are the EA's own and are fetched live. **Only the
severity assignment is ours**, and only when nothing is in force. The fallback
is flagged `source: "demo"` and the UI says so in two places — a note in the
legend and a banner in the warning card. When real warnings appear, they take
over automatically and the demo notice disappears.

## 9. Station markers are dots

`FloodCalculationPoint` numeric pills are replaced by status dots, per the
Flood Predictor reference. Colour carries the reading; the legend carries the
scale. The value moved to the marker tooltip, the station detail panel and the
dock table, where there's room for units and thresholds.

The legend is now the scale, with a live count per tier for the scheme's own
telemetry and a second block for EA warnings in force.

`CalcPoint` still exists and is still the Figma component — it just isn't the
map marker any more. **Open question:** the Figma designed
`FloodCalculationPoint` specifically as a map marker with a value in it. Dots
are a deliberate departure from that. If the numbers should come back at high
zoom, that's a behaviour worth designing rather than guessing.
