import { BOARD, CELL, COLS, ROWS } from "./engine";
import type { EngineState, Particle, Phase, Vec } from "./engine";

/* ---------- helpers ---------- */

function hex2rgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const A = hex2rgb(a);
  const B = hex2rgb(b);
  const r = Math.round(A[0] + (B[0] - A[0]) * t);
  const g = Math.round(A[1] + (B[1] - A[1]) * t);
  const bl = Math.round(A[2] + (B[2] - A[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

const HEAD_C = "#d3f76f";
const MID_C = "#84cc16";
const TAIL_C = "#0f8f68";

function snakeColor(u: number): string {
  return u < 0.5 ? mix(HEAD_C, MID_C, u * 2) : mix(MID_C, TAIL_C, (u - 0.5) * 2);
}

const px = (c: number) => (c + 0.5) * CELL;

/* ---------- fx ---------- */

export function spawnBurst(s: EngineState, cell: Vec, colors: string[], n: number) {
  const x = px(cell.x);
  const y = px(cell.y);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 140;
    s.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 30,
      life: 0.55 + Math.random() * 0.35,
      max: 0.9,
      size: 2 + Math.random() * 3.4,
      color: colors[i % colors.length],
      kind: "dot",
      gravity: 240,
    });
  }
}

export function spawnText(s: EngineState, cell: Vec, text: string, color: string) {
  s.particles.push({
    x: px(cell.x),
    y: px(cell.y) - 8,
    vx: 0,
    vy: -46,
    life: 0.85,
    max: 0.85,
    size: 15,
    color,
    kind: "text",
    text,
    gravity: -18,
  });
}

export function updateFx(s: EngineState, dt: number) {
  s.shake = Math.max(0, s.shake - dt * 2.4);
  const alive: Particle[] = [];
  for (const p of s.particles) {
    p.life -= dt;
    if (p.life <= 0) continue;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    alive.push(p);
  }
  s.particles = alive;
}

/* ---------- frame ---------- */

