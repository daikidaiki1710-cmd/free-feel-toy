"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { markIntroSeen, usePrefersReducedMotion, useIntroMode } from "@/lib/useIntroMode";
import {
  playClick,
  playElectricHum,
  playMechanicalHum,
  playWarpRise,
  playWhoosh,
  resumeAudio,
  setMuted,
  startAmbient,
  stopAmbient,
} from "@/lib/introSound";
import {
  ARRIVAL_HOLD,
  ARRIVAL_WASH_KEYFRAMES,
  FLASH_KEYFRAMES,
  LIGHTING_DURATION,
  LIGHTING_SCRIM_BY_COUNT,
  SCENE_COUNT,
  SCENE_LAYERS,
  SCENE_START,
  arrivalWashAnimationStyle,
  buildSceneKeyframes,
  flashAnimationStyle,
  sceneAnimationStyle,
} from "./openingTimeline";

type Phase = "gate" | "sequence" | "leaving" | "done";

const SCENE_KEYFRAMES = buildSceneKeyframes();

/** Approximate lamp positions in scene-09.jpg (the already-lit base) for the three "カチッ" bloom accents. */
const LIGHTING_BLOOMS = [
  { left: 50, top: 25, size: 34 },
  { left: 15, top: 47, size: 30 },
  { left: 85, top: 47, size: 30 },
];

/** Tap hotspot over the light in scene-01.jpg — percentage coordinates, same convention as every other page's image+hotspot pattern. */
const GATE_HOTSPOT = { left: 50, top: 66, width: 26, height: 30 };

type OpeningSequenceProps = {
  exitDurationMs: number;
};

/**
 * SCENE 01–10 opening built entirely from the 10 approved master images
 * (public/home/opening/scene-01..09.jpg). SCENE 10 itself needs no asset
 * here — it's the always-mounted HomeFinal/HomeFinalMobile already sitting
 * beneath this overlay in page.tsx; dissolving this overlay's opacity to 0
 * *is* the arrival. This component only places, times, crossfades and
 * sound-syncs the 9 finished images — it never draws its own rings/tunnel/light.
 */
