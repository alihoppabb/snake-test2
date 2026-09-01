import type * as React from "react";
import { DIFFICULTIES } from "../game/engine";
import type { DifficultyId, Phase } from "../game/engine";
import {
  BoltIcon,
  DiffControl,
  GameButton,
  HomeIcon,
  Kbd,
  PauseIcon,
  PlayIcon,
  RestartIcon,
  RulerIcon,
  SoundOffIcon,
  SoundOnIcon,
  TrophyIcon,
} from "./controls";

interface PanelProps {
  phase: Phase;
  score: number;
  best: number;
  length: number;
  speedX: number;
  difficulty: DifficultyId;
  muted: boolean;
  newRecord: boolean;
  setDifficulty: (d: DifficultyId) => void;
  togglePause: () => void;
  restart: () => void;
  toMenu: () => void;
  toggleMute: () => void;
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-moss-600/50 bg-moss-800/60 px-3 py-2.5 transition-colors hover:border-moss-400/60">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-moss-400">
        {icon}
        {label}
      </p>
      <p className="font-mono text-lg font-bold mt-0.5" style={{ color: accent ?? "#e8f6ee" }}>
        {value}
      </p>
    </div>
  );
}

export function Panel(p: PanelProps) {
  const inMenu = p.phase === "menu";
  return (
    <aside className="rounded-2xl border border-moss-600/60 bg-moss-900/80 p-4 sm:p-5 backdrop-blur-sm shadow-[0_20px_60px_-24px_rgba(0,0,0,0.8)]">
      <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-moss-400 uppercase">
        Пульт управления
      </p>

      {/* счёт */}
      <div className="mt-3 rounded-xl border border-lime-400/25 bg-moss-950/70 px-4 py-3 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/60 to-transparent" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-moss-400">
          Текущий счёт
        </p>
        <p
          key={p.score}
          className="animate-score-pop font-mono text-4xl sm:text-5xl font-extrabold text-lime-300 leading-tight [text-shadow:0_0_24px_rgba(163,230,53,0.35)]"
        >
          {p.score}
        </p>
      </div>

      {/* рекорд */}
      <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-400/20 bg-moss-950/60 px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-semibold text-moss-300">
          <TrophyIcon className="w-4 h-4 text-amber-400" />
          Рекорд
        </span>
        <span className="font-mono text-xl font-bold text-amber-300">{p.best}</span>
      </div>
      {p.newRecord && p.phase === "over" && (
        <p className="mt-2 text-center font-mono text-[11px] font-bold text-amber-300 animate-hint-blink">
          ★ Прежний рекорд побит! ★
        </p>
      )}

      {/* статистика */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat icon={<RulerIcon className="w-3.5 h-3.5" />} label="Длина" value={String(p.length)} />
        <Stat icon={<BoltIcon className="w-3.5 h-3.5" />} label="Темп" value={`×${p.speedX.toFixed(1)}`} accent="#67e8f9" />
        <Stat
          icon={<span className="w-1.5 h-1.5 rounded-full" style={{ background: DIFFICULTIES[p.difficulty].dot }} />}
          label="Уровень"
          value={DIFFICULTIES[p.difficulty].label}
        />
        <Stat
          icon={<span className="text-red-400 text-xs leading-none">●</span>}
          label="За яблоко"
          value={`+${10 * DIFFICULTIES[p.difficulty].mult}`}
          accent="#fda4af"
        />
      </div>

      {/* сложность */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-moss-400">
            Сложность
          </p>
          {!inMenu && (
            <p className="text-[10px] text-moss-400 font-mono">смена — из меню</p>
          )}
        </div>
        <div className="mt-1.5">
          <DiffControl compact value={p.difficulty} onChange={p.setDifficulty} disabled={!inMenu} />
        </div>
      </div>

      {/* действия */}
      <div className="mt-4 grid gap-2">
        <GameButton
          variant={p.phase === "playing" ? "ghost" : "primary"}
          onClick={p.phase === "menu" || p.phase === "over" ? p.restart : p.togglePause}
        >
          {p.phase === "playing" ? (
            <>
              <PauseIcon /> Пауза
            </>
          ) : p.phase === "paused" ? (
            <>
              <PlayIcon /> Продолжить
            </>
          ) : (
            <>
              <PlayIcon /> {p.phase === "over" ? "Играть снова" : "Начать игру"}
            </>
          )}
        </GameButton>
        <div className="grid grid-cols-3 gap-2">
          <GameButton onClick={p.restart} disabled={inMenu} title="Перезапуск (R)">
            <RestartIcon />
          </GameButton>
          <GameButton onClick={p.toMenu} disabled={inMenu} title="В меню">
            <HomeIcon />
          </GameButton>
          <GameButton onClick={p.toggleMute} title="Звук (M)" className={p.muted ? "text-red-300 border-red-500/40" : ""}>
            {p.muted ? <SoundOffIcon /> : <SoundOnIcon />}
          </GameButton>
        </div>
      </div>

      {/* клавиши */}
      <div className="mt-5 hidden lg:block border-t border-moss-700/70 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-moss-400">
          Клавиатура
        </p>
        <ul className="mt-2 space-y-2 text-xs text-moss-300">
          <li className="flex items-center justify-between gap-2">
            <span>Движение</span>
            <span className="flex gap-1">
              <Kbd>WASD</Kbd>
              <Kbd>←↑↓→</Kbd>
            </span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span>Пауза / старт</span>
            <Kbd>Пробел</Kbd>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span>Перезапуск</span>
            <Kbd>R</Kbd>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span>Звук</span>
            <Kbd>M</Kbd>
          </li>
        </ul>
      </div>
    </aside>
  );
}
