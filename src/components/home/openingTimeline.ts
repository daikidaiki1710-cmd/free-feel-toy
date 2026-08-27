/**
 * Shared timing table for the SCENE 01–10 opening, driven entirely by the
 * 10 approved master images (public/home/opening/scene-01.jpg .. scene-09.jpg,
 * plus the real HOME underneath as SCENE 10). Claude Code's only job here is
 * placement/timing of these finished assets — never redrawing them.
 */
import type { CSSProperties } from "react";

/** ms between each pair of scenes, i.e. d(1→2), d(2→3), ... d(8→9). */
export const SCENE_TRANSITIONS = [600, 700, 700, 600, 500, 600, 600, 500] as const;

export const SCENE_COUNT = 9;

/** Cumulative start time (ms) at which scene N reaches full opacity, index 0 unused so SCENE_START[n] = t(n). */
export const SCENE_START: number[] = (() => {
  const start = [0, 0];
  for (let i = 0; i < SCENE_TRANSITIONS.length; i++) {
    start.push(start[start.length - 1] + SCENE_TRANSITIONS[i]);
  }
  return start;
})();

/** Total ms from the tap to the last image (SCENE 09) reaching full opacity. */
export const SEQUENCE_DURATION = SCENE_START[SCENE_COUNT];

/** SCENE 09's staged lamp-brightening window, ms. */
export const LIGHTING_DURATION = 1500;
/** Silent hold on the fully-lit base (SCENE 09 → 10's "余韻") before handing off to real HOME. */
export const ARRIVAL_HOLD = 500;

export type SceneLayer = {
  scene: number;
  /** animation-delay, ms */
  delay: number;
  /** animation-duration, ms */
  duration: number;
  /** % into the layer's own animation at which it reaches full opacity/scale(1) */
  inFraction: number;
  /** whether this layer briefly blurs during its fade-out (the 04→05 acceleration only) */
  blurOut?: boolean;
  /** whether this layer briefly blurs during its fade-in (the 04→05 acceleration only) */
  blurIn?: boolean;
};

/** Precomputed crossfade schedule for scenes 1–9 — one continuous forward camera move, never a hold-then-cut. */
export const SCENE_LAYERS: SceneLayer[] = Array.from({ length: SCENE_COUNT }, (_, i) => {
  const n = i + 1;
  if (n === 1) {
    // Already fully visible from the "gate" — this layer only fades OUT, into SCENE 02.
    return { scene: n, delay: 0, duration: SCENE_TRANSITIONS[0], inFraction: 0 };
  }
  if (n === SCENE_COUNT) {
    // Fades IN and then holds (SCENE 09's lighting + arrival play on top of it; no fade-out here).
    const delay = SCENE_START[n - 1];
    const duration = SCENE_TRANSITIONS[n - 2];
    return { scene: n, delay, duration, inFraction: 100 };
  }
  const delay = SCENE_START[n - 1];
  const duration = SCENE_START[n + 1] - SCENE_START[n - 1];
  const inFraction = (SCENE_TRANSITIONS[n - 2] / duration) * 100;
  const blurOut = n === 4; // brief blur as SCENE 04 gives way to SCENE 05 — the acceleration beat
  const blurIn = n === 5;
  return { scene: n, delay, duration, inFraction, blurOut, blurIn };
});

function keyframeName(scene: number) {
  return `ffl-scene-${scene}`;
}

