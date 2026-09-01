import type * as React from "react";
import type { ReactNode } from "react";
import { DIFFICULTIES } from "../game/engine";
import type { DifficultyId } from "../game/engine";

/* ---------- icons ---------- */

type IconProps = { className?: string };

export const PlayIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5.14v13.72c0 .89.98 1.43 1.73.96l10.02-6.86a1.14 1.14 0 0 0 0-1.92L9.73 4.18A1.14 1.14 0 0 0 8 5.14Z" />
  </svg>
);

export const PauseIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <rect x="6" y="5" width="4" height="14" rx="1.2" />
    <rect x="14" y="5" width="4" height="14" rx="1.2" />
  </svg>
);

export const RestartIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 3v4.5h-4.5" strokeLinejoin="round" />
  </svg>
);

export const HomeIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10.5V20h13v-9.5" />
  </svg>
);

export const TrophyIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
    <path d="M8 5H4.5v1.5A3.5 3.5 0 0 0 8 10M16 5h3.5v1.5A3.5 3.5 0 0 1 16 10" />
    <path d="M12 13v3.5M8.5 20.5h7M10 20.5c0-2.2.8-4 2-4s2 1.8 2 4" />
  </svg>
);

export const BoltIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />
  </svg>
);

export const RulerIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3.5 16.5 16.5 3.5l4 4L7.5 20.5l-4-4Z" />
    <path d="m7 13 1.5 1.5M10 10l1.5 1.5M13 7l1.5 1.5" />
  </svg>
);

export const SoundOnIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
    <path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a8 8 0 0 1 0 10" />
  </svg>
);

export const SoundOffIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
    <path d="m15.5 9.5 5 5M20.5 9.5l-5 5" />
  </svg>
);

export const SnakeMark = ({ className = "w-8 h-8" }: IconProps) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
    <rect width="32" height="32" rx="9" fill="#10291c" />
    <path
      d="M8 22c0-3 3-4 6-4h4c3 0 6-1 6-4s-3-4-6-4"
      stroke="#a3e635"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
    <circle cx="8" cy="22" r="2.8" fill="#d3f76f" />
    <circle cx="22.6" cy="9.4" r="1.5" fill="#06110c" />
  </svg>
);

export const ArrowGlyph = ({ dir, className = "w-6 h-6" }: { dir: "up" | "down" | "left" | "right"; className?: string }) => {
  const rot = { up: 0, right: 90, down: 180, left: 270 }[dir];
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
    </svg>
  );
};

/* ---------- atoms ---------- */

export function Kbd({ children }: { children: ReactNode }) {
  return <span className="kbd">{children}</span>;
}

export function GameButton({
  children,
  onClick,
  variant = "ghost",
  disabled,
  className = "",
  title,
}: {
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-body font-semibold text-sm tracking-wide transition-all duration-150 active:scale-[0.96] disabled:opacity-35 disabled:pointer-events-none select-none";
  const styles = {
    primary:
      "bg-lime-400 text-moss-950 shadow-[0_0_28px_-6px_rgba(163,230,53,0.7)] hover:bg-lime-300 hover:shadow-[0_0_36px_-4px_rgba(163,230,53,0.85)] hover:-translate-y-0.5",
    ghost:
      "bg-moss-800/80 text-moss-200 border border-moss-600/70 hover:border-lime-400/50 hover:text-lime-300 hover:-translate-y-0.5",
    danger:
      "bg-red-500/15 text-red-300 border border-red-500/40 hover:bg-red-500/25 hover:-translate-y-0.5",
  }[variant];
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function DiffControl({
  value,
  onChange,
  disabled,
  compact,
}: {
  value: DifficultyId;
  onChange: (d: DifficultyId) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-3 gap-1 rounded-xl border border-moss-600/60 bg-moss-900/80 p-1 ${disabled ? "opacity-45 pointer-events-none" : ""}`}
      role="radiogroup"
      aria-label="Сложность"
    >
      {(Object.keys(DIFFICULTIES) as DifficultyId[]).map((id) => {
        const d = DIFFICULTIES[id];
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`rounded-lg font-body font-semibold transition-all duration-150 ${compact ? "px-2 py-1.5 text-[11px]" : "px-3 py-2 text-xs sm:text-sm"} ${
              active
                ? "bg-moss-700 text-lime-300 shadow-[inset_0_0_0_1px_rgba(163,230,53,0.45),0_0_18px_-6px_rgba(163,230,53,0.6)]"
                : "text-moss-300 hover:text-moss-100 hover:bg-moss-800"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.dot, boxShadow: active ? `0 0 8px ${d.dot}` : "none" }} />
              {d.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
