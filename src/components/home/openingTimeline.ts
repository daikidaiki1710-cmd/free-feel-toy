/**
 * Timing constants for the SCENE opening, now built from just 4 approved
 * master images (public/home/opening/scene-02.jpg, scene-03.jpg,
 * scene-08.jpg, scene-09.jpg) plus the real HOME underneath. The actual
 * animation is driven imperatively by a single requestAnimationFrame loop
 * in OpeningSequence.tsx — one continuous global camera timeline shared by
 * every layer, so scale never resets at an image handoff. This module only
 * holds the boundary numbers that loop reads.
 */

/** ms from tap to the real HOME being fully revealed. */
export const TOTAL_DURATION = 5000;

/** SCENE B — light expands, ring spreads, image1 (scene-02) → image2 (scene-03). */
export const B_END = 1100;
/** SCENE C — burst through the ring's center into image3 (scene-08), via a growing mask hole, not a plain crossfade. */
export const C_END = 1900;
/** SCENE D — uninterrupted forward push through image3, only blending into image4 (scene-09) in its final stretch. */
export const D_FADE_START = 3150;
export const D_END = 3700;
/** SCENE E — a short settle, then the whole overlay dissolves into the real HOME beneath. */
export const E_DISSOLVE_START = 3900;
export const E_END = TOTAL_DURATION;

/** Total scale growth (1.0 → 1 + SCALE_RANGE) across the entire tap→HOME timeline — one shared curve, never reset per image. */
export const SCALE_RANGE = 0.55;

export function easeInOutCubic(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}
