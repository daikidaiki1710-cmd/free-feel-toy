"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { markIntroSeen, usePrefersReducedMotion, useIntroMode } from "@/lib/useIntroMode";
import { playClick, playWarpRise, playWhoosh, resumeAudio, setMuted, startAmbient, stopAmbient } from "@/lib/introSound";
import {
  BLEND_END,
  DARK_HOLD_END,
  DISTANT_END,
  HOLD_END,
  LIGHTING_STAGES,
  STAGE_BOUNDS,
  STAGE_PUNCH_MS,
  STAGE_SCRIM,
  STAGE_TRANSITION_MS,
  TOTAL_DURATION,
  scaleAt,
  smoothstep,
} from "./openingTimeline";

type Phase = "gate" | "sequence" | "done";

/** Tap hotspot over the tunnel opening in scene-07.jpg — percentage coordinates, same convention as every other page's image+hotspot pattern. */
const GATE_HOTSPOT = { left: 50, top: 55, width: 30, height: 34 };

const IDLE_KEYFRAMES = `
@keyframes ffl-idle-creep { 0% { transform: scale(1); } 100% { transform: scale(1.035); } }
@keyframes ffl-idle-breathe { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.07); } }
@keyframes ffl-hint-ripple { 0%, 82% { opacity: 0; transform: scale(1); } 88% { opacity: 0.4; } 100% { opacity: 0; transform: scale(9); } }
`;

type OpeningSequenceProps = {
  exitDurationMs: number;
};

