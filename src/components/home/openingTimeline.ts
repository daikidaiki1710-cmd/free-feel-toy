/**
 * Shared timing table for the SCENE 01–10 opening, driven entirely by the
 * 10 approved master images (public/home/opening/scene-01.jpg .. scene-09.jpg,
 * plus the real HOME underneath as SCENE 10). Claude Code's only job here is
 * placement/timing of these finished assets — never redrawing them.
 *
 * Each scene layer runs TWO independent CSS animations at once: an opacity
 * envelope (fade in → hold → fade out) and a completely separate transform
 * (scale) animation that runs continuously across the layer's *entire*
 * visible lifetime — not just at the crossfade edges. That split is what
 * makes this read as one camera pushing through each image's own space
 * rather than a slideshow of static frames dissolving into each other.
 */
import type { CSSProperties } from "react";

export const SCENE_COUNT = 9;

type SceneSpec = {
  scene: number;
  /** fade-in length, ms (0 for SCENE 01, already visible from the gate) */
  inDur: number;
  /** fully-opaque hold before fading out, ms (SCENE 08's "settle", SCENE 09's lit hold + exit) */
  holdDur: number;
  /** fade-out length, ms (0 for SCENE 09, which holds until the overlay itself dissolves) */
  outDur: number;
  scaleStart: number;
  scaleEnd: number;
  /** brief blur pulse (04→05 acceleration only), as a fraction [0,1] of this layer's own duration */
  blurAt?: number;
};

// 01 slow → 02 slow → 03 slow → 04 building → 05 accelerating → 06 short sharp
// breakthrough → 07 pushing toward the base → 08 settle → 09 lit → 10 real HOME.
// Durations match the approved timing pass (tap→10 ≈ 9s).
const SCENE_SPECS: SceneSpec[] = [
  { scene: 1, inDur: 0, holdDur: 0, outDur: 1000, scaleStart: 1.0, scaleEnd: 1.05 },
  { scene: 2, inDur: 1000, holdDur: 0, outDur: 1000, scaleStart: 0.95, scaleEnd: 1.08 },
  { scene: 3, inDur: 1000, holdDur: 0, outDur: 900, scaleStart: 0.95, scaleEnd: 1.08 },
  { scene: 4, inDur: 900, holdDur: 0, outDur: 800, scaleStart: 0.93, scaleEnd: 1.12, blurAt: 0.82 },
  { scene: 5, inDur: 800, holdDur: 0, outDur: 500, scaleStart: 0.9, scaleEnd: 1.17, blurAt: 0.28 },
  { scene: 6, inDur: 500, holdDur: 0, outDur: 800, scaleStart: 0.85, scaleEnd: 1.15 },
  { scene: 7, inDur: 800, holdDur: 0, outDur: 1000, scaleStart: 0.92, scaleEnd: 1.12 },
  { scene: 8, inDur: 1000, holdDur: 700, outDur: 400, scaleStart: 0.94, scaleEnd: 1.05 },
  // SCENE 09: 400ms crossfade in (still dim) + 1100ms lit hold (3 clicks) + a
  // further hold through the exit dissolve — scale keeps drifting the whole
  // way so the base visibly *becomes* HOME instead of cutting to it.
  { scene: 9, inDur: 400, holdDur: 2000, outDur: 0, scaleStart: 1.0, scaleEnd: 1.08 },
];

/** Cumulative delay (ms from tap) at which each scene's own animation begins. delay[0] unused. */
export const SCENE_DELAY: number[] = (() => {
  const delays = [0];
  let cursor = 0;
  for (const spec of SCENE_SPECS) {
    delays.push(cursor);
    cursor += spec.inDur + spec.holdDur;
  }
  return delays;
})();

/** Wall-clock instant (ms from tap) at which each scene reaches full opacity. index 0 unused. */
export const SCENE_FULL_AT: number[] = [0, ...SCENE_SPECS.map((s) => SCENE_DELAY[s.scene] + s.inDur)];

/** SCENE 09's three "カチッ" lamp clicks land inside this window, ms from tap. */
const SCENE9 = SCENE_SPECS[8];
export const LIGHTING_START = SCENE_DELAY[9] + SCENE9.inDur; // clicks begin once SCENE 09 is fully in
export const LIGHTING_DURATION = SCENE9.holdDur - 900; // reserve the tail of the hold for the settled/exit portion
export const LIGHTING_END = LIGHTING_START + LIGHTING_DURATION;

