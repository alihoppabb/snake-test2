import { useMemo } from "react";

interface Firefly {
  left: number;
  top: number;
  size: number;
  drift: number;
  glow: number;
  delay: number;
  color: string;
}

export function Ambient() {
  const flies = useMemo<Firefly[]>(() => {
    const colors = ["#a3e635", "#fbbf24", "#67e8f9", "#d3f76f"];
    return Array.from({ length: 16 }, (_, i) => ({
      left: Math.random() * 100,
      top: 20 + Math.random() * 78,
      size: 2 + Math.random() * 3.5,
      drift: 9 + Math.random() * 14,
      glow: 2.6 + Math.random() * 3.4,
      delay: -Math.random() * 12,
      color: colors[i % colors.length],
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* глубинные свечения */}
      <div
        className="absolute -top-40 -left-40 w-[42rem] h-[42rem] rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(132,204,22,0.13) 0%, transparent 62%)" }}
      />
      <div
        className="absolute -bottom-52 -right-40 w-[46rem] h-[46rem] rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(15,143,104,0.16) 0%, transparent 60%)" }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[26rem] h-[26rem] rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 60%)" }}
      />

      {/* сетка */}
      <div className="absolute inset-0 bg-gridlines" />

      {/* светлячки */}
      {flies.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            background: f.color,
            boxShadow: `0 0 ${f.size * 3}px ${f.color}`,
            animationDuration: `${f.drift}s, ${f.glow}s`,
            animationDelay: `${f.delay}s, ${f.delay / 2}s`,
          }}
        />
      ))}

      {/* виньетка */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 120% 90% at 50% 40%, transparent 55%, rgba(3,10,7,0.75) 100%)" }}
      />
    </div>
  );
}