/** Builds the full <style> block of @keyframes for every scene layer — computed once, shared by PC and mobile. */
export function buildSceneKeyframes(): string {
  return SCENE_LAYERS.map((layer) => {
    const name = keyframeName(layer.scene);
    if (layer.scene === 1) {
      // SCENE 01 and 02 share baked-in "ここから、はじまる。" text at nearly
      // the same spot — a plain symmetric crossfade keeps both readable at
      // once for most of the 600ms. Dropping SCENE 01 out fast (down to ~20%
      // within the first third) shrinks that double-exposure window without
      // touching the master images or the 01→02 "ripple begins" continuity.
      return `@keyframes ${name} { 0% { opacity: 1; transform: scale(1); } 28% { opacity: 0.2; transform: scale(1.02); } 100% { opacity: 0; transform: scale(1.08); } }`;
    }
    if (layer.scene === 2) {
      const inPct = layer.inFraction;
      const holdPct = (inPct * 0.62).toFixed(2);
      // Mirrors SCENE 01's fast drop: SCENE 02 stays low through most of its
      // own fade-in, then rises quickly right at the handoff instant — so
      // the two texts are never both at mid-high opacity at the same time.
      return `@keyframes ${name} { 0% { opacity: 0; transform: scale(0.92); } ${holdPct}% { opacity: 0.12; transform: scale(0.955); } ${inPct.toFixed(2)}% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.08); } }`;
    }
    if (layer.scene === SCENE_COUNT) {
      return `@keyframes ${name} { 0% { opacity: 0; transform: scale(0.92); } 100% { opacity: 1; transform: scale(1); } }`;
    }
    const inPct = layer.inFraction;
    const blurStop = layer.blurOut
      ? ` ${Math.min(97, inPct + (100 - inPct) * 0.55).toFixed(2)}% { opacity: ${1}; transform: scale(${(1 + (1.08 - 1) * 0.6).toFixed(3)}); filter: blur(3px); }`
      : layer.blurIn
        ? ` ${Math.max(3, inPct * 0.55).toFixed(2)}% { opacity: ${(0 + 1 * 0.6).toFixed(2)}; transform: scale(${(0.92 + (1 - 0.92) * 0.6).toFixed(3)}); filter: blur(3px); }`
        : "";
    return `@keyframes ${name} { 0% { opacity: 0; transform: scale(0.92); filter: blur(0px); } ${inPct.toFixed(2)}% { opacity: 1; transform: scale(1); filter: blur(0px); }${blurStop} 100% { opacity: 0; transform: scale(1.08); filter: blur(0px); } }`;
  }).join("\n");
}

export function sceneAnimationStyle(layer: SceneLayer, playing: boolean): CSSProperties {
  if (!playing) return { opacity: layer.scene === 1 ? 1 : 0 };
  return {
    animationName: keyframeName(layer.scene),
    animationDuration: `${layer.duration}ms`,
    animationDelay: `${layer.delay}ms`,
    animationTimingFunction: "ease-in-out",
    animationFillMode: "both",
  };
}

/** SCENE 06 breakthrough — a brief, minimal white pulse layered over the image's own baked-in flash. Never a long white screen. */
export function flashAnimationStyle(playing: boolean): CSSProperties {
  const delay = SCENE_START[5];
  const duration = Math.round(SCENE_TRANSITIONS[4] * 0.9);
  if (!playing) return { opacity: 0 };
  return {
    animationName: "ffl-scene-flash",
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
  };
}

export const FLASH_KEYFRAMES = `@keyframes ffl-scene-flash { 0% { opacity: 0; } 40% { opacity: 0.22; } 100% { opacity: 0; } }`;

/**
 * SCENE 09 → 10: darkness level behind the three lamp-bloom accents, so the
 * base reads as "dim → click → partly lit → click → more lit → click → fully
 * lit" instead of arriving already bright. Index 0 = before the first click.
 */
export const LIGHTING_SCRIM_BY_COUNT = [0.7, 0.44, 0.2, 0.03];

/**
 * SCENE 09 → 10 handoff: a brief warm light-wash, screen-blended over
 * everything, timed to the exit fade. A flat opacity crossfade between two
 * dark/moody images (the lit base and real HOME) dims further at the
 * midpoint by simple alpha math; this wash sells "the space fills with
 * light and becomes HOME" instead, without touching HomeFinal itself.
 */
export function arrivalWashAnimationStyle(exitDurationMs: number): CSSProperties {
  return {
    animationName: "ffl-arrival-wash",
    animationDuration: `${exitDurationMs}ms`,
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
  };
}

export const ARRIVAL_WASH_KEYFRAMES = `@keyframes ffl-arrival-wash { 0% { opacity: 0; } 48% { opacity: 0.4; } 100% { opacity: 0; } }`;
