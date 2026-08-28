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
  A_END,
  B_END,
  C_END,
  C_HOLD_END,
  D_END,
  D_HOLD_END,
  E_CROSSFADE_END,
  F_HOLD_END,
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
type MaskableEl = HTMLDivElement & { style: CSSStyleDeclaration & { webkitMaskImage: string } };

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
 * HOME opening built from 4 approved master images — scene-02 (起動),
 * scene-03 (リング形成), scene-08 (トンネル奥に秘密基地を発見), scene-09
 * (基地へ到着・照明) — plus the real HOME underneath. One continuous
 * requestAnimationFrame loop drives every layer's opacity/transform/mask
 * directly via refs (never through React state), so:
 *
 * 1) scale is ONE shared, piecewise curve across the whole tap→HOME
 *    timeline — it never resets at an image handoff, only its *velocity*
 *    changes (near-zero during holds, fast during pushes: 動く→溜める→
 *    見せる→また動く), and
 * 2) a re-render from something unrelated (mute button, etc.) can never
 *    stomp on the in-flight animation, since JSX never sets these layers'
 *    opacity/transform itself.
 *
 * scene-08 and scene-09 are deliberately NOT treated as "the next slide":
 * 08 holds alone as a distant discovery beat, the 08→09 handoff carries a
 * brief exposure dip (not a plain crossfade), and 09 arrives dim, then
 * lights up through 5 explicitly staged, snap-then-hold lamp reveals
 * before HOME is even reachable.
 */
