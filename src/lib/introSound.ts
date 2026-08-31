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

// --- Opening score: two supplied music beds (real recordings, not synthesis) ---
// Rock Cinematic plays 0 -> 6.4s (synced to the final lighting stage);
// after a short gap, Epic Hybrid Logo enters as the "the base woke up" hit,
// then fades out naturally into the HOME transition.
const ROCK_URL = "/sounds/rock-cinematic.mp3";
const LOGO_URL = "/sounds/epic-hybrid-logo.mp3";
let rockBuffer: AudioBuffer | null = null;
let logoBuffer: AudioBuffer | null = null;
let scoreLoadPromise: Promise<void> | null = null;

// --- Diagnostic-only state, read by the on-screen debug overlay. Not used
// by playback itself; purely observational so a real device (where
// DevTools isn't available) can show what actually happened. ---
export type ScoreDiagnostics = {
  rockFetchStatus: string;
  rockDecodeStatus: string;
  rockBufferDuration: number | null;
  realScoreStartedAt: number | null;
};
const scoreDiagnostics: ScoreDiagnostics = {
  rockFetchStatus: "pending",
  rockDecodeStatus: "pending",
  rockBufferDuration: null,
  realScoreStartedAt: null,
};
export function getScoreDiagnostics(): ScoreDiagnostics {
  return { ...scoreDiagnostics };
}
export function getAudioContextSnapshot(): { state: string; currentTime: number } | null {
  if (!ctx) return null;
  return { state: ctx.state, currentTime: ctx.currentTime };
}

async function decodeUrl(c: AudioContext, url: string, label?: "rock"): Promise<AudioBuffer> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    if (label === "rock") scoreDiagnostics.rockFetchStatus = `network error: ${String(e)}`;
    throw e;
  }
  if (label === "rock") scoreDiagnostics.rockFetchStatus = `${res.status} ${res.ok ? "OK" : "NG"}`;
  const arr = await res.arrayBuffer();
  try {
    const buf = await c.decodeAudioData(arr);
    if (label === "rock") {
      scoreDiagnostics.rockDecodeStatus = "success";
      scoreDiagnostics.rockBufferDuration = buf.duration;
    }
    return buf;
  } catch (e) {
    if (label === "rock") scoreDiagnostics.rockDecodeStatus = `error: ${String(e)}`;
    throw e;
  }
}

/**
 * Kick off fetch+decode of both opening-score files as early as page load
 * allows (no gesture needed for this part). Returns the load promise so
 * callers can gate the tap itself on both buffers being ready — the tap
 * handler must never fetch/decode/await anything, only schedule
 * already-decoded buffers.
 */
export function preloadOpeningScore(): Promise<void> {
  const c = getContext();
  if (!c) return Promise.resolve();
  if (!scoreLoadPromise) {
    scoreLoadPromise = (async () => {
      const [rock, logo] = await Promise.all([decodeUrl(c, ROCK_URL, "rock"), decodeUrl(c, LOGO_URL)]);
      rockBuffer = rock;
      logoBuffer = logo;
    })();
  }
  return scoreLoadPromise;
}

let audioUnlocked = false;

/**
 * Must be called SYNCHRONOUSLY, as the first thing in the tap handler,
 * before anything else. Safari can report AudioContext.state as
 * "interrupted" (a Safari-specific state, not just the spec's
 * "suspended") when playback was blocked before this gesture; gating
 * resume() on one specific state string previously left it uncalled in
 * that case, and — separately — awaiting resume()'s promise before
 * starting playback (the earlier architecture) could itself drop the
 * gesture association on iOS. So: call resume() unconditionally
 * (a no-op if already running) and never await it here; start a real
 * buffer in the same synchronous tick to lock in permission for the rest
 * of this page load.
 */
function unlockAudio(): AudioContext | null {
  const c = getContext();
  if (!c || !masterGain) return null;
  if (c.state !== "running") void c.resume();
  if (!audioUnlocked) {
    const silent = c.createBuffer(1, 1, c.sampleRate);
    const src = c.createBufferSource();
    src.buffer = silent;
    src.connect(masterGain);
    src.start(0);
    audioUnlocked = true;
  }
  return c;
}

/**
 * Rock Cinematic (0 -> 6.4s, the track's own natural build-and-decay arc)
 * immediately followed by a 0.15s silence, then a trimmed excerpt of Epic
 * Hybrid Logo (starting at its own quiet dip, offset 3.5s in the source,
 * so its actual peak hit lands ~0.65s after it starts — right after the
 * final lamp lights) softened in level and brightness, fading out into the
 * HOME transition.
 *
 * Must be called synchronously from the tap handler with both buffers
 * already decoded (the caller gates the tap on isScoreReady()) — no
 * fetch/decode/await happens in here, only nodes being created and
 * started on already-prepared AudioBuffers, so every start() call lands
 * in the same synchronous gesture tick as unlockAudio() above.
 */
export function startOpeningScore(): void {
  const c = unlockAudio();
  if (!c || !masterGain || !rockBuffer || !logoBuffer) return;

  const t0 = c.currentTime;
  const rockDuration = 6.4;
  const gap = 0.15;
  const logoOffset = 3.5;
  const logoDuration = 4.5;
  const logoStart = t0 + rockDuration + gap;

  const rockSrc = c.createBufferSource();
  rockSrc.buffer = rockBuffer;
  const rockGain = c.createGain();
  rockGain.gain.setValueAtTime(0.7, t0);
  rockGain.gain.setValueAtTime(0.7, t0 + rockDuration - 0.15);
  rockGain.gain.exponentialRampToValueAtTime(0.0001, t0 + rockDuration);
  rockSrc.connect(rockGain).connect(masterGain);
  scoreDiagnostics.realScoreStartedAt = c.currentTime;
  rockSrc.start(t0, 0, rockDuration);

  const logoSrc = c.createBufferSource();
  logoSrc.buffer = logoBuffer;
  const logoFilter = c.createBiquadFilter();
  logoFilter.type = "highshelf";
  logoFilter.frequency.value = 5000;
  logoFilter.gain.value = -6;
  const logoGain = c.createGain();
  logoGain.gain.setValueAtTime(0.001, logoStart);
  logoGain.gain.exponentialRampToValueAtTime(0.55, logoStart + 0.12);
  logoGain.gain.setValueAtTime(0.55, logoStart + logoDuration - 1.0);
  logoGain.gain.exponentialRampToValueAtTime(0.0001, logoStart + logoDuration);
  logoSrc.connect(logoFilter).connect(logoGain).connect(masterGain);
  logoSrc.start(logoStart, logoOffset, logoDuration);
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
