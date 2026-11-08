let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function audio() {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  if (!noise) {
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return { ctx, noise };
}

// Creating the AudioContext can take tens of milliseconds, so do it before the first shot.
// Browsers start it suspended until a click, which playShot then resumes.
export function warmUpAudio() {
  audio();
}

function envelope(ctx: AudioContext, peak: number, attack: number, release: number) {
  const gain = ctx.createGain();
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  gain.connect(ctx.destination);
  return gain;
}

export function playShot() {
  const { ctx, noise } = audio();
  const t = ctx.currentTime;

  const crack = ctx.createBufferSource();
  crack.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2400, t);
  filter.frequency.exponentialRampToValueAtTime(500, t + 0.12);
  crack.connect(filter).connect(envelope(ctx, 0.35, 0.002, 0.14));
  crack.start(t);
  crack.stop(t + 0.2);

  const thump = ctx.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(150, t);
  thump.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  thump.connect(envelope(ctx, 0.4, 0.003, 0.13));
  thump.start(t);
  thump.stop(t + 0.18);
}

export function playHit() {
  const { ctx } = audio();
  const t = ctx.currentTime;
  [1320, 1980].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t + i * 0.05);
    osc.connect(envelope(ctx, 0.12, 0.004, 0.16));
    osc.start(t + i * 0.05);
    osc.stop(t + i * 0.05 + 0.22);
  });
}