export interface ViewOpts {
  t: number; // интерполяция 0..1
  time: number; // мс
  phase: Phase;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function renderGame(ctx: CanvasRenderingContext2D, s: EngineState, v: ViewOpts) {
  ctx.clearRect(0, 0, BOARD, BOARD);

  ctx.save();
  if (s.shake > 0) {
    const m = s.shake * 7;
    ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
  }

  /* поле: шахматная подложка */
  ctx.fillStyle = "#08170f";
  ctx.fillRect(0, 0, BOARD, BOARD);
  ctx.fillStyle = "rgba(163, 230, 53, 0.028)";
  for (let y = 0; y < ROWS; y++) {
    for (let x = (y % 2); x < COLS; x += 2) {
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
  }

  /* мягкое внутреннее свечение */
  const bg = ctx.createRadialGradient(BOARD / 2, BOARD / 2, 60, BOARD / 2, BOARD / 2, BOARD * 0.72);
  bg.addColorStop(0, "rgba(132, 204, 22, 0.05)");
  bg.addColorStop(1, "rgba(0, 0, 0, 0.28)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, BOARD, BOARD);

  /* яблоко */
  drawApple(ctx, s, v.time);

  /* золотая звезда */
  if (s.gold) drawGold(ctx, s, v.time);

  /* змейка */
  drawSnake(ctx, s, v);

  /* частицы */
  drawParticles(ctx, s);

  /* рамка */
  const frameColor =
    v.phase === "over"
      ? "rgba(248, 113, 113, 0.75)"
      : v.phase === "paused"
        ? "rgba(251, 191, 36, 0.55)"
        : "rgba(163, 230, 53, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeStyle = frameColor;
  ctx.shadowColor = frameColor;
  ctx.shadowBlur = 14;
  roundRectPath(ctx, 3, 3, BOARD - 6, BOARD - 6, 14);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawApple(ctx: CanvasRenderingContext2D, s: EngineState, time: number) {
  const x = px(s.food.x);
  const y = px(s.food.y);
  const pulse = 1 + Math.sin(time / 260) * 0.08;
  const r = CELL * 0.34 * pulse;

  ctx.save();
  const glow = ctx.createRadialGradient(x, y, 2, x, y, CELL * 0.95);
  glow.addColorStop(0, "rgba(251, 113, 113, 0.35)");
  glow.addColorStop(1, "rgba(251, 113, 113, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - CELL, y - CELL, CELL * 2, CELL * 2);

  const body = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.2, x, y, r * 1.15);
  body.addColorStop(0, "#fda4af");
  body.addColorStop(0.55, "#f87171");
  body.addColorStop(1, "#dc2626");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  /* листик */
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.ellipse(x + r * 0.35, y - r * 1.15, r * 0.42, r * 0.2, -0.6, 0, Math.PI * 2);
  ctx.fill();

  /* блик */
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.38, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGold(ctx: CanvasRenderingContext2D, s: EngineState, time: number) {
  const g = s.gold!;
  const x = px(g.x);
  const y = px(g.y);
  const frac = Math.max(0, g.ttl / g.max);
  const blink = g.ttl < 1600 && Math.sin(time / 90) > 0;
  const rot = time / 700;
  const R = CELL * 0.42;

  ctx.save();
  if (blink) ctx.globalAlpha = 0.45;

  const glow = ctx.createRadialGradient(x, y, 2, x, y, CELL * 1.15);
  glow.addColorStop(0, "rgba(251, 191, 36, 0.45)");
  glow.addColorStop(1, "rgba(251, 191, 36, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - CELL * 1.2, y - CELL * 1.2, CELL * 2.4, CELL * 2.4);

  ctx.translate(x, y);
  ctx.rotate(rot);
  const star = ctx.createLinearGradient(-R, -R, R, R);
  star.addColorStop(0, "#fef08a");
  star.addColorStop(1, "#f59e0b");
  ctx.fillStyle = star;
  ctx.shadowColor = "rgba(251,191,36,0.9)";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rr = i % 2 === 0 ? R : R * 0.45;
    const a = (i * Math.PI) / 4;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.rotate(-rot);

  /* кольцо-таймер */
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(254, 240, 138, 0.9)";
  ctx.beginPath();
  ctx.arc(0, 0, CELL * 0.62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
  ctx.stroke();
  ctx.restore();
}

function drawSnake(ctx: CanvasRenderingContext2D, s: EngineState, v: ViewOpts) {
  const n = s.snake.length;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const c = s.snake[i];
    const p = s.prevSnake[Math.min(i, s.prevSnake.length - 1)] ?? c;
    pts.push({
      x: px(p.x + (c.x - p.x) * v.t),
      y: px(p.y + (c.y - p.y) * v.t),
    });
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  /* тень-подложка */
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = CELL * 0.82;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y + 3);
  for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y + 3);
  if (n === 1) ctx.lineTo(pts[0].x + 0.1, pts[0].y + 3);
  ctx.stroke();

  /* тело: сегменты от хвоста к голове */
  ctx.shadowColor = "rgba(163, 230, 53, 0.5)";
  ctx.shadowBlur = 12;
  for (let i = n - 1; i >= 1; i--) {
    const u = i / Math.max(1, n - 1);
    ctx.strokeStyle = snakeColor(u);
    ctx.lineWidth = CELL * (0.74 - 0.3 * u);
    ctx.beginPath();
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[i - 1].x, pts[i - 1].y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  /* голова */
  const h = pts[0];
  const dead = v.phase === "over";
  const hr = CELL * 0.46;
  const hg = ctx.createRadialGradient(h.x - 4, h.y - 5, 2, h.x, h.y, hr * 1.4);
  hg.addColorStop(0, "#ecfccb");
  hg.addColorStop(0.5, HEAD_C);
  hg.addColorStop(1, MID_C);
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(h.x, h.y, hr, 0, Math.PI * 2);
  ctx.fill();

  /* язык */
  if (!dead && v.phase === "playing" && Math.sin(v.time / 340) > 0.55) {
    const d = s.dir;
    const tx = h.x + d.x * hr;
    const ty = h.y + d.y * hr;
    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + d.x * 7, ty + d.y * 7);
    ctx.moveTo(tx + d.x * 7, ty + d.y * 7);
    ctx.lineTo(tx + d.x * 10 - d.y * 3, ty + d.y * 10 - d.x * 3);
    ctx.moveTo(tx + d.x * 7, ty + d.y * 7);
    ctx.lineTo(tx + d.x * 10 + d.y * 3, ty + d.y * 10 + d.x * 3);
    ctx.stroke();
  }

  /* глаза */
  const d = s.dir;
  const exo = d.y !== 0 ? { x: 1, y: 0 } : { x: 0, y: 1 }; // перпендикуляр
  for (const side of [-1, 1]) {
    const ex = h.x + d.x * hr * 0.35 + exo.x * side * hr * 0.45;
    const ey = h.y + d.y * hr * 0.35 + exo.y * side * hr * 0.45;
    if (dead) {
      ctx.strokeStyle = "#1a2e1f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex - 3, ey - 3);
      ctx.lineTo(ex + 3, ey + 3);
      ctx.moveTo(ex + 3, ey - 3);
      ctx.lineTo(ex - 3, ey + 3);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex, ey, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#14261a";
      ctx.beginPath();
      ctx.arc(ex + d.x * 1.5, ey + d.y * 1.5, 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, s: EngineState) {
  ctx.save();
  for (const p of s.particles) {
    const a = Math.max(0, Math.min(1, p.life / p.max));
    ctx.globalAlpha = a;
    if (p.kind === "dot") {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.5 + a * 0.5), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.font = `800 ${p.size}px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillText(p.text ?? "", p.x, p.y);
      ctx.shadowBlur = 0;
    }
  }
  ctx.restore();
}
