/* ==================================================================
   Figma icon set — exported from Flood IQ Opportunities
   (K1jHQ2zUuTxHCtWZdxMHHr) and committed to src/assets/figma.

   Each export is the bare glyph path, not a padded 16×16 tile, so every
   icon carries the inset it had inside its Figma frame. Rendering is
   mask-based rather than <img> so the glyph inherits currentColor and
   can sit on dark and light chrome alike.
   ================================================================== */
import cursorSelect from "../assets/figma/tool-cursor-select.svg";
import rectangleSelect from "../assets/figma/tool-rectangle-select.svg";
import measure from "../assets/figma/tool-measure.svg";
import pointQuery from "../assets/figma/tool-point-query.svg";
import zoom from "../assets/figma/tool-zoom.svg";
import northStar from "../assets/figma/tool-north-star.svg";
import pan from "../assets/figma/tool-pan.svg";
import goToMap from "../assets/figma/icon-go-to-map.svg";
import home from "../assets/figma/nav-home.svg";
import ellipsisVert from "../assets/figma/nav-ellipsis-vert.svg";
import grip from "../assets/figma/nav-grip.svg";
import mode1 from "../assets/figma/mode-1-active.svg";
import mode2 from "../assets/figma/mode-2.svg";
import mode3 from "../assets/figma/mode-3.svg";
import mode4 from "../assets/figma/mode-4.svg";
import mode5 from "../assets/figma/mode-5.svg";

/* Raster and multi-colour assets — rendered as <img>, not masked. */
import eaAlert from "../assets/figma/ea-flood-alert.png";
import eaWarning from "../assets/figma/ea-flood-warning.png";
import eaSevere from "../assets/figma/ea-severe-flood-warning.png";
import basemapThumb from "../assets/figma/basemap-thumb.png";
import avatarRichard from "../assets/figma/avatar-richard.png";
import floodCoin from "../assets/figma/flood-coin.svg";
import logoFloodIqFull from "../assets/figma/logo-floodiq-full.svg";
import pulseAmberOuter from "../assets/figma/pulse-amber-outer.svg";
import pulseAmberInner from "../assets/figma/pulse-amber-inner.svg";
import pulseRedOuter from "../assets/figma/pulse-red-outer.svg";
import pulseRedInner from "../assets/figma/pulse-red-inner.svg";
import badgeDot from "../assets/figma/tool-badge-dot.svg";
import schemeBoundary from "../assets/figma/scheme-boundary.svg";

/* inset is the Figma frame inset, as `top right bottom left`. */
export const FIG = {
  cursorSelect: { src: cursorSelect, inset: "15.6% 16.76% 7.25% 14.68%" },
  rectangleSelect: { src: rectangleSelect, inset: "7.81%" },
  measure: { src: measure, inset: "4.69%" },
  pointQuery: { src: pointQuery, inset: "6.25% 12.5% 0% 12.5%" },
  zoom: { src: zoom, inset: "12.5% 14.06% 14.06% 12.5%" },
  northStar: { src: northStar, inset: "11.31% 16.68% 12.05% 16.68%" },
  pan: { src: pan, inset: "4.69%" },
  goToMap: { src: goToMap, inset: "14.06%" },
  home: { src: home, inset: "14.06%" },
  ellipsisVert: { src: ellipsisVert, inset: "12.5% 40.63%" },
  grip: { src: grip, inset: "16.67% 29.17%" },
  mode1: { src: mode1, inset: "-0.52% 3.66% -0.52% 2.78%" },
  mode2: { src: mode2, inset: "7.81% 1.56% 4.69% 1.56%" },
  mode3: { src: mode3, inset: "3.64% 3.65% 3.65% 3.64%" },
  mode4: { src: mode4, inset: "2.61% 2.6% 2.6% 2.61%" },
  mode5: { src: mode5, inset: "1.56%" },
  badgeDot: { src: badgeDot, inset: "0%" },
  schemeBoundary: { src: schemeBoundary, inset: "0%" },
};

export const IMG = {
  eaAlert, eaWarning, eaSevere, basemapThumb, avatarRichard, floodCoin,
  logoFloodIqFull, badgeDot, schemeBoundary,
  pulseAmberOuter, pulseAmberInner, pulseRedOuter, pulseRedInner,
};

/* EA taxonomy → the Environment Agency triangle for that tier. */
export const EA_MARK = {
  alert: eaAlert,
  warning: eaWarning,
  severe: eaSevere,
};

export function FigIcon({ name, size = 16, title }) {
  const icon = FIG[name];
  if (!icon) return null;
  return (
    <span role={title ? "img" : "presentation"} aria-label={title} aria-hidden={title ? undefined : true}
      style={{ position: "relative", display: "inline-block", width: size, height: size, flexShrink: 0 }}>
      <span
        style={{
          position: "absolute", inset: icon.inset, backgroundColor: "currentColor",
          /* Quoted: Vite inlines these as data URIs containing single
             quotes, which an unquoted url() token would reject. */
          WebkitMaskImage: `url("${icon.src}")`, maskImage: `url("${icon.src}")`,
          WebkitMaskSize: "100% 100%", maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
        }}
      />
    </span>
  );
}

/* The Jacobs Flood IQ mark — full logo with wordmark. */
export function FloodIqMark({ size = 24, expanded = false }) {
  if (expanded) {
    return (
      <img src={logoFloodIqFull} alt="Flood IQ" style={{ height: size, width: "auto", flexShrink: 0 }} />
    );
  }
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size, flexShrink: 0, overflow: "hidden" }}>
      <img src={logoFloodIqFull} alt="Flood IQ" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
    </span>
  );
}

/* FloodAvatar + FloodCoin badge. */
export function FloodAvatar({ size = 24, coin = true }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size, flexShrink: 0 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: 40, overflow: "hidden", border: "1px solid #E5E5E5" }}>
        <img src={avatarRichard} alt="" style={{ position: "absolute", width: "397.49%", height: "264.36%", left: "-158.67%", top: "-30.58%", maxWidth: "none" }} />
      </span>
      {coin && (
        <img src={floodCoin} alt="" style={{ position: "absolute", right: -1, bottom: size - 7, width: 8, height: 8 }} />
      )}
    </span>
  );
}

/* FIQAlertPulse — the two-part pulsing dot used on FloodAlert chips. */
export function AlertPulse({ tone = "amber", size = 12 }) {
  const outer = tone === "red" ? pulseRedOuter : pulseAmberOuter;
  const inner = tone === "red" ? pulseRedInner : pulseAmberInner;
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size, flexShrink: 0 }}>
      <img src={outer} alt="" className="fiq-pulse" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <img src={inner} alt="" style={{ position: "absolute", inset: "25%", width: "50%", height: "50%" }} />
    </span>
  );
}
