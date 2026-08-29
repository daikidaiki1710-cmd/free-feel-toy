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

/** Rising sweep + filter opening — the "ブゥゥゥワーーーン" of accelerating into the warp tunnel. */
export function playWarpRise(duration = 1700) {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const seconds = duration / 1000;
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(70, t);
  osc.frequency.exponentialRampToValueAtTime(260, t + seconds);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(450, t);
  filter.frequency.exponentialRampToValueAtTime(2200, t + seconds);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.14, t + seconds * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(filter).connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + seconds + 0.1);
}

/** A quick downward-pitched "シュン" — passing through the white flash at the end of the tunnel. */
export function playWhoosh(duration = 320) {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const seconds = duration / 1000;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + seconds);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + seconds * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + seconds + 0.1);
}

let noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const length = c.sampleRate * 2;
    noiseBuffer = c.createBuffer(1, length, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** A very thin, quiet low-frequency space tone — held under the camera's forward push through the tunnel, not a "sweep" or SFX. */
export function playApproachDrone(duration = 2400) {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const seconds = duration / 1000;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.045, t + seconds * 0.35);
  g.gain.exponentialRampToValueAtTime(0.03, t + seconds * 0.75);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 260;
  [46, 46.7].forEach((freq) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + seconds + 0.15);
  });
  filter.connect(g).connect(masterGain);

  // A whisper of filtered noise for spatial grain, well under the tone itself.
  const noise = c.createBufferSource();
  noise.buffer = getNoiseBuffer(c);
  noise.loop = true;
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 320;
  noiseFilter.Q.value = 0.6;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.0001, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.012, t + seconds * 0.4);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);
  noise.start(t);
  noise.stop(t + seconds + 0.15);
}

/** The low tone dropping slightly deeper right as the base is reached — not a new sound, a subtle shift in the one already playing. */
export function playArrivalDeepen(duration = 700) {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const seconds = duration / 1000;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(50, t);
  osc.frequency.exponentialRampToValueAtTime(35, t + seconds);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + seconds * 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + seconds + 0.1);
}

/** A single dull mechanical latch — the first lamp only. Deliberately not the bright "click" used elsewhere, so lighting doesn't read as a repeated game-confirm sound. */
export function playMechanicalLatch() {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const noise = c.createBufferSource();
  noise.buffer = getNoiseBuffer(c);
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 550;
  const noiseGain = envelope(c, t, 0.004, 0.06, 0.05);
  noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);
  noise.start(t);
  noise.stop(t + 0.09);

  const thump = c.createOscillator();
  thump.type = "triangle";
  thump.frequency.setValueAtTime(130, t);
  thump.frequency.exponentialRampToValueAtTime(85, t + 0.09);
  const thumpGain = envelope(c, t, 0.006, 0.09, 0.09);
  thump.connect(thumpGain).connect(masterGain);
  thump.start(t);
  thump.stop(t + 0.12);
}

/** A soft electrical/spatial rise-and-settle — used for each lamp after the first. Pass a slightly different frequency per call so consecutive lights don't sound identical. */
export function playElectricSwell(duration = 500, baseFreq = 140) {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const seconds = duration / 1000;
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(baseFreq * 0.8, t);
  osc.frequency.exponentialRampToValueAtTime(baseFreq, t + seconds * 0.5);
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = baseFreq * 3;
  filter.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.07, t + seconds * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(filter).connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + seconds + 0.1);
}

/** The whole space powering on — a low warm swell and a thin high shimmer spreading together, no percussive attack. Used once, for the final lamp stage. */
export function playFullPowerSwell(duration = 1500) {
  const c = ctx;
  if (!c || !masterGain) return;
  const t = c.currentTime;
  const seconds = duration / 1000;

  const low = c.createOscillator();
  low.type = "sine";
  low.frequency.value = 55;
  const lowGain = c.createGain();
  lowGain.gain.setValueAtTime(0.0001, t);
  lowGain.gain.exponentialRampToValueAtTime(0.07, t + seconds * 0.45);
  lowGain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  low.connect(lowGain).connect(masterGain);
  low.start(t);
  low.stop(t + seconds + 0.15);

  const high = c.createOscillator();
  high.type = "sine";
  high.frequency.value = 2200;
  const highFilter = c.createBiquadFilter();
  highFilter.type = "bandpass";
  highFilter.frequency.value = 2200;
  highFilter.Q.value = 1.2;
  const highGain = c.createGain();
  highGain.gain.setValueAtTime(0.0001, t + seconds * 0.15);
  highGain.gain.exponentialRampToValueAtTime(0.02, t + seconds * 0.55);
  highGain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  high.connect(highFilter).connect(highGain).connect(masterGain);
  high.start(t);
  high.stop(t + seconds + 0.15);

  const noise = c.createBufferSource();
  noise.buffer = getNoiseBuffer(c);
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 900;
  noiseFilter.Q.value = 0.5;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.0001, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.015, t + seconds * 0.4);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);
  noise.start(t);
  noise.stop(t + seconds + 0.15);
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
