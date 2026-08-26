"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { markIntroSeen, usePrefersReducedMotion, useIntroMode } from "@/lib/useIntroMode";
import { playClick, playElectricHum, playMechanicalHum, resumeAudio, setMuted, startAmbient, stopAmbient } from "@/lib/introSound";

type Phase = "gate" | "playing" | "darkening" | "exiting" | "done";

/**
 * ms-from-timeline-start → stage number. No wordmark/tagline stage during
 * the base reveal itself: the photo already carries "Free Feel Toy." baked
 * in. Stage 5 (full scene) is held with nothing added for ~1s before
 * "CLICK TO ENTER" quietly appears (stage 6).
 */
const FULL_TIMELINE: { at: number; stage: number }[] = [
  { at: 0, stage: 0 },
  { at: 800, stage: 1 },
  { at: 1500, stage: 2 },
  { at: 2300, stage: 3 },
  { at: 3200, stage: 4 },
  { at: 4300, stage: 5 },
  { at: 5300, stage: 6 },
];

const SHORT_TIMELINE: { at: number; stage: number }[] = [
  { at: 0, stage: 5 },
  { at: 400, stage: 6 },
];

/** Approximate real light fixtures in home-final.jpg (found via pixel brightness scan), left/right/back. */
const LIGHTS = [
  { left: 46, top: 21, size: 24 },
  { left: 87.5, top: 66, size: 30 },
  { left: 21, top: 29, size: 24 },
];

const SCRIM_BY_STAGE: Record<number, number> = {
  0: 1,
  1: 0.96,
  2: 0.9,
  3: 0.5,
  4: 0.32,
  5: 0.16,
  6: 0.1,
};

/**
 * PC HOME opening — "秘密基地全体を見渡す" experience. An independent
 * fixed overlay on top of the untouched HomeFinal(); never mounts inside
 * or modifies it. A brand title card (Logo + tagline + SOUND ON / START)
 * establishes this is Free Feel Toy before any darkness — that card is
 * gone the instant START is pressed. Then: darkness → staged spotlights →
 * the base itself fully revealed (its own baked-in "Free Feel Toy." reads
 * as the brand — no logo layer is drawn over the base) → a brief hold →
 * "CLICK TO ENTER" quietly labels the now fully-clickable base image.
 */
export function HomeOpeningDesktop() {
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

  // Repeat visits within the same session skip straight to the short, silent replay.
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
    setTimeout(() => setPhase("exiting"), 750);
    setTimeout(() => setPhase("done"), 750 + 650);
  }

  function toggleMute() {
    setMutedState((value) => {
      setMuted(!value);
      return !value;
    });
  }

  if (phase === "done") return null;

  const isLeaving = phase === "darkening" || phase === "exiting";

  // Reduced motion: static resting frame, one explicit click through, no audio.
  if (reducedMotion) {
    return (
      <div
        className={`fixed inset-0 z-50 bg-brand-black-deep transition-opacity duration-[650ms] ${
          phase === "exiting" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Image src="/home/home-final.jpg" alt="" fill priority sizes="100vw" className="object-cover object-top" />
        <div className="absolute inset-0 bg-black/15" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[4%] flex justify-center">
          <span className="font-body text-xs font-semibold tracking-[0.35em] text-brand-ivory-muted">CLICK TO ENTER</span>
        </div>
        <button
          type="button"
          onClick={finish}
          aria-label="クリックして秘密基地の中へ入る"
          className="absolute inset-0 cursor-pointer"
        />
      </div>
    );
  }

  const showGate = phase === "gate" && mode === "full";
  const showIntro = phase === "playing" || isLeaving || showGate;
  if (!showIntro) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-[650ms] ease-out ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      } ${isLeaving ? "pointer-events-none" : ""}`}
    >
      <div
        className="absolute inset-0 transition-transform duration-[1100ms] ease-out"
        style={{ transform: stage >= 4 ? "scale(1.045)" : "scale(1)" }}
      >
        <Image src="/home/home-final.jpg" alt="" fill priority sizes="100vw" className="object-cover object-top" />
      </div>

      {/* Spotlights — warm glows blended over the darkness, anchored to real light fixtures in the photo. */}
      {LIGHTS.map((light, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="absolute rounded-full transition-opacity duration-[700ms] ease-out"
          style={{
            left: `${light.left}%`,
            top: `${light.top}%`,
            width: `${light.size}vw`,
            height: `${light.size}vw`,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,205,130,0.85) 0%, rgba(255,170,80,0.3) 40%, transparent 72%)",
            filter: "blur(6px)",
            mixBlendMode: "screen",
            opacity: stage >= index + 1 ? 1 : 0,
          }}
        />
      ))}

      {/* Darkness scrim — recedes stage by stage, settling on a residual cinematic shadow; on exit it rises to full black *before* the container itself fades away. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black transition-opacity duration-[700ms] ease-out"
        style={{ opacity: isLeaving ? 1 : SCRIM_BY_STAGE[stage] }}
      />

      {/* Vignette — constant, subtle. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%)" }}
      />

      {/* CLICK TO ENTER — a quiet label, not a button; the whole base image
          becomes the click target below, so there's only ever one "ENTER"
          on screen (no more competing with the photo's own per-room
          ENTER → labels). */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-[4%] flex justify-center transition-opacity duration-[1400ms] ease-out ${
          stage >= 6 && !isLeaving ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="font-body text-xs font-semibold tracking-[0.35em] text-brand-ivory-muted">CLICK TO ENTER</span>
      </div>

      {/* Only clickable once the label above has appeared — an accidental
          click during the lighting sequence must not skip ahead. */}
      {stage >= 6 && !isLeaving && (
        <button
          type="button"
          onClick={finish}
          aria-label="クリックして秘密基地の中へ入る"
          className="absolute inset-0 z-10 cursor-pointer"
        />
      )}

      {/* Title card — first visit only. Establishes "this is Free Feel Toy"
          before any darkness, so a first-time visitor never wonders if the
          black screen is a stuck loader. Gone the instant START is
          pressed; the base's own baked-in wordmark carries the brand from
          here on, so this card never reappears once the opening starts. */}
      {showGate && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-10 bg-black px-6 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <Logo className="text-6xl text-brand-ivory" />
              <p className="font-body text-base tracking-[0.15em] text-brand-ivory-muted">自由な発想を、カタチに。</p>
            </div>
            <p className="font-body text-[11px] tracking-[0.4em] text-brand-brass">WELCOME TO OUR SECRET BASE</p>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="min-h-11 rounded-full border border-brand-brass/50 px-7 py-3 font-body text-xs tracking-[0.3em] text-brand-ivory-muted transition-colors hover:border-brand-brass hover:text-brand-ivory"
          >
            SOUND ON / START
          </button>
        </div>
      )}

      {/* Persistent controls */}
      {!showGate && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "音を解除する" : "音を消す"}
          className="absolute right-4 top-4 z-20 flex min-h-11 min-w-11 items-center justify-center text-brand-ivory-muted transition-colors hover:text-brand-ivory"
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
        className="absolute left-4 top-4 z-20 flex min-h-11 items-center rounded px-3 font-body text-[10px] tracking-[0.15em] text-brand-ivory-muted/45 transition-colors hover:text-brand-ivory-muted"
      >
        SKIP INTRO
      </button>
    </div>
  );
}
