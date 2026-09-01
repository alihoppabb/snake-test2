import { useRef } from "react";
import { Ambient } from "./components/Ambient";
import { DPad } from "./components/DPad";
import { GameOverlays } from "./components/Overlays";
import { Panel } from "./components/Panel";
import {
  Kbd,
  SnakeMark,
  SoundOffIcon,
  SoundOnIcon,
} from "./components/controls";
import { useSnakeGame } from "./game/useSnake";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const g = useSnakeGame(canvasRef);

  return (
    <div className="relative min-h-screen flex flex-col">
      <Ambient />

      {/* шапка */}
      <header className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-5 sm:pt-7 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SnakeMark className="w-10 h-10 sm:w-11 sm:h-11" />
          <div>
            <p className="font-display font-black text-xl sm:text-2xl leading-none tracking-tight text-moss-100">
              ЗМЕЙ<span className="text-lime-400">КА</span>
            </p>
            <p className="font-mono text-[10px] sm:text-[11px] text-moss-400 tracking-[0.22em] uppercase mt-1">
              неоновая аркада
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-moss-600/60 bg-moss-900/70 px-3 py-1.5 font-mono text-[11px] text-moss-300">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-hint-blink" />
            поле 21×21
          </span>
          <button
            type="button"
            onClick={g.toggleMute}
            aria-label={g.muted ? "Включить звук" : "Выключить звук"}
            title="Звук (M)"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-moss-600/60 bg-moss-900/70 text-moss-200 transition-all hover:text-lime-300 hover:border-lime-400/50 hover:-translate-y-0.5 active:scale-90"
          >
            {g.muted ? <SoundOffIcon className="w-4.5 h-4.5" /> : <SoundOnIcon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* контент */}
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 py-5 sm:py-7 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 lg:gap-7 items-start">
        {/* левая колонка: поле + D-pad */}
        <section className="min-w-0">
          {/* мобильные чипы HUD */}
          <div className="lg:hidden mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-lime-400/25 bg-moss-900/80 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-moss-400">Счёт</p>
              <p key={g.score} className="animate-score-pop font-mono text-xl font-extrabold text-lime-300 leading-tight">
                {g.score}
              </p>
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-moss-900/80 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-moss-400">Рекорд</p>
              <p className="font-mono text-xl font-extrabold text-amber-300 leading-tight">{g.best}</p>
            </div>
            <div className="rounded-xl border border-moss-600/50 bg-moss-900/80 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-moss-400">Темп</p>
              <p className="font-mono text-xl font-extrabold text-cyan-300 leading-tight">×{g.speedX.toFixed(1)}</p>
            </div>
          </div>

          {/* игровое поле */}
          <div
            className="relative mx-auto w-full max-w-[620px] rounded-2xl shadow-[0_0_80px_-24px_rgba(163,230,53,0.4),0_30px_80px_-30px_rgba(0,0,0,0.9)]"
            style={{ touchAction: "none" }}
            {...g.touchHandlers}
          >
            <canvas
              ref={canvasRef}
              className="block w-full h-auto rounded-2xl"
              aria-label="Игровое поле змейки"
            />
            <GameOverlays
              phase={g.phase}
              score={g.score}
              best={g.best}
              newRecord={g.newRecord}
              difficulty={g.difficulty}
              setDifficulty={g.setDifficulty}
              onStart={g.start}
              onResume={g.togglePause}
              onRestart={g.restart}
              onMenu={g.toMenu}
            />
          </div>

          {/* D-pad для сенсорных экранов */}
          <div className="lg:hidden mt-5">
            <DPad
              onDir={g.enqueue}
              playing={g.phase === "playing"}
              onCenter={() => {
                if (g.phase === "playing" || g.phase === "paused") g.togglePause();
                else g.start();
              }}
            />
            <p className="mt-3 text-center text-xs text-moss-400">
              Свайпы по полю тоже работают — веди пальцем в нужную сторону
            </p>
          </div>
        </section>

        {/* правая колонка: пульт */}
        <Panel
          phase={g.phase}
          score={g.score}
          best={g.best}
          length={g.length}
          speedX={g.speedX}
          difficulty={g.difficulty}
          muted={g.muted}
          newRecord={g.newRecord}
          setDifficulty={g.setDifficulty}
          togglePause={g.togglePause}
          restart={g.restart}
          toMenu={g.toMenu}
          toggleMute={g.toggleMute}
        />
      </main>

      {/* подвал */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 pb-6 pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-moss-400">
        <p className="font-mono">
          React + Canvas · 60 FPS · рекорды хранятся в браузере
        </p>
        <p className="hidden md:flex items-center gap-1.5">
          <Kbd>Пробел</Kbd> пауза · <Kbd>R</Kbd> заново · <Kbd>M</Kbd> звук
        </p>
      </footer>
    </div>
  );
}
