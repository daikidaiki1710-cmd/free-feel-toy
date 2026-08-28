/**
 * Timing constants for the simplified 3-part opening: scene-07.jpg (遠景 —
 * the base seen at the far end of the tunnel), scene-09.jpg (近景 — arrived,
 * lit stage by stage), then the real HOME underneath. One continuous
 * requestAnimationFrame loop in OpeningSequence.tsx drives every layer, so
 * scale never resets at the 遠景→近景 handoff.
 */

export function smoothstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

// ① 遠景 — camera pushes through the tunnel toward the base, with real accel/decel (not a flat zoom).
export const DISTANT_END = 2600;
// ① → ② blend — position/scale matched so it reads as the same camera continuing forward, not a new picture.
export const BLEND_END = DISTANT_END + 600; // 3200
// ② 近景 + 照明 — camera nearly stops; 5 staged lamp reveals (中央 → 左 → 右 → 天井・周辺 → 部屋全体).
export const STAGE_BOUNDS = [BLEND_END, 3800, 4400, 5000, 5600, 6200] as const;
export const STAGE_SCRIM = [0.85, 0.6, 0.42, 0.26, 0.1, 0.0] as const;
export const STAGE_TRANSITION_MS = 450;
export const STAGE_PUNCH_MS = 180;
// 余韻 — hold the finished, fully-lit base before connecting to HOME.
export const HOLD_END = STAGE_BOUNDS[5] + 1500; // 7700
// ③ HOME接続 — a further slow push while the whole overlay dissolves into real HOME.
export const TOTAL_DURATION = HOLD_END + 1300; // 9000

/** [t, scale] checkpoints — piecewise-eased between consecutive pairs, so scale never jumps at the 遠景→近景 handoff. */
export const SCALE_CHECKPOINTS: [number, number][] = [
  [0, 1.0],
  [DISTANT_END, 1.35],
  [BLEND_END, 1.42],
  [STAGE_BOUNDS[5], 1.48],
  [HOLD_END, 1.49],
  [TOTAL_DURATION, 1.56],
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

/** The 5 staged lamp positions on scene-09.jpg — 中央 → 左 → 右 → 天井・周辺 → 部屋全体. */
export const LIGHTING_STAGES = [
  { left: 50, top: 28, size: 13 },
  { left: 14, top: 46, size: 11 },
  { left: 86, top: 46, size: 11 },
  { left: 50, top: 16, size: 22 },
  { left: 50, top: 50, size: 9 },
] as const;
