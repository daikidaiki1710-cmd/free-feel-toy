"use client";

/**
 * Web Audio-synthesized sound design for the HOME opening sequence — no
 * audio files are loaded (zero extra network weight). Every sound is a
 * short oscillator burst shaped with a gain envelope. If real recorded SFX
 * ever replace these, only this module needs to change; callers just hear
 * "click"/"hum"/"ambient" and don't know how they're produced.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!ctx) {
    ctx = new AudioContextCtor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

/** Must be called from a user gesture handler (tap/click) to satisfy iOS/Safari autoplay policy. */
export async function resumeAudio(): Promise<boolean> {
  const c = getContext();
  if (!c) return false;
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      return false;
    }
  }
  return c.state === "running";
}

export function setMuted(muted: boolean) {
  if (masterGain) masterGain.gain.value = muted ? 0 : 0.5;
}

function envelope(c: AudioContext, at: number, attack: number, peak: number, release: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
  return g;
}

/** A small, dry switch "click" — used for each light turning on. */
export function playClick() {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(1100, t);
  osc.frequency.exponentialRampToValueAtTime(380, t + 0.035);
  const g = envelope(c, t, 0.002, 0.22, 0.045);
  osc.connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.09);
}

/** A brief electrical "spark/power-up" tick, layered under the mechanical hum. */
export function playElectricHum(duration = 0.5) {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, t);
  osc.frequency.exponentialRampToValueAtTime(95, t + duration);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const g = envelope(c, t, 0.06, 0.1, duration);
  osc.connect(filter).connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + duration + 0.1);
}

/** The low "ブゥン……" as the whole space wakes up. */
export function playMechanicalHum(duration = 1.1) {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(58, t);
  const g = envelope(c, t, 0.28, 0.16, duration);
  osc.connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + duration + 0.2);
}

/** Very quiet two-tone room-tone bed, held under the whole sequence and faded on exit (doubles as the closing "余韻"). */
export function startAmbient() {
  const c = ctx;
  if (!c || !masterGain || ambientNodes.length) return;
  ambientNodes = [55, 110].map((freq) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.018, c.currentTime + 1.4);
    osc.connect(g).connect(masterGain!);
    osc.start();
    return { osc, gain: g };
  });
}

export function stopAmbient(fadeSeconds = 1.1) {
  const c = ctx;
  if (!c) return;
  const t = c.currentTime;
  ambientNodes.forEach(({ osc, gain }) => {
    gain.gain.exponentialRampToValueAtTime(0.0001, t + fadeSeconds);
    osc.stop(t + fadeSeconds + 0.15);
  });
  ambientNodes = [];
}
