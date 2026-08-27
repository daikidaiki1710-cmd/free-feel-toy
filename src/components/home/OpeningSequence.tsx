"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  B_END,
  C_END,
  D_END,
  D_FADE_START,
  E_DISSOLVE_START,
  SCALE_RANGE,
  TOTAL_DURATION,
  easeInOutCubic,
  smoothstep,
} from "./openingTimeline";

type Phase = "gate" | "sequence" | "done";

/** Tap hotspot over the light in scene-02.jpg — percentage coordinates, same convention as every other page's image+hotspot pattern. */
const GATE_HOTSPOT = { left: 50, top: 66, width: 26, height: 30 };

const IDLE_KEYFRAMES = `
@keyframes ffl-idle-creep { 0% { transform: scale(1); } 100% { transform: scale(1.035); } }
@keyframes ffl-idle-breathe { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.07); } }
@keyframes ffl-hint-ripple { 0%, 82% { opacity: 0; transform: scale(1); } 88% { opacity: 0.4; } 100% { opacity: 0; transform: scale(9); } }
`;

type OpeningSequenceProps = {
  exitDurationMs: number;
};

/**
 * HOME opening built from 4 approved master images — scene-02 (待機/起動),
 * scene-03 (リング), scene-08 (トンネル奥の秘密基地), scene-09 (基地へ接近) —
 * plus the real HOME underneath. Unlike a crossfade slideshow, every layer
 * shares ONE continuous camera-scale timeline (computed once per frame and
 * applied identically to whichever layers are mounted) so scale never
 * resets at an image handoff — only opacity (and, for the SCENE C "burst
 * through the ring" beat, a growing mask hole + brief blur) changes at
 * each handoff. Driven by a single requestAnimationFrame loop that writes
 * directly to each layer's DOM style, not React state, so it can update at
 * full frame rate without re-render overhead — and JSX never sets these
 * layers' opacity/transform itself, so a re-render from something unrelated
 * (e.g. the mute button) can't stomp on the in-flight animation.
 */