export function OpeningSequence({ exitDurationMs }: OpeningSequenceProps) {
  const mode = useIntroMode();
  const reducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<Phase>("gate");
  const [gateIdle, setGateIdle] = useState(true);
  const [muted, setMutedState] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const l2Ref = useRef<MaskableEl>(null);
  const l3Ref = useRef<HTMLDivElement>(null);
  const l4Ref = useRef<HTMLDivElement>(null);
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
      const scaleStr = `scale(${scaleAt(t)})`;

      const l1 = l1Ref.current;
      const l2 = l2Ref.current;
      const l3 = l3Ref.current;
      const l4 = l4Ref.current;
      const scrim = scrimRef.current;

      if (t <= A_END) {
        // SCENE A — 起動: the light reacts and energy builds. Nothing new
        // is drawn — the existing light in scene-02 just intensifies —
        // but it must NOT feel like an instant jump to SCENE B.
        const u = smoothstep(t / A_END);
        if (l1) {
          l1.style.opacity = "1";
          l1.style.transform = scaleStr;
          l1.style.filter = `brightness(${(1 + u * 0.22).toFixed(3)})`;
        }
        if (l2) l2.style.opacity = "0";
        if (l3) l3.style.opacity = "0";
        if (l4) l4.style.opacity = "0";
      } else if (t <= B_END) {
        // SCENE B — リング形成: scene-03 is revealed through a disc that
        // grows outward from the center (not a plain crossfade), while
        // scene-02 stays fully present through the first half so the ring
        // reads as emerging FROM that light, not replacing it.
        const u = smoothstep((t - A_END) / (B_END - A_END));
        if (l1) {
          l1.style.opacity = String(1 - smoothstep(Math.max(0, (u - 0.5) / 0.5)));
          l1.style.transform = scaleStr;
          l1.style.filter = "brightness(1.22)";
        }
        if (l2) {
          const revealR = u * 115;
          const maskStr = `radial-gradient(circle at 50% 50%, black 0%, black ${revealR.toFixed(1)}%, transparent ${(revealR + 10).toFixed(1)}%, transparent 100%)`;
          l2.style.opacity = String(u);
          l2.style.transform = scaleStr;
          l2.style.filter = "none";
          l2.style.maskImage = maskStr;
          l2.style.webkitMaskImage = maskStr;
        }
        if (l3) l3.style.opacity = "0";
        if (l4) l4.style.opacity = "0";
      } else if (t <= C_HOLD_END) {
        // SCENE C — 溜め: the ring holds, fully formed, motionless — the
        // beat before the burst. Nothing changes here except the (tiny)
        // shared scale creep.
        if (l1) l1.style.opacity = "0";
        if (l2) {
          l2.style.opacity = "1";
          l2.style.transform = scaleStr;
          l2.style.filter = "none";
          l2.style.maskImage = "none";
          l2.style.webkitMaskImage = "none";
        }
        if (l3) l3.style.opacity = "0";
        if (l4) l4.style.opacity = "0";
      } else if (t <= C_END) {
        // SCENE C — 突破: a hard burst through the ring's own center — a
        // fast-growing mask hole reveals scene-08 through the ring image
        // itself, with a blur pulse at the burst instant, before the ring
        // fades away.
        const u = (t - C_HOLD_END) / (C_END - C_HOLD_END);
        if (l1) l1.style.opacity = "0";
        const holeRadius = Math.pow(u, 1.4) * 150;
        const l2Opacity = 1 - smoothstep((u - 0.6) / 0.4);
        const l2Blur = Math.sin(Math.min(1, u / 0.7) * Math.PI) * 5;
        const maskStr = `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${holeRadius.toFixed(1)}%, black ${(holeRadius + 8).toFixed(1)}%, black 100%)`;
        if (l2) {
          l2.style.opacity = String(l2Opacity);
          l2.style.transform = scaleStr;
          l2.style.filter = l2Blur > 0.05 ? `blur(${l2Blur.toFixed(2)}px)` : "none";
          l2.style.maskImage = maskStr;
          l2.style.webkitMaskImage = maskStr;
        }
        if (l3) {
          l3.style.opacity = String(smoothstep((u - 0.3) / 0.7));
          l3.style.transform = scaleStr;
        }
        if (l4) l4.style.opacity = "0";
      } else if (t <= D_HOLD_END) {
        // SCENE D — 発見の溜め: scene-08 alone, essentially motionless —
        // long enough to register "there's a tunnel, and a base exists at
        // the far end of it" before the camera moves again.
        if (l1) l1.style.opacity = "0";
        if (l2) {
          l2.style.opacity = "0";
          l2.style.filter = "none";
          l2.style.maskImage = "none";
          l2.style.webkitMaskImage = "none";
        }
        if (l3) {
          l3.style.opacity = "1";
          l3.style.transform = scaleStr;
        }
        if (l4) l4.style.opacity = "0";
      } else if (t <= D_END) {
        // SCENE D — 前進: still just scene-08, alone — only the shared
        // scale keeps climbing, at a deliberately steady, unhurried rate.
        if (l3) {
          l3.style.opacity = "1";
          l3.style.transform = scaleStr;
        }
        if (l4) l4.style.opacity = "0";
      } else if (t <= E_CROSSFADE_END) {
        // SCENE E — 到着（露出ディップ）: scene-08 → scene-09 is not a
        // plain crossfade — a brief exposure dip (both layers briefly
        // darken then recover) reads as "arriving/adjusting", which is
        // what keeps two similar compositions from reading as the same
        // picture shown twice. The scrim is already ramping up underneath
        // so scene-09 never flashes bright before its lighting reveal.
        const u = smoothstep((t - D_END) / (E_CROSSFADE_END - D_END));
        const dipBrightness = 1 - Math.sin(u * Math.PI) * 0.35;
        if (l3) {
          l3.style.opacity = String(1 - u);
          l3.style.transform = scaleStr;
          l3.style.filter = `brightness(${dipBrightness.toFixed(3)})`;
        }
        if (l4) {
          l4.style.opacity = String(u);
          l4.style.transform = scaleStr;
          l4.style.filter = `brightness(${dipBrightness.toFixed(3)})`;
        }
        if (scrim) scrim.style.opacity = String(u * STAGE_SCRIM[0]);
      } else if (t <= STAGE_BOUNDS[STAGE_BOUNDS.length - 1]) {
        // SCENE E — 照明が1灯ずつ点灯: a dark scrim lifts in 5 explicit
        // snap-then-hold steps (中央奥→左→右→天井・周辺→部屋全体), each
        // with its own local light bloom punching on — never a uniform
        // brightness ramp, and never all at once.
        if (l3) l3.style.opacity = "0";
        if (l4) {
          l4.style.opacity = "1";
          l4.style.transform = scaleStr;
          l4.style.filter = "none";
        }
        let stageIndex = 0;
        for (let i = 0; i < STAGE_BOUNDS.length - 1; i++) {
          if (t <= STAGE_BOUNDS[i + 1]) {
            stageIndex = i;
            break;
          }
        }
        const stageStart = STAGE_BOUNDS[stageIndex];
        const localT = t - stageStart;
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
      } else if (t <= F_HOLD_END) {
        // SCENE F — 余韻: the finished base, fully lit, held — long enough
        // to register "this is Free Feel Toy" before anything moves again.
        if (l4) {
          l4.style.opacity = "1";
          l4.style.transform = scaleStr;
        }
        if (scrim) scrim.style.opacity = "0";
        bloomRefs.current.forEach((el) => {
          if (el) el.style.opacity = "1";
        });
      } else {
        // SCENE F — HOMEへ接続: scene-09 keeps scaling while the whole
        // overlay dissolves into the real HOME beneath — the base itself
        // becoming the site, never a hard cut to a new screen.
        if (l4) {
          l4.style.opacity = "1";
          l4.style.transform = scaleStr;
        }
        if (wrapperRef.current) {
          const u = smoothstep((t - F_HOLD_END) / (TOTAL_DURATION - F_HOLD_END));
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

  // SCENE A: tapping the light is the only gesture in the whole
  // experience. It unlocks audio and launches the single continuous
  // camera-timeline that carries the rest of the sequence.
  async function handleIgnite() {
    const ok = await resumeAudio();
    if (ok) startAmbient();
    playClick();
    setGateIdle(false);
    if (l1Ref.current) l1Ref.current.style.animation = "none"; // stop the idle CSS animation before rAF takes over transform/opacity
    setPhase("sequence");

    // SCENE A — energy charging up.
    timers.current.push(setTimeout(() => playElectricHum(1100), 100));
    timers.current.push(setTimeout(() => playMechanicalHum(1300), 600));
    // SCENE B — the ring's slow rise.
    timers.current.push(setTimeout(() => playWarpRise(1900), A_END + 60));
    // SCENE C — the burst, timed to land mid-way through it.
    timers.current.push(setTimeout(() => playWhoosh(350), C_HOLD_END + (C_END - C_HOLD_END) * 0.5));
    // SCENE D — one continuous traveling tone through the whole push.
    timers.current.push(setTimeout(() => playWarpRise(D_END - D_HOLD_END + 300), D_HOLD_END));
    // SCENE E — four staged lamp clicks ("カチッ……カチッ……カチッ……カチッ"); the 5th stage (部屋全体) settles without a click.
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

      {/* SCENE E — dark scrim over scene-09, lifted in 5 explicit steps. */}
      <div ref={scrimRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />

      {/* SCENE E — the 5 staged lamp-bloom accents (中央奥・左・右・天井/周辺・部屋全体), punching through the scrim above one at a time. */}
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
