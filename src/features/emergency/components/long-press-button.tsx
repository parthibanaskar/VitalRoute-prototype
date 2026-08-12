import { useEffect, useRef, useState } from "react";

/** Long-press button — prevents accidental cancellation during panic. */
export function LongPressButton({
  onComplete,
  children,
  holdMs = 1400,
  className = "",
}: {
  onComplete: () => void;
  children: React.ReactNode;
  holdMs?: number;
  className?: string;
}) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number>(0);

  const stop = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setProgress(0);
  };

  useEffect(() => stop, []);

  const begin = () => {
    start.current = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - start.current) / holdMs);
      setProgress(p);
      if (p >= 1) {
        stop();
        onComplete();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  return (
    <button
      type="button"
      onPointerDown={begin}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      className={`relative overflow-hidden rounded-2xl border border-border/70 px-5 py-4 text-sm font-medium text-muted-foreground transition-colors duration-300 ease-in-out select-none active:text-foreground ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-destructive/25 transition-none"
        style={{ width: `${progress * 100}%` }}
      />
      <span className="relative">
        {progress > 0 ? "Keep holding to cancel…" : children}
      </span>
    </button>
  );
}
