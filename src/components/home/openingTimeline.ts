/**
 * Timing constants for the SCENE opening. Built from 4 approved master
 * images (public/home/opening/scene-02.jpg, scene-03.jpg, scene-08.jpg,
 * scene-09.jpg) plus the real HOME underneath — driven by a single
 * requestAnimationFrame loop in OpeningSequence.tsx so every layer shares
 * ONE continuous camera-scale timeline (scale never resets at a handoff).
 *
 * The whole point of this pass: 動く → 溜める → 見せる → また動く. Segments
 * alternate between genuine holds (near-zero scale change, nothing new
 * happening) and pushes (fast scale growth) — a single smooth easing across
 * the whole duration would erase that rhythm, so scale is defined as
 * piecewise segments between explicit checkpoints instead.
 */

export function smoothstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

// SCENE A — 起動: the light reacts, energy builds. 1700ms, mostly still.
export const A_END = 1700;
// SCENE B — リング形成: gradual reveal from the center outward. 2100ms.
export const B_END = A_END + 2100; // 3800
// SCENE C — リング突破: a held beat, then a hard burst through the center.
export const C_HOLD_END = B_END + 500; // 4300 — the "溜め" before the burst
export const C_END = C_HOLD_END + 1300; // 5600
// SCENE D — トンネル: a held "discovery" beat, then a deliberate push forward.
export const D_HOLD_END = C_END + 900; // 6500 — "秘密基地を発見する" beat
export const D_END = D_HOLD_END + 1700; // 8200
// SCENE E — 基地到着・照明: an exposure-dip crossfade (not a plain fade),
// scene-08 and scene-09 kept visually distinct roles — 08 is the distant
// discovery, 09 is the close arrival — then 5 staged lamp reveals.
export const E_CROSSFADE_END = D_END + 600; // 8800
export const STAGE_BOUNDS = [E_CROSSFADE_END, 9450, 10050, 10650, 11250, 11950] as const;
export const STAGE_SCRIM = [0.88, 0.62, 0.44, 0.28, 0.12, 0.0] as const;
export const STAGE_TRANSITION_MS = 450;
export const STAGE_PUNCH_MS = 180;
// SCENE F — 余韻 → HOME: hold the finished base, then dissolve into real HOME.
export const F_HOLD_END = STAGE_BOUNDS[5] + 1300; // 13250
export const TOTAL_DURATION = F_HOLD_END + 1300; // 14550

/** [t, scale] checkpoints — piecewise-eased between consecutive pairs, so velocity can vary segment to segment while the value itself never jumps. */
export const SCALE_CHECKPOINTS: [number, number][] = [
  [0, 1.0],
  [A_END, 1.02],
  [B_END, 1.1],
  [C_HOLD_END, 1.11],
  [C_END, 1.35],
  [D_HOLD_END, 1.37],
  [D_END, 1.55],
  [E_CROSSFADE_END, 1.58],
  [STAGE_BOUNDS[1], 1.586],
  [STAGE_BOUNDS[2], 1.592],
  [STAGE_BOUNDS[3], 1.598],
  [STAGE_BOUNDS[4], 1.604],
  [STAGE_BOUNDS[5], 1.61],
  [F_HOLD_END, 1.615],
  [TOTAL_DURATION, 1.68],
];

export function scaleAt(t: number): number {
  for (let i = 0; i < SCALE_CHECKPOINTS.length - 1; i++) {
    const [t0, s0] = SCALE_CHECKPOINTS[i];
    const [t1, s1] = SCALE_CHECKPOINTS[i + 1];
    if (t <= t1) {
      const u = t1 > t0 ? smoothstep((t - t0) / (t1 - t0)) : 1;
      return s0 + (s1 - s0) * u;
    }
  }
  return SCALE_CHECKPOINTS[SCALE_CHECKPOINTS.length - 1][1];
}

/**
 * The 5 staged lamp positions — 中央奥 → 左 → 右 → 天井・周辺 → 部屋全体,
 * percentage coordinates on scene-09.jpg. Sized to read as a local lamp
 * glow, not a screen-wide wash — the room's own scrim (not these blooms)
 * is what actually reveals the space; these are accents.
 */
export const LIGHTING_STAGES = [
  { left: 50, top: 28, size: 13 },
  { left: 14, top: 46, size: 11 },
  { left: 86, top: 46, size: 11 },
  { left: 50, top: 16, size: 22 },
  { left: 50, top: 50, size: 9 },
] as const;