export function OpeningSequence({ exitDurationMs }: OpeningSequenceProps) {
  const mode = useIntroMode();
  const reducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<Phase>("gate");
  const [gateIdle, setGateIdle] = useState(true);
  const [muted, setMutedState] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const l2Ref = useRef<HTMLDivElement>(null);
  const l3Ref = useRef<HTMLDivElement>(null);
  const l4Ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const cancelRaf = () => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  };

  useEffect(() => {
    return () => {
      clearTimers();
      cancelRaf();
    };
  }, []);

  // Initial layer visibility — set once, imperatively, so later re-renders
  // (mute toggle etc.) never touch these elements' style and can't stomp
  // on the rAF loop's in-flight values.
  useEffect(() => {
    if (l1Ref.current) l1Ref.current.style.opacity = "1";
    [l2Ref, l3Ref, l4Ref].forEach((r) => {
      if (r.current) r.current.style.opacity = "0";
    });
  }, []);

  function finishSequence() {
    markIntroSeen();
    stopAmbient();
    cancelRaf();
    setPhase("done");
  }

  function runSequence() {
    const start = performance.now();
    function frame(now: number) {
      const t = now - start;
      const p = Math.min(1, t / TOTAL_DURATION);
      const scale = 1 + easeInOutCubic(p) * SCALE_RANGE;
      const scaleStr = `scale(${scale})`;

      const l1 = l1Ref.current;
      const l2 = l2Ref.current;
      const l3 = l3Ref.current;
      const l4 = l4Ref.current;

      if (t <= B_END) {
        // SCENE B — light expands, ring spreads: a plain crossfade would
        // read as a swap; sharing the same continuously-growing scale
        // across both layers is what keeps it reading as one camera being
        // pulled toward the center instead.
        const u = smoothstep(t / B_END);
        if (l1) {
          l1.style.opacity = String(1 - u);
          l1.style.transform = scaleStr;
        }
        if (l2) {
          l2.style.opacity = String(u);
          l2.style.transform = scaleStr;
          l2.style.filter = "none";
          l2.style.maskImage = "none";
          (l2.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = "none";
        }
        if (l3) l3.style.opacity = "0";
        if (l4) l4.style.opacity = "0";
      } else if (t <= C_END) {
        // SCENE C — burst through the ring's own center: a growing mask
        // hole reveals SCENE 08 underneath *through* the ring image itself
        // (not a cut to a new picture), with the ring fading away only
        // after the hole has mostly opened, plus a brief blur right at the
        // burst instant.
        const u = (t - B_END) / (C_END - B_END);
        if (l1) l1.style.opacity = "0";
        const holeRadius = Math.pow(u, 1.6) * 145;
        const l2Opacity = 1 - smoothstep((u - 0.55) / 0.45);
        const l2Blur = Math.sin(Math.min(1, u / 0.75) * Math.PI) * 4;
        const maskStr = `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${holeRadius.toFixed(1)}%, black ${(holeRadius + 8).toFixed(1)}%, black 100%)`;
        if (l2) {
          l2.style.opacity = String(l2Opacity);
          l2.style.transform = scaleStr;
          l2.style.filter = l2Blur > 0.05 ? `blur(${l2Blur.toFixed(2)}px)` : "none";
          l2.style.maskImage = maskStr;
          (l2.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = maskStr;
        }
        const l3Opacity = smoothstep((u - 0.35) / 0.65);
        if (l3) {
          l3.style.opacity = String(l3Opacity);
          l3.style.transform = scaleStr;
        }
        if (l4) l4.style.opacity = "0";
      } else if (t <= D_END) {
        // SCENE D — the critical beat: SCENE 08 alone, uninterrupted,
        // continuing the same scale curve for over a second before SCENE 09
        // even begins blending in, so nothing reads as "image N of M".
        if (l1) l1.style.opacity = "0";
        if (l2) {
          l2.style.opacity = "0";
          l2.style.filter = "none";
          l2.style.maskImage = "none";
          (l2.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = "none";
        }
        if (t <= D_FADE_START) {
          if (l3) {
            l3.style.opacity = "1";
            l3.style.transform = scaleStr;
          }
          if (l4) l4.style.opacity = "0";
        } else {
          const u = smoothstep((t - D_FADE_START) / (D_END - D_FADE_START));
          if (l3) {
            l3.style.opacity = String(1 - u);
            l3.style.transform = scaleStr;
          }
          if (l4) {
            l4.style.opacity = String(u);
            l4.style.transform = scaleStr;
          }
        }
      } else {
        // SCENE E — SCENE 09 alone, still scaling, while the whole overlay
        // gradually dissolves into the real HOME beneath: the base itself
        // becoming the site, never a hard cut to a new screen.
        if (l3) l3.style.opacity = "0";
        if (l4) {
          l4.style.opacity = "1";
          l4.style.transform = scaleStr;
        }
        if (t >= E_DISSOLVE_START && wrapperRef.current) {
          const u = smoothstep((t - E_DISSOLVE_START) / (TOTAL_DURATION - E_DISSOLVE_START));
          wrapperRef.current.style.opacity = String(1 - u);
        }
      }

      if (t < TOTAL_DURATION) {
        rafId.current = requestAnimationFrame(frame);
      } else {
        finishSequence();
      }
    }
    rafId.current = requestAnimationFrame(frame);
  }

  // Repeat visits within the same session: skip the full chain and arrive
  // quickly on the already-lit base (scene-09), silently.
  useEffect(() => {
    if (mode !== "short" || phase !== "gate" || reducedMotion) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- imperative kickoff of a timer sequence on mount, not derived state
    setPhase("sequence");
    setGateIdle(false);
    if (l1Ref.current) {
      l1Ref.current.style.animation = "none";
      l1Ref.current.style.opacity = "0";
    }
    if (l4Ref.current) {
      l4Ref.current.style.transition = "opacity 450ms ease-out, transform 450ms ease-out";
      l4Ref.current.style.opacity = "1";
      l4Ref.current.style.transform = "scale(1.02)";
    }
    timers.current.push(
      setTimeout(() => {
        markIntroSeen();
        if (wrapperRef.current) {
          wrapperRef.current.style.transition = "opacity 500ms ease-out";
          wrapperRef.current.style.opacity = "0";
        }
        timers.current.push(setTimeout(() => setPhase("done"), 500));
      }, 550)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, reducedMotion]);

  // Reduced motion: no camera movement at all — a brief static hold on the
  // already-lit base, then a short fade straight to real HOME.
  const [reducedFading, setReducedFading] = useState(false);
  useEffect(() => {
    if (!reducedMotion) return;
    const t1 = setTimeout(() => {
      markIntroSeen();
      setReducedFading(true);
    }, 500);
    const t2 = setTimeout(() => setPhase("done"), 500 + exitDurationMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reducedMotion, exitDurationMs]);

  // SCENE A → B: tapping the light is the only gesture in the whole
  // experience. It unlocks audio and launches the single continuous
  // camera-timeline that carries the rest of the sequence.
  async function handleIgnite() {
    const ok = await resumeAudio();
    if (ok) startAmbient();
    playClick();
    setGateIdle(false);
    if (l1Ref.current) l1Ref.current.style.animation = "none"; // stop the idle CSS animation before rAF takes over transform/opacity
    setPhase("sequence");

    timers.current.push(setTimeout(() => playElectricHum(500), 80));
    timers.current.push(setTimeout(() => playMechanicalHum(700), 500));
    timers.current.push(setTimeout(() => playWhoosh(300), B_END + 380));
    timers.current.push(setTimeout(() => playWarpRise(D_END - C_END - 100), C_END));

    runSequence();
  }

  function skipIntro() {
    markIntroSeen();
    clearTimers();
    cancelRaf();
    stopAmbient();
    if (wrapperRef.current) {
      wrapperRef.current.style.transition = "opacity 500ms ease-out";
      wrapperRef.current.style.opacity = "0";
    }
    timers.current.push(setTimeout(() => setPhase("done"), 500));
  }

  function toggleMute() {
    setMutedState((value) => {
      setMuted(!value);
      return !value;
    });
  }

  if (phase === "done") return null;

  // Reduced motion: the already-lit base, static, no camera movement.
  if (reducedMotion) {
    return (
      <div
        className={`fixed inset-0 z-50 bg-brand-black-deep transition-opacity ease-out ${
          reducedFading ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: `${exitDurationMs}ms` }}
      >
        <Image src="/home/opening/scene-09.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/15" />
      </div>
    );
  }

  const showGate = phase === "gate" && mode === "full";

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-50 overflow-hidden bg-black">
      {/* The 4 approved master images. No style prop here for
          opacity/transform — that's owned entirely by the rAF loop above
          (and skipIntro/reduced paths), so a re-render from something
          unrelated (e.g. the mute button) never resets mid-sequence state. */}
      <div ref={l1Ref} className={`absolute inset-0 ${gateIdle ? "animate-[ffl-idle-creep_9s_ease-out_forwards,ffl-idle-breathe_3.4s_ease-in-out_infinite]" : ""}`}>
        <Image src="/home/opening/scene-02.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div ref={l2Ref} className="absolute inset-0">
        <Image src="/home/opening/scene-03.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div ref={l3Ref} className="absolute inset-0">
        <Image src="/home/opening/scene-08.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div ref={l4Ref} className="absolute inset-0">
        <Image src="/home/opening/scene-09.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>

      <style>{IDLE_KEYFRAMES}</style>

      {/* SCENE A — the only control in the whole experience: an invisible
          hotspot over the light already drawn by scene-02.jpg above. No
          duplicate image, no drawn dot, no logo, no START screen. */}
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
        onClick={skipIntro}
        className="absolute left-4 top-4 z-20 flex min-h-11 items-center rounded px-3 font-body text-[10px] tracking-[0.15em] text-brand-ivory-muted/40 transition-colors hover:text-brand-ivory-muted"
      >
        SKIP INTRO
      </button>
    </div>
  );
}
