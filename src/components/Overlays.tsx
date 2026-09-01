import type * as React from "react";
import type { DifficultyId, Phase } from "../game/engine";
import {
  DiffControl,
  GameButton,
  HomeIcon,
  Kbd,
  PlayIcon,
  RestartIcon,
  SnakeMark,
  TrophyIcon,
} from "./controls";

interface OverlayProps {
  phase: Phase;
  score: number;
  best: number;
  newRecord: boolean;
  difficulty: DifficultyId;
  setDifficulty: (d: DifficultyId) => void;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

function Shell({
  onClick,
  late,
  children,
}: {
  onClick: () => void;
  late?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[#04120b]/88 p-3 sm:p-5"
      onClick={onClick}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-lime-400/25 bg-moss-900/95 px-5 py-6 sm:px-8 sm:py-7 text-center shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9),0_0_50px_-18px_rgba(163,230,53,0.4)] ${
          late ? "animate-overlay-in-late" : "animate-overlay-in"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function GameOverlays(p: OverlayProps) {
  if (p.phase === "playing") return null;

  if (p.phase === "menu") {
    return (
      <Shell onClick={p.onStart}>
        <div className="animate-title-bob mx-auto mb-4 w-fit">
          <SnakeMark className="w-14 h-14" />
        </div>
        <p className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.35em] text-lime-400/80 uppercase">
          Аркада · 21×21
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl leading-none mt-2 text-moss-100 [text-shadow:0_0_30px_rgba(163,230,53,0.35)]">
          ЗМЕЙ<span className="text-lime-400">КА</span>
        </h1>
        <p className="mt-3 text-sm text-moss-300 leading-relaxed">
          Собирай яблоки, лови золотые звёзды и расти — но не врезайся в стены и собственный хвост.
        </p>

        <div className="mt-5" onClick={(e) => e.stopPropagation()}>
          <DiffControl value={p.difficulty} onChange={p.setDifficulty} />
          <p className="mt-2 font-mono text-[11px] text-moss-400 flex items-center justify-center gap-1.5">
            <TrophyIcon className="w-3.5 h-3.5 text-amber-400" />
            Рекорд на уровне: <span className="text-amber-300 font-bold">{p.best}</span>
          </p>
        </div>

        <GameButton
          variant="primary"
          className="mt-5 w-full py-3 text-base font-display font-bold tracking-wide"
          onClick={(e) => {
            e.stopPropagation();
            p.onStart();
          }}
        >
          <PlayIcon className="w-5 h-5" />
          ИГРАТЬ
        </GameButton>

        <p className="mt-4 hidden sm:flex items-center justify-center gap-2 text-xs text-moss-400">
          <Kbd>Пробел</Kbd> старт · <Kbd>←↑↓→</Kbd> / <Kbd>WASD</Kbd> движение
        </p>
        <p className="mt-4 sm:hidden text-xs text-moss-400 animate-hint-blink">
          Свайпай по полю или жми «Играть»
        </p>
      </Shell>
    );
  }

  if (p.phase === "paused") {
    return (
      <Shell onClick={p.onResume}>
        <p className="font-mono text-[11px] font-bold tracking-[0.35em] text-amber-400 uppercase">
          Пауза
        </p>
        <h2 className="font-display font-bold text-2xl mt-2 text-moss-100">Передышка</h2>
        <p className="mt-2 text-sm text-moss-300">
          Змейка замерла. Счёт: <span className="font-mono font-bold text-lime-300">{p.score}</span>
        </p>
        <div className="mt-5 grid gap-2">
          <GameButton
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              p.onResume();
            }}
          >
            <PlayIcon />
            Продолжить
          </GameButton>
          <div className="grid grid-cols-2 gap-2">
            <GameButton
              onClick={(e) => {
                e.stopPropagation();
                p.onRestart();
              }}
            >
              <RestartIcon />
              Заново
            </GameButton>
            <GameButton
              onClick={(e) => {
                e.stopPropagation();
                p.onMenu();
              }}
            >
              <HomeIcon />
              В меню
            </GameButton>
          </div>
        </div>
        <p className="mt-4 hidden sm:flex items-center justify-center gap-2 text-xs text-moss-400">
          <Kbd>Пробел</Kbd> продолжить · <Kbd>R</Kbd> заново
        </p>
      </Shell>
    );
  }

  /* game over */
  return (
    <Shell onClick={p.onRestart} late>
      <p className="font-mono text-[11px] font-bold tracking-[0.35em] text-red-400 uppercase">
        Игра окончена
      </p>
      <h2 className="font-display font-bold text-2xl sm:text-3xl mt-2 text-moss-100">
        Змейка разбилась
      </h2>

      {p.newRecord && (
        <p className="animate-badge-pulse mt-3 mx-auto w-fit rounded-full bg-amber-400/15 border border-amber-400/50 px-4 py-1.5 font-mono text-xs font-bold text-amber-300 inline-flex items-center gap-2">
          <TrophyIcon className="w-4 h-4" />
          НОВЫЙ РЕКОРД!
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-moss-800/80 border border-moss-600/60 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-moss-400 font-semibold">Счёт</p>
          <p className="font-mono text-3xl font-extrabold text-lime-300 mt-1">{p.score}</p>
        </div>
        <div className="rounded-xl bg-moss-800/80 border border-moss-600/60 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-moss-400 font-semibold">Рекорд</p>
          <p className="font-mono text-3xl font-extrabold text-amber-300 mt-1">{p.best}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <GameButton
          variant="primary"
          className="py-3 font-display font-bold tracking-wide"
          onClick={(e) => {
            e.stopPropagation();
            p.onRestart();
          }}
        >
          <RestartIcon className="w-5 h-5" />
          ЕЩЁ РАЗ
        </GameButton>
        <GameButton
          onClick={(e) => {
            e.stopPropagation();
            p.onMenu();
          }}
        >
          <HomeIcon />
          В меню
        </GameButton>
      </div>
      <p className="mt-4 hidden sm:flex items-center justify-center gap-2 text-xs text-moss-400">
        <Kbd>Пробел</Kbd> или <Kbd>R</Kbd> — реванш
      </p>
    </Shell>
  );
}
