export const COLS = 21;
export const ROWS = 21;
export const CELL = 30; // logical px
export const BOARD = COLS * CELL; // 630

export type Vec = { x: number; y: number };
export type Phase = "menu" | "playing" | "paused" | "over";
export type DifficultyId = "easy" | "normal" | "hard";

export interface DifficultyDef {
  id: DifficultyId;
  label: string;
  interval: number; // мс на клетку
  mult: number; // множитель очков
  dot: string; // цвет точки в селекторе
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyDef> = {
  easy: { id: "easy", label: "Лёгкий", interval: 165, mult: 1, dot: "#a3e635" },
  normal: { id: "normal", label: "Средний", interval: 122, mult: 2, dot: "#fbbf24" },
  hard: { id: "hard", label: "Сложный", interval: 88, mult: 3, dot: "#f87171" },
};

export const MIN_INTERVAL = 68;
export const GOLD_TTL = 6500;
export const GOLD_CHANCE = 0.22;

export type FoodKind = "apple" | "gold";

export interface GoldFood {
  x: number;
  y: number;
  ttl: number;
  max: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  kind: "dot" | "text";
  text?: string;
  gravity: number;
}

export interface EngineState {
  snake: Vec[];
  prevSnake: Vec[];
  dir: Vec;
  queue: Vec[];
  food: Vec;
  gold: GoldFood | null;
  grow: number;
  score: number;
  eaten: number;
  interval: number;
  particles: Particle[];
  shake: number;
}

export type StepEvent =
  | { type: "eat"; cell: Vec; pts: number }
  | { type: "gold"; cell: Vec; pts: number }
  | { type: "die"; cell: Vec };

function rand(n: number) {
  return Math.floor(Math.random() * n);
}

function freeCell(s: EngineState | null, snake: Vec[]): Vec {
  const occupied = new Set(snake.map((c) => `${c.x},${c.y}`));
  if (s?.food) occupied.add(`${s.food.x},${s.food.y}`);
  if (s?.gold) occupied.add(`${s.gold.x},${s.gold.y}`);
  const free: Vec[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
  return free.length ? free[rand(free.length)] : { x: 0, y: 0 };
}

export function createState(diff: DifficultyId): EngineState {
  const cx = Math.floor(COLS / 2);
  const cy = Math.floor(ROWS / 2);
  const snake: Vec[] = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
  const s: EngineState = {
    snake,
    prevSnake: snake,
    dir: { x: 1, y: 0 },
    queue: [],
    food: { x: cx + 5, y: cy },
    gold: null,
    grow: 0,
    score: 0,
    eaten: 0,
    interval: DIFFICULTIES[diff].interval,
    particles: [],
    shake: 0,
  };
  s.food = freeCell(s, snake);
  return s;
}

export function enqueueDir(s: EngineState, d: Vec) {
  const last = s.queue.length ? s.queue[s.queue.length - 1] : s.dir;
  if (last.x === d.x && last.y === d.y) return; // тот же курс
  if (last.x === -d.x && last.y === -d.y) return; // разворот на 180°
  if (s.queue.length < 3) s.queue.push(d);
}

export function step(s: EngineState, diff: DifficultyId): StepEvent[] {
  const events: StepEvent[] = [];
  const d = s.queue.shift() ?? s.dir;
  s.dir = d;

  const head = s.snake[0];
  const nx = head.x + d.x;
  const ny = head.y + d.y;

  if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) {
    return [{ type: "die", cell: { x: nx, y: ny } }];
  }

  const willEat = nx === s.food.x && ny === s.food.y;
  const willGold = !!s.gold && nx === s.gold.x && ny === s.gold.y;

  const body = willEat || willGold ? s.snake : s.snake.slice(0, -1);
  if (body.some((c) => c.x === nx && c.y === ny)) {
    return [{ type: "die", cell: { x: nx, y: ny } }];
  }

  s.prevSnake = s.snake;
  s.snake = [{ x: nx, y: ny }, ...s.snake];
  if (s.grow > 0) s.grow--;
  else s.snake.pop();

  const mult = DIFFICULTIES[diff].mult;

  if (willEat) {
    const pts = 10 * mult;
    s.score += pts;
    s.eaten++;
    s.interval = Math.max(
      MIN_INTERVAL,
      DIFFICULTIES[diff].interval - s.eaten * 2.2,
    );
    s.food = freeCell(s, s.snake);
    if (!s.gold && Math.random() < GOLD_CHANCE) {
      const c = freeCell(s, s.snake);
      s.gold = { x: c.x, y: c.y, ttl: GOLD_TTL, max: GOLD_TTL };
    }
    events.push({ type: "eat", cell: { x: nx, y: ny }, pts });
  }

  if (willGold && s.gold) {
    const pts = 50 * mult;
    s.score += pts;
    s.grow += 2;
    s.gold = null;
    events.push({ type: "gold", cell: { x: nx, y: ny }, pts });
  }

  return events;
}

/* ---------- localStorage ---------- */

const bestKey = (d: DifficultyId) => `zmeika:best:${d}`;

export function loadBest(d: DifficultyId): number {
  try {
    return Number(localStorage.getItem(bestKey(d))) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(d: DifficultyId, v: number) {
  try {
    localStorage.setItem(bestKey(d), String(v));
  } catch {
    /* noop */
  }
}

export function loadDifficulty(): DifficultyId {
  try {
    const v = localStorage.getItem("zmeika:difficulty");
    if (v === "easy" || v === "normal" || v === "hard") return v;
  } catch {
    /* noop */
  }
  return "normal";
}

export function saveDifficulty(d: DifficultyId) {
  try {
    localStorage.setItem("zmeika:difficulty", d);
  } catch {
    /* noop */
  }
}

export function loadMuted(): boolean {
  try {
    return localStorage.getItem("zmeika:muted") === "1";
  } catch {
    return false;
  }
}

export function saveMuted(m: boolean) {
  try {
    localStorage.setItem("zmeika:muted", m ? "1" : "0");
  } catch {
    /* noop */
  }
}