export function OpeningSequence({ exitDurationMs }: OpeningSequenceProps) {
  const mode = useIntroMode();
  const reducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<Phase>("gate");
  const [playing, setPlaying] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [nineArrived, setNineArrived] = useState(false);
  const [muted, setMutedState] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  function leave() {
    markIntroSeen();
    clearTimers();
    stopAmbient();
    setPhase("leaving");
    timers.current.push(setTimeout(() => setPhase("done"), exitDurationMs));
  }

  function skipIntro() {
    markIntroSeen();
    clearTimers();
    stopAmbient();
    setPhase("leaving");
    timers.current.push(setTimeout(() => setPhase("done"), exitDurationMs));
  }

  useEffect(() => clearTimers, []);

  // Repeat visits within the same session: skip the full cinematic chain and
  // arrive quickly on the already-lit base (SCENE 09 image), silently.
  useEffect(() => {
    if (mode !== "short" || phase !== "gate" || reducedMotion) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- imperative kickoff of a timer sequence on mount, not derived state
    setPhase("sequence");
    setPlaying(true);
    timers.current.push(setTimeout(() => leave(), 700));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, reducedMotion]);

  // Reduced motion: no crosszoom chain at all — a brief static hold on the
  // already-lit base, then a short fade straight to real HOME.
  useEffect(() => {
    if (!reducedMotion) return;
    const t1 = setTimeout(() => {
      markIntroSeen();
      setPhase("leaving");
    }, 500);
    const t2 = setTimeout(() => setPhase("done"), 500 + exitDurationMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reducedMotion, exitDurationMs]);

  // SCENE 01: tapping the light is the only gesture in the whole
  // experience. It unlocks audio and launches the SCENE 02–09 crossfade —
  // the images themselves carry the ripple/ring/tunnel/base, this only
  // times and sound-syncs the handoff between them.
  async function handleIgnite() {
    const ok = await resumeAudio();
    if (ok) startAmbient();
    playClick();
    setPhase("sequence");
    setPlaying(true);

    // SCENE 02 — small click already played; the low "ブゥ…" as the ripple spreads.
    timers.current.push(setTimeout(() => playElectricHum(400), 60));
    // SCENE 03 — "ブゥゥン…" as the ring activates.
    timers.current.push(setTimeout(() => playMechanicalHum(600), SCENE_START[2]));
    // SCENE 04→05 — one continuous rising sweep through the acceleration and the suction.
    timers.current.push(
      setTimeout(() => playWarpRise(SCENE_START[6] - SCENE_START[3]), SCENE_START[3])
    );
    // SCENE 06 — "シュン" right as the light is broken through.
    timers.current.push(setTimeout(() => playWhoosh(300), Math.max(0, SCENE_START[5] - 150)));

    // SCENE 09 — the base arrives dim (scrim up); three staged lamp clicks
    // then lift it in steps, "暗め→カチッ→一部点灯→カチッ→さらに→カチッ→完全点灯".
    const lightingStart = SCENE_START[SCENE_COUNT];
    timers.current.push(setTimeout(() => setNineArrived(true), SCENE_START[SCENE_COUNT - 1]));
    [0, LIGHTING_DURATION * 0.36, LIGHTING_DURATION * 0.72].forEach((offset, i) => {
      timers.current.push(
        setTimeout(() => {
          playClick();
          setLitCount(i + 1);
        }, lightingStart + offset)
      );
    });

    // SCENE 10 — hold in silence on the fully-lit base, then dissolve into real HOME.
    timers.current.push(setTimeout(() => leave(), lightingStart + LIGHTING_DURATION + ARRIVAL_HOLD));
  }

  function toggleMute() {
    setMutedState((value) => {
      setMuted(!value);
      return !value;
    });
  }

  const sceneStyles = useMemo(() => SCENE_LAYERS.map((layer) => sceneAnimationStyle(layer, playing)), [playing]);

  if (phase === "done") return null;

  // Reduced motion: the already-lit base, static, no crossfade chain.
  if (reducedMotion) {
    return (
      <div
        className={`fixed inset-0 z-50 bg-brand-black-deep transition-opacity ease-out ${
          phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: `${exitDurationMs}ms` }}
      >
        <Image src="/home/opening/scene-09.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/15" />
      </div>
    );
  }

  const showGate = phase === "gate" && mode === "full";
  const isLeaving = phase === "leaving";

  // Short/repeat-visit replay: only the already-lit base, quick fade in, no full chain, no sound.
  if (mode === "short" && phase !== "gate") {
    return (
      <div
        className={`fixed inset-0 z-50 overflow-hidden bg-black transition-opacity ease-out ${
          isLeaving ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: `${exitDurationMs}ms` }}
      >
        <div className="absolute inset-0 animate-[ffl-scene-9-quick_500ms_ease-out_forwards]">
          <Image src="/home/opening/scene-09.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        </div>
        <style>{`@keyframes ffl-scene-9-quick { 0% { opacity: 0; transform: scale(0.96); } 100% { opacity: 1; transform: scale(1); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-black transition-opacity ease-out ${
        isLeaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${exitDurationMs}ms` }}
    >
      {/* SCENE 01–09 — the 10 approved master images, only crossfaded/scaled,
          never redrawn. object-cover keeps every scene filling the frame
          edge-to-edge (no letterbox bars breaking the continuous-camera
          feel) with the vanishing point centered; the masters' varying
          aspect ratios mean scenes 01/02 crop a little tight on narrow
          mobile widths, an accepted trade-off over introducing bars. */}
      {SCENE_LAYERS.map((layer, index) => (
        <div
          key={layer.scene}
          className="absolute inset-0"
          style={
            layer.scene === SCENE_COUNT && isLeaving && nineArrived
              ? // SCENE 09 → 10 handoff: no black dip — the base itself keeps
                // pushing forward (continuing the same scale-up language as
                // every other transition) while it dissolves directly into
                // real HOME beneath, instead of the whole overlay just
                // flattening to black first. Only applied once SCENE 09 has
                // genuinely arrived — an early SKIP INTRO still just fades
                // the whole overlay uniformly, per the normal sceneStyles.
                { opacity: 1, transform: "scale(1.05)", transition: `transform ${exitDurationMs}ms ease-in` }
              : sceneStyles[index]
          }
        >
          <Image
            src={`/home/opening/scene-${String(layer.scene).padStart(2, "0")}.jpg`}
            alt=""
            fill
            priority={layer.scene <= 2}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* SCENE 06 — a brief, minimal pulse layered over the image's own baked-in flash. Never a long white screen. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#fff8ec]"
        style={flashAnimationStyle(playing)}
      />

      {/* SCENE 09 arrives dim — this scrim lifts in 3 discrete steps (one per
          "カチッ") so the base visibly wakes up from darkness instead of
          appearing already fully lit. Hidden instantly once leaving starts. */}
      {nineArrived && !isLeaving && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-[420ms] ease-out"
          style={{ opacity: LIGHTING_SCRIM_BY_COUNT[Math.min(litCount, LIGHTING_SCRIM_BY_COUNT.length - 1)] }}
        />
      )}

      {/* SCENE 09 — three staged lamp-bloom accents, synced to the three "カチッ" clicks, punching through the scrim above as each lamp turns on. */}
      {!isLeaving &&
        LIGHTING_BLOOMS.map((bloom, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full transition-opacity duration-500 ease-out"
            style={{
              left: `${bloom.left}%`,
              top: `${bloom.top}%`,
              width: `${bloom.size}vw`,
              height: `${bloom.size}vw`,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(255,224,170,0.75) 0%, rgba(255,190,110,0.3) 45%, transparent 72%)",
              filter: "blur(7px)",
              mixBlendMode: "screen",
              opacity: litCount >= index + 1 ? 1 : 0,
            }}
          />
        ))}

      {/* SCENE 09 → 10 — a brief warm wash right at the handoff. A flat
          opacity crossfade between two dark/moody images (the lit base and
          real HOME) dims further at the midpoint by simple alpha blending;
          this sells "the space fills with light and becomes HOME" instead,
          without touching HomeFinal itself. */}
      {isLeaving && nineArrived && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 45%, rgba(255,228,185,0.95) 0%, rgba(255,192,120,0.55) 38%, rgba(0,0,0,0) 72%)",
            mixBlendMode: "screen",
            ...arrivalWashAnimationStyle(exitDurationMs),
          }}
        />
      )}

      <style>{SCENE_KEYFRAMES}</style>
      <style>{FLASH_KEYFRAMES}</style>
      <style>{ARRIVAL_WASH_KEYFRAMES}</style>

      {/* SCENE 01 — the only control in the whole experience: an invisible
          hotspot over the light already drawn by the SCENE_LAYERS map above
          (scene1 sits at opacity 1 until "playing" starts). No duplicate
          image, no drawn dot, no logo, no START screen. */}
      {showGate && (
        <div className="absolute inset-0 z-10">
          <button
            type="button"
            onClick={handleIgnite}
            aria-label="光に触れてはじめる"
            className="group absolute flex items-center justify-center"
            style={{
              left: `${GATE_HOTSPOT.left}%`,
              top: `${GATE_HOTSPOT.top}%`,
              width: `${GATE_HOTSPOT.width}%`,
              height: `${GATE_HOTSPOT.height}%`,
              transform: "translate(-50%, -50%)",
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <span className="absolute h-3 w-3 rounded-full border border-theme-accent/50 opacity-0 [animation:ffl-hint-ripple_4.5s_ease-out_infinite]" />
            <span className="absolute h-3 w-3 rounded-full transition-transform duration-300 group-hover:scale-150 group-hover:bg-theme-accent/10" />
          </button>
          <style>{`@keyframes ffl-hint-ripple { 0%, 82% { opacity: 0; transform: scale(1); } 88% { opacity: 0.4; } 100% { opacity: 0; transform: scale(9); } }`}</style>
        </div>
      )}

      {/* Persistent controls — hidden instantly (not faded) once leaving starts, so they don't linger over the SCENE 09→10 handoff. */}
      {!showGate && !isLeaving && (
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
      {!isLeaving && (
        <button
          type="button"
          onClick={skipIntro}
          className="absolute left-4 top-4 z-20 flex min-h-11 items-center rounded px-3 font-body text-[10px] tracking-[0.15em] text-brand-ivory-muted/40 transition-colors hover:text-brand-ivory-muted"
        >
          SKIP INTRO
        </button>
      )}
    </div>
  );
}
