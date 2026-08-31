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
// ② 近景 — the center/back lamp is already lit in scene-07 and stays lit
// straight through the blend (no blackout); only the *periphery* holds
// dark for a beat before the remaining lamps light, so brightness never
// jumps or drops at the 遠景→近景 handoff.
export const DARK_HOLD_END = BLEND_END + 800; // 4000
// ② 照明 — camera nearly stops; 5 staged lamp reveals (手前 → 左 → 右 → 天井・周辺 → 部屋全体). 中央/奥 is already on, not part of this list.
export const STAGE_BOUNDS = [DARK_HOLD_END, 4600, 5200, 5800, 6400, 7000] as const;
// Peripheral scrim opacity by stage — the already-lit center is carved out of this via a gradient hole, so it never darkens.
export const STAGE_SCRIM = [0.8, 0.58, 0.4, 0.22, 0.08, 0.0] as const;
export const STAGE_TRANSITION_MS = 450;
// Each lamp's own glow spreads over 0.2–0.3s after it clicks on ("カチッ→ふわっ"), not an instant snap to full brightness.
export const STAGE_PUNCH_MS = 260;
// 余韻 — hold the finished, fully-lit base before connecting to HOME. Long
// enough to show the completed base at rest (Epic Hybrid Logo's "power-on"
// hit and afterglow land inside this window — see introSound.ts) rather
// than cutting straight to HOME the instant the last lamp settles.
export const HOLD_END = STAGE_BOUNDS[5] + 4000; // 11000
// ③ HOME接続 — a further slow push while the whole overlay dissolves into real HOME.
export const TOTAL_DURATION = HOLD_END + 1300; // 12300

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

/**
 * The 5 staged lamp positions on scene-09.jpg — 手前 → 左 → 右 → 天井・周辺
 * → 部屋全体. The center/back lamp (top: 28%) is already lit from
 * scene-07 onward and is NOT one of these stages.
 */
export const LIGHTING_STAGES = [
  { left: 50, top: 58, size: 13 },
  { left: 14, top: 46, size: 11 },
  { left: 86, top: 46, size: 11 },
  { left: 50, top: 16, size: 22 },
  { left: 50, top: 50, size: 9 },
] as const;

/** The already-lit center/back lamp — this is where the scrim's gradient hole is centered so it's never darkened. */
export const ALREADY_LIT_CENTER = { left: 50, top: 28 };
