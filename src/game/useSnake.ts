import { useCallback, useEffect, useRef, useState } from "react";
import type * as React from "react";
import {
  BOARD,
  DIFFICULTIES,
  createState,
  enqueueDir,
  loadBest,
  loadDifficulty,
  loadMuted,
  saveBest,
  saveDifficulty,
  saveMuted,
  step,
} from "./engine";
import type { DifficultyId, EngineState, Phase, Vec } from "./engine";
import { renderGame, spawnBurst, spawnText, updateFx } from "./render";
import { setSfxMuted, sfx } from "./sound";

export interface SnakeGame {
  phase: Phase;
  difficulty: DifficultyId;
  score: number;
  best: number;
  length: number;
  speedX: number;
  muted: boolean;
  newRecord: boolean;
  start: () => void;
  togglePause: () => void;
  restart: () => void;
  toMenu: () => void;
  setDifficulty: (d: DifficultyId) => void;
  toggleMute: () => void;
  enqueue: (d: Vec) => void;
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
  };
}

export function useSnakeGame(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
): SnakeGame {
  const [difficulty, setDifficultyState] = useState<DifficultyId>(() => loadDifficulty());
  const [phase, setPhaseState] = useState<Phase>("menu");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => loadBest(loadDifficulty()));
  const [length, setLength] = useState(3);
  const [speedX, setSpeedX] = useState(1);
  const [muted, setMutedState] = useState(() => loadMuted());
  const [newRecord, setNewRecord] = useState(false);

  const phaseRef = useRef(phase);
  const diffRef = useRef(difficulty);
  const sRef = useRef<EngineState>(createState(loadDifficulty()));
  const accRef = useRef(0);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setSfxMuted(loadMuted());
  }, []);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  /* ---------- actions ---------- */

  const setDifficulty = useCallback(
    (d: DifficultyId) => {
      if (phaseRef.current !== "menu") return;
      diffRef.current = d;
      setDifficultyState(d);
      saveDifficulty(d);
      setBest(loadBest(d));
      sRef.current = createState(d);
      sfx.click();
    },
    [],
  );

  const reset = useCallback(
    (play: boolean) => {
      sRef.current = createState(diffRef.current);
      accRef.current = 0;
      setScore(0);
      setLength(3);
      setSpeedX(1);
      setNewRecord(false);
      setPhase(play ? "playing" : "menu");
    },
    [setPhase],
  );

  const start = useCallback(() => {
    sfx.start();
    reset(true);
  }, [reset]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "playing") {
      sfx.pause();
      setPhase("paused");
    } else if (phaseRef.current === "paused") {
      sfx.pause();
      setPhase("playing");
    }
  }, [setPhase]);

  const toMenu = useCallback(() => {
    sfx.click();
    reset(false);
  }, [reset]);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      const next = !m;
      setSfxMuted(next);
      saveMuted(next);
      return next;
    });
  }, []);

  const enqueue = useCallback((d: Vec) => {
    if (phaseRef.current !== "playing") return;
    enqueueDir(sRef.current, d);
  }, []);

  /* ---------- keyboard ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.code;
      const dirs: Record<string, Vec> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        KeyW: { x: 0, y: -1 },
        KeyS: { x: 0, y: 1 },
        KeyA: { x: -1, y: 0 },
        KeyD: { x: 1, y: 0 },
      };
      if (dirs[k]) {
        e.preventDefault();
        enqueue(dirs[k]);
        return;
      }
      if (k === "Space" || k === "Enter") {
        e.preventDefault();
        const p = phaseRef.current;
        if (p === "menu" || p === "over") start();
        else togglePause();
        return;
      }
      if (k === "KeyR") {
        if (phaseRef.current !== "menu") start();
        return;
      }
      if (k === "Escape" || k === "KeyP") {
        togglePause();
        return;
      }
      if (k === "KeyM") toggleMute();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enqueue, start, togglePause, toggleMute]);

  /* ---------- auto-pause on hide ---------- */

  useEffect(() => {
    const onVis = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [setPhase]);

  /* ---------- main loop ---------- */

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const fit = () => {
      const css = cvs.clientWidth || 300;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cvs.width = Math.round(css * dpr);
      cvs.height = Math.round(css * dpr);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(cvs);

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const s = sRef.current;
      const ph = phaseRef.current;
      const diff = diffRef.current;

      if (ph === "playing") {
        accRef.current += dt;
        while (accRef.current >= s.interval && phaseRef.current === "playing") {
          accRef.current -= s.interval;
          const events = step(s, diff);
          for (const ev of events) {
            if (ev.type === "eat") {
              sfx.eat();
              spawnBurst(s, ev.cell, ["#f87171", "#fbbf24", "#fda4af"], 10);
              spawnText(s, ev.cell, `+${ev.pts}`, "#fde68a");
              setScore(s.score);
              setLength(s.snake.length);
              setSpeedX(+(DIFFICULTIES[diff].interval / s.interval).toFixed(1));
            } else if (ev.type === "gold") {
              sfx.gold();
              spawnBurst(s, ev.cell, ["#fde68a", "#fbbf24", "#f59e0b", "#fff7cf"], 18);
              spawnText(s, ev.cell, `+${ev.pts}`, "#fbbf24");
              setScore(s.score);
              setLength(s.snake.length);
            } else if (ev.type === "die") {
              s.shake = 1;
              sfx.die();
              spawnBurst(s, s.snake[0], ["#f87171", "#dc2626", "#fca5a5", "#a3e635"], 26);
              setScore(s.score);
              const prevBest = loadBest(diff);
              if (s.score > prevBest && s.score > 0) {
                saveBest(diff, s.score);
                setBest(s.score);
                setNewRecord(true);
              }
              setPhase("over");
            }
          }
        }
        if (s.gold) {
          s.gold.ttl -= dt;
          if (s.gold.ttl <= 0) s.gold = null;
        }
      }

      if (ph !== "paused") updateFx(s, dt / 1000);

      const ratio = cvs.width / BOARD;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const t = ph === "playing" ? Math.min(1, accRef.current / s.interval) : 1;
      renderGame(ctx, s, { t, time: now, phase: ph });

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasRef, setPhase]);

  /* ---------- swipe ---------- */

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const origin = touchRef.current;
      if (!origin) return;
      const t = e.touches[0];
      const dx = t.clientX - origin.x;
      const dy = t.clientY - origin.y;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) enqueue({ x: Math.sign(dx), y: 0 });
      else enqueue({ x: 0, y: Math.sign(dy) });
      touchRef.current = { x: t.clientX, y: t.clientY };
    },
    [enqueue],
  );

  return {
    phase,
    difficulty,
    score,
    best,
    length,
    speedX,
    muted,
    newRecord,
    start,
    togglePause,
    restart: start,
    toMenu,
    setDifficulty,
    toggleMute,
    enqueue,
    touchHandlers: { onTouchStart, onTouchMove },
  };
}
