"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { markIntroSeen, usePrefersReducedMotion, useIntroMode } from "@/lib/useIntroMode";
import { playClick, playElectricHum, playMechanicalHum, resumeAudio, setMuted, startAmbient, stopAmbient } from "@/lib/introSound";

type Phase = "gate" | "playing" | "darkening" | "exiting" | "done";

/**
 * ms-from-timeline-start → stage number. No wordmark/tagline stage: the
 * photo already carries "Free Feel Toy." baked in, so the reveal itself is
 * the whole story. Stage 5 (full scene) is held with nothing added for
 * ~1s before ENTER THE BASE quietly appears (stage 6).
 */
const FULL_TIMELINE: { at: number; stage: number }[] = [
  { at: 0, stage: 0 },
  { at: 700, stage: 1 },
  { at: 1400, stage: 2 },
  { at: 2200, stage: 3 },
  { at: 3200, stage: 4 },
  { at: 4400, stage: 5 },
  { at: 5400, stage: 6 },
];

const SHORT_TIMELINE: { at: number; stage: number }[] = [
  { at: 0, stage: 5 },
  { at: 400, stage: 6 },
];

/** Approximate real light fixtures in home-final-mobile.jpg (pixel brightness scan), top → center → back. */
const LIGHTS = [
  { left: 70, top: 28, size: 46 },
  { left: 50, top: 55, size: 50 },
  { left: 46, top: 87, size: 60 },
];

const SCRIM_BY_STAGE: Record<number, number> = {
  0: 1,
  1: 0.96,
  2: 0.9,
  3: 0.48,
  4: 0.3,
  5: 0.16,
  6: 0.1,
};

/**
 * Mobile HOME opening — "秘密基地へ自分が入り込む" experience. An
 * independent fixed overlay on top of the untouched HomeFinalMobile(); the
 * vertical light order and the zoom+drift camera move are mobile-specific,
 * not a scaled-down copy of the desktop version. The photo's own baked-in
 * "Free Feel Toy." reads as the brand once revealed — no separate logo
 * layer is drawn on top. ENTER THE BASE sits on the quiet wooden beam
 * between the GARAGE and LAB rooms — a small entrance sign, not a button.
 */
export function HomeOpeningMobile() {
  const mode = useIntroMode();
  const reducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<Phase>("gate");
  const [stage, setStage] = useState(0);
  const [muted, setMutedState] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  useEffect(() => {
    if (mode === "short" && phase === "gate" && !reducedMotion) {
      runTimeline(SHORT_TIMELINE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, reducedMotion]);

  function runTimeline(timeline: { at: number; stage: number }[]) {
    setPhase("playing");
    clearTimers();
    timeline.forEach(({ at, stage: s }) => {
      timers.current.push(
        setTimeout(() => {
          setStage(s);
          if (mode === "full") {
            if (s === 1 || s === 2) playClick();
            if (s === 3) {
              playElectricHum();
              playMechanicalHum();
            }
          }
        }, at)
      );
    });
  }

  async function handleStart() {
    const ok = await resumeAudio();
    if (ok) startAmbient();
    runTimeline(FULL_TIMELINE);
  }

  // Two-step exit so the cut reads as "hold on black, then reveal" rather
  // than the image and the blackout dissolving at the same time.
  function finish() {
    markIntroSeen();
    clearTimers();
    stopAmbient();
    setPhase("darkening");
    setTimeout(() => setPhase("exiting"), 700);
    setTimeout(() => setPhase("done"), 700 + 600);
  }

  function toggleMute() {
    setMutedState((value) => {
      setMuted(!value);
      return !value;
    });
  }

  if (phase === "done") return null;

  const isLeaving = phase === "darkening" || phase === "exiting";

  if (reducedMotion) {
    return (
      <div
        className={`fixed inset-0 z-50 bg-brand-black-deep transition-opacity duration-[600ms] ${
          phase === "exiting" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Image src="/home/home-final-mobile.jpg" alt="" fill priority sizes="100vw" className="object-cover object-top" />
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-x-0 top-[48%] flex -translate-y-1/2 justify-center">
          <button
            type="button"
            onClick={finish}
            className="group flex min-h-11 items-center gap-2 px-3 font-body text-xs font-semibold tracking-[0.3em] text-brand-ivory-muted"
          >
            ENTER THE BASE
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  }

  const showGate = phase === "gate" && mode === "full";
  const showIntro = phase === "playing" || isLeaving || showGate;
  if (!showIntro) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-[600ms] ease-out ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      } ${isLeaving ? "pointer-events-none" : ""}`}
    >
      <div
        className="absolute inset-0 transition-transform duration-[1200ms] ease-out"
        style={{ transform: stage >= 4 ? "scale(1.08) translateY(-1.5%)" : "scale(1) translateY(0)" }}
      >
        <Image src="/home/home-final-mobile.jpg" alt="" fill priority sizes="100vw" className="object-cover object-top" />
      </div>

      {/* Spotlights — top → center → back, matching the "entering the base" reading order. */}
      {LIGHTS.map((light, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="absolute rounded-full transition-opacity duration-[650ms] ease-out"
          style={{
            left: `${light.left}%`,
            top: `${light.top}%`,
            width: `${light.size}vw`,
            height: `${light.size}vw`,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,205,130,0.85) 0%, rgba(255,170,80,0.3) 40%, transparent 72%)",
            filter: "blur(5px)",
            mixBlendMode: "screen",
            opacity: stage >= index + 1 ? 1 : 0,
          }}
        />
      ))}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black transition-opacity duration-[700ms] ease-out"
        style={{ opacity: isLeaving ? 1 : SCRIM_BY_STAGE[stage] }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
      />

      {/* ENTER THE BASE — a quiet entrance sign on the wooden beam between
          the GARAGE and LAB rooms, not a CTA button: no fill, no border,
          no glow, and clear of the photo's own "Free Feel Toy." / MOVE /
          CREATE / LIFE text. */}
      <div
        className={`absolute inset-x-0 top-[48%] flex -translate-y-1/2 justify-center transition-opacity duration-[1300ms] ease-out ${
          stage >= 6 && !isLeaving ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={finish}
          disabled={stage < 6 || isLeaving}
          className={`group flex min-h-11 items-center gap-2 px-3 font-body text-xs font-semibold tracking-[0.3em] text-brand-ivory-muted transition-all duration-500 ease-out active:text-theme-accent ${
            stage >= 6 ? "pointer-events-auto translate-y-0" : "pointer-events-none translate-y-1"
          }`}
        >
          ENTER THE BASE
          <span aria-hidden="true" className="transition-transform duration-300 group-active:translate-x-1">
            →
          </span>
        </button>
      </div>

      {showGate && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/70 px-6">
          <button
            type="button"
            onClick={handleStart}
            className="min-h-11 rounded-full border border-brand-brass/50 px-7 py-3 font-body text-xs tracking-[0.25em] text-brand-ivory-muted"
          >
            SOUND ON / START
          </button>
        </div>
      )}

      {!showGate && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "音を解除する" : "音を消す"}
          className="absolute right-3 top-3 z-20 flex min-h-11 min-w-11 items-center justify-center text-brand-ivory-muted"
        >
          {muted ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
              <path d="M16 9l4 6M20 9l-4 6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
              <path d="M16.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}
      <button
        type="button"
        onClick={finish}
        className="absolute left-3 top-3 z-20 min-h-11 rounded px-2 font-body text-xs tracking-[0.15em] text-brand-ivory-muted/80"
      >
        SKIP INTRO
      </button>
    </div>
  );
}
