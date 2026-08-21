/* ==================================================================
   Northern Ireland flood warnings — demonstration data only.

   Unlike England's Environment Agency, DfI Rivers (the NI river-flooding
   authority, formerly Rivers Agency) does not publish an open,
   no-key, CORS-enabled "warnings in force" API equivalent to the EA's
   flood-monitoring service. See https://www.infrastructure-ni.gov.uk
   for the real river-levels/flood-warning pages.

   Until a real integration point is confirmed, this module always
   returns a flagged demonstration set modelled on real Newry-area
   watercourses (Newry River, Camlough River, Newry Canal). Nothing
   here is a live feed — treat every item as `source: "demo"`.
   ================================================================== */

/* Same severity taxonomy the EA uses (1 = severe … 3 = alert), so the UI
   can share styling/logic across both flood-warning sources. */
export const NI_SEVERITY = {
  1: { key: "severe", label: "Severe Flood Warning", rank: 3 },
  2: { key: "warning", label: "Flood Warning", rank: 2 },
  3: { key: "alert", label: "Flood Alert", rank: 1 },
};

/* Demonstration areas around Newry. Names and watercourses are real;
   only the severities and message copy are fabricated for the demo. */
const DEMO_AREAS = [
  { code: "NI-NRV-01", severity: 1, lat: 54.1751, long: -6.3402, label: "Newry River through Newry city centre" },
  { code: "NI-CAM-02", severity: 2, lat: 54.1880, long: -6.3492, label: "Camlough River at Bessbrook confluence" },
  { code: "NI-CAN-03", severity: 2, lat: 54.1660, long: -6.3402, label: "Newry Canal, Sugar Island to Victoria Lock" },
  { code: "NI-NRV-04", severity: 3, lat: 54.1602, long: -6.3688, label: "Upper Newry River near Camlough Road" },
  { code: "NI-NRT-05", severity: 3, lat: 54.1300, long: -6.2500, label: "Newry River tidal reach at Carlingford Lough" },
  { code: "NI-CAM-06", severity: 3, lat: 54.1502, long: -6.3410, label: "Camlough River near Camlough village" },
];

const DEMO_MESSAGE =
  "Demonstration severities on real Newry-area watercourses. No live DfI Rivers flood-warning API is integrated yet, so nothing live could be shown.";

/**
 * Warnings near a point. Always returns the flagged demonstration set —
 * there is no live feed wired up. Kept async/shaped like fetchEaFloods so
 * the two can be swapped behind one interface later. Never throws.
 */
export async function fetchNiFloods({ centre } = {}) {
  return {
    source: "demo",
    nationalCount: DEMO_AREAS.length,
    note: DEMO_MESSAGE,
    items: DEMO_AREAS.map((a) => ({
      id: a.code,
      code: a.code,
      severity: a.severity,
      tier: NI_SEVERITY[a.severity].key,
      label: NI_SEVERITY[a.severity].label,
      area: a.label,
      lat: a.lat,
      long: a.long,
      demo: true,
    })),
  };
}