/**
 * HOME opening, simplified to 3 parts on 2 approved master images —
 * scene-07 (遠景: the base seen at the far end of the tunnel) and scene-09
 * (近景: arrived, lit stage by stage) — plus the real HOME underneath. One
 * continuous requestAnimationFrame loop drives every layer's
 * opacity/transform/scrim directly via refs (never React state), so scale
 * is one shared curve across the whole tap→HOME timeline and never resets
 * at the 遠景→近景 handoff.
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
  const scrimRef = useRef<HTMLDivElement>(null);
  const bloomRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    if (l2Ref.current) l2Ref.current.style.opacity = "0";
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
      const scaleStr = `scale(${scaleAt(t)})`;

      const l1 = l1Ref.current;
      const l2 = l2Ref.current;
      const scrim = scrimRef.current;

      if (t <= DISTANT_END) {
        // ① 遠景 — camera pushes through the tunnel toward the base, with
        // real accel/decel (scaleAt is eased, not a flat linear zoom).
        if (l1) {
          l1.style.opacity = "1";
          l1.style.transform = scaleStr;
        }
        if (l2) l2.style.opacity = "0";
      } else if (t <= BLEND_END) {
        // ① → ② — position/scale matched, minimal blend: both layers
        // share the same continuously-growing scale so it reads as the
        // same camera arriving, not a new picture.
        const u = smoothstep((t - DISTANT_END) / (BLEND_END - DISTANT_END));
        if (l1) {
          l1.style.opacity = String(1 - u);
          l1.style.transform = scaleStr;
        }
        if (l2) {
          l2.style.opacity = String(u);
          l2.style.transform = scaleStr;
        }
      } else if (t <= DARK_HOLD_END) {
        // ② 到着直後の暗い間 — the base is fully visible but stays dark
        // for a beat before any lamp lights, so lighting doesn't start
        // the instant the room appears.
        if (l1) l1.style.opacity = "0";
        if (l2) {
          l2.style.opacity = "1";
          l2.style.transform = scaleStr;
        }
        if (scrim) scrim.style.opacity = String(STAGE_SCRIM[0]);
      } else if (t <= STAGE_BOUNDS[STAGE_BOUNDS.length - 1]) {
        // ② 近景＋照明 — camera has essentially stopped; a dark scrim
        // lifts in 5 explicit snap-then-hold steps (中央→左→右→天井・
        // 周辺→部屋全体), each with its own local light bloom.
        if (l1) l1.style.opacity = "0";
        if (l2) {
          l2.style.opacity = "1";
          l2.style.transform = scaleStr;
        }
        let stageIndex = 0;
        for (let i = 0; i < STAGE_BOUNDS.length - 1; i++) {
          if (t <= STAGE_BOUNDS[i + 1]) {
            stageIndex = i;
            break;
          }
        }
        const localT = t - STAGE_BOUNDS[stageIndex];
        const transitionU = smoothstep(Math.min(1, localT / STAGE_TRANSITION_MS));
        if (scrim) {
          const from = STAGE_SCRIM[stageIndex];
          const to = STAGE_SCRIM[stageIndex + 1];
          scrim.style.opacity = String(from + (to - from) * transitionU);
        }
        const punchU = smoothstep(Math.min(1, localT / STAGE_PUNCH_MS));
        bloomRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.opacity = i < stageIndex ? "1" : i === stageIndex ? String(punchU) : "0";
        });
      } else if (t <= HOLD_END) {
        // 余韻 — the finished, fully-lit base held before HOME.
        if (l2) {
          l2.style.opacity = "1";
          l2.style.transform = scaleStr;
        }
        if (scrim) scrim.style.opacity = "0";
        bloomRefs.current.forEach((el) => {
          if (el) el.style.opacity = "1";
        });
      } else {
        // ③ HOMEへ — a further slow push while the whole overlay
        // dissolves into real HOME beneath: no blackout, no flash.
        if (l2) {
          l2.style.opacity = "1";
          l2.style.transform = scaleStr;
        }
        if (wrapperRef.current) {
          const u = smoothstep((t - HOLD_END) / (TOTAL_DURATION - HOLD_END));
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
    if (l2Ref.current) {
      l2Ref.current.style.transition = "opacity 450ms ease-out, transform 450ms ease-out";
      l2Ref.current.style.opacity = "1";
      l2Ref.current.style.transform = "scale(1.02)";
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

  // ①: tapping the tunnel is the only gesture in the whole experience. It
  // unlocks audio and launches the single continuous camera-timeline that
  // carries the rest of the sequence.
  async function handleIgnite() {
    const ok = await resumeAudio();
    if (ok) startAmbient();
    playClick();
    setGateIdle(false);
    if (l1Ref.current) l1Ref.current.style.animation = "none"; // stop the idle CSS animation before rAF takes over transform/opacity
    setPhase("sequence");

    // ① — approaching the base.
    timers.current.push(setTimeout(() => playWarpRise(2100), 150));
    // ① → ② — arriving.
    timers.current.push(setTimeout(() => playWhoosh(300), DISTANT_END + 60));
    // ② — four staged lamp clicks ("カチッ……カチッ……カチッ……カチッ"); the 5th stage (部屋全体) settles without a click.
    for (let i = 0; i < LIGHTING_STAGES.length - 1; i++) {
      timers.current.push(setTimeout(() => playClick(), STAGE_BOUNDS[i]));
    }

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
      {/* The 2 approved master images. No style prop here for
          opacity/transform — that's owned entirely by the rAF loop above
          (and skipIntro/reduced paths), so a re-render from something
          unrelated (e.g. the mute button) never resets mid-sequence state. */}
      <div ref={l1Ref} className={`absolute inset-0 ${gateIdle ? "animate-[ffl-idle-creep_9s_ease-out_forwards,ffl-idle-breathe_3.4s_ease-in-out_infinite]" : ""}`}>
        <Image src="/home/opening/scene-07.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div ref={l2Ref} className="absolute inset-0">
        <Image src="/home/opening/scene-09.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>

      {/* ② dark scrim over scene-09, lifted in 5 explicit steps. */}
      <div ref={scrimRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />

      {/* ② the 5 staged lamp-bloom accents (中央・左・右・天井/周辺・部屋全体), punching through the scrim above one at a time. */}
      {LIGHTING_STAGES.map((bloom, index) => (
        <div
          key={index}
          ref={(el) => {
            bloomRefs.current[index] = el;
          }}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${bloom.left}%`,
            top: `${bloom.top}%`,
            width: `${bloom.size}vw`,
            height: `${bloom.size}vw`,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(255,224,170,0.6) 0%, rgba(255,190,110,0.2) 40%, transparent 68%)",
            filter: "blur(4px)",
            mixBlendMode: "screen",
            opacity: 0,
          }}
        />
      ))}

      <style>{IDLE_KEYFRAMES}</style>

      {/* ① — the only control in the whole experience: an invisible
          hotspot over the tunnel opening already drawn by scene-07.jpg
          above. No duplicate image, no drawn dot, no logo, no START screen. */}
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
