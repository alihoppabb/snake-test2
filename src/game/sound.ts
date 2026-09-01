let ctx: AudioContext | null = null;
let muted = false;

export function setSfxMuted(m: boolean) {
  muted = m;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AC) ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  slide?: number;
  delay?: number;
}

function tone(freq: number, dur: number, opts: ToneOpts = {}) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const { type = "square", vol = 0.05, slide = 0, delay = 0 } = opts;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

export const sfx = {
  eat() {
    tone(540, 0.08, { vol: 0.045 });
    tone(810, 0.09, { vol: 0.04, delay: 0.05 });
  },
  gold() {
    [660, 880, 1320].forEach((f, i) =>
      tone(f, 0.11, { type: "triangle", vol: 0.05, delay: i * 0.06 }),
    );
  },
  die() {
    tone(320, 0.4, { type: "sawtooth", vol: 0.055, slide: -260 });
    tone(150, 0.5, { type: "square", vol: 0.045, slide: -100, delay: 0.09 });
  },
  click() {
    tone(880, 0.05, { type: "triangle", vol: 0.03 });
  },
  pause() {
    tone(460, 0.08, { type: "triangle", vol: 0.035 });
    tone(330, 0.09, { type: "triangle", vol: 0.035, delay: 0.07 });
  },
  start() {
    [392, 523, 659].forEach((f, i) =>
      tone(f, 0.09, { type: "triangle", vol: 0.04, delay: i * 0.07 }),
    );
  },
};