/** Silent settle on the fully-lit base before the SCENE 09→10 dissolve begins. */
export const ARRIVAL_HOLD = 100;
export const LEAVE_AT = LIGHTING_END + ARRIVAL_HOLD;

function opacityKeyframeName(scene: number) {
  return `ffl-op-${scene}`;
}
function transformKeyframeName(scene: number) {
  return `ffl-xf-${scene}`;
}

/** Builds the full <style> block of @keyframes for every scene layer — computed once, shared by PC and mobile. */
export function buildSceneKeyframes(): string {
  return SCENE_SPECS.map((spec) => {
    const total = spec.inDur + spec.holdDur + spec.outDur;
    const inPct = (spec.inDur / total) * 100;
    const holdEndPct = ((spec.inDur + spec.holdDur) / total) * 100;

    let opacityRule: string;
    if (spec.scene === 1) {
      opacityRule = `@keyframes ${opacityKeyframeName(1)} { 0% { opacity: 1; } 100% { opacity: 0; } }`;
    } else if (spec.scene === SCENE_COUNT) {
      opacityRule = `@keyframes ${opacityKeyframeName(spec.scene)} { 0% { opacity: 0; } ${inPct.toFixed(2)}% { opacity: 1; } 100% { opacity: 1; } }`;
    } else if (spec.holdDur > 0) {
      opacityRule = `@keyframes ${opacityKeyframeName(spec.scene)} { 0% { opacity: 0; } ${inPct.toFixed(2)}% { opacity: 1; } ${holdEndPct.toFixed(2)}% { opacity: 1; } 100% { opacity: 0; } }`;
    } else {
      opacityRule = `@keyframes ${opacityKeyframeName(spec.scene)} { 0% { opacity: 0; } ${inPct.toFixed(2)}% { opacity: 1; } 100% { opacity: 0; } }`;
    }

    // Transform runs smoothly and continuously across the layer's *entire*
    // life — this is the actual "camera moving through the image" motion,
    // independent of when it's fading in/out. A single brief blur pulse
    // (04→05 only) rides along the same timeline.
    const blurStop =
      spec.blurAt != null
        ? ` ${(spec.blurAt * 100).toFixed(2)}% { transform: scale(${(spec.scaleStart + (spec.scaleEnd - spec.scaleStart) * spec.blurAt).toFixed(3)}); filter: blur(3px); }`
        : "";
    const transformRule = `@keyframes ${transformKeyframeName(spec.scene)} { 0% { transform: scale(${spec.scaleStart}); filter: blur(0px); }${blurStop} 100% { transform: scale(${spec.scaleEnd}); filter: blur(0px); } }`;

    return `${opacityRule}\n${transformRule}`;
  }).join("\n");
}

export function sceneAnimationStyle(scene: number, playing: boolean): CSSProperties {
  if (!playing) return { opacity: scene === 1 ? 1 : 0 };
  const spec = SCENE_SPECS[scene - 1];
  const total = spec.inDur + spec.holdDur + spec.outDur;
  return {
    animationName: `${opacityKeyframeName(scene)}, ${transformKeyframeName(scene)}`,
    animationDuration: `${total}ms`,
    animationDelay: `${SCENE_DELAY[scene]}ms`,
    animationTimingFunction: "ease-in-out",
    animationFillMode: "both",
  };
}

/**
 * SCENE 06 breakthrough — the *only* full-frame flash in the whole sequence.
 * Everything else (05→06 excepted) is pure crossfade + scale, never a
 * brightness pop, per the explicit "no flashing except SCENE 06" direction.
 */
export function flashAnimationStyle(playing: boolean): CSSProperties {
  const spec = SCENE_SPECS[5]; // scene 6
  const delay = SCENE_DELAY[6];
  const duration = Math.round(spec.inDur * 0.9);
  if (!playing) return { opacity: 0 };
  return {
    animationName: "ffl-scene-flash",
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
  };
}

export const FLASH_KEYFRAMES = `@keyframes ffl-scene-flash { 0% { opacity: 0; } 45% { opacity: 0.3; } 100% { opacity: 0; } }`;

/**
 * SCENE 09 → 10: darkness level behind the three lamp-bloom accents, so the
 * base reads as "dim → click → partly lit → click → more lit → click → fully
 * lit" instead of arriving already bright. Index 0 = before the first click.
 */
export const LIGHTING_SCRIM_BY_COUNT = [0.7, 0.44, 0.2, 0.03];
