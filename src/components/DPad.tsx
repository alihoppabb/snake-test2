import type * as React from "react";
import type { Vec } from "../game/engine";
import { ArrowGlyph, PauseIcon, PlayIcon } from "./controls";

interface DPadProps {
  onDir: (d: Vec) => void;
  onCenter: () => void;
  playing: boolean;
}

function PadBtn({
  onPress,
  label,
  children,
  className = "",
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className={`flex items-center justify-center rounded-xl border border-moss-600/70 bg-moss-800/90 text-moss-200 h-14 sm:h-16 transition-all duration-100 active:scale-90 active:bg-lime-400 active:text-moss-950 active:border-lime-300 select-none touch-manipulation ${className}`}
    >
      {children}
    </button>
  );
}

export function DPad({ onDir, onCenter, playing }: DPadProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-56 sm:w-64 mx-auto" aria-label="Сенсорное управление">
      <div />
      <PadBtn label="Вверх" onPress={() => onDir({ x: 0, y: -1 })}>
        <ArrowGlyph dir="up" />
      </PadBtn>
      <div />
      <PadBtn label="Влево" onPress={() => onDir({ x: -1, y: 0 })}>
        <ArrowGlyph dir="left" />
      </PadBtn>
      <PadBtn label={playing ? "Пауза" : "Старт"} onPress={onCenter} className="border-lime-400/40 text-lime-300">
        {playing ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      </PadBtn>
      <PadBtn label="Вправо" onPress={() => onDir({ x: 1, y: 0 })}>
        <ArrowGlyph dir="right" />
      </PadBtn>
      <div />
      <PadBtn label="Вниз" onPress={() => onDir({ x: 0, y: 1 })}>
        <ArrowGlyph dir="down" />
      </PadBtn>
      <div />
    </div>
  );
}
