import { Activity } from "lucide-react";

/** State 2 — scanning / matchmaking overlay. */
export function ScanOverlay({ label }: { label: string }) {
  return (
    <div className="animate-soft-in absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
      <div
        className="absolute inset-0 animate-heartbeat"
        style={{ background: "var(--gradient-scan)" }}
      />

      <div className="relative grid h-56 w-56 place-items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inset-0 rounded-full border border-primary/25 animate-halo"
            style={{ animationDelay: `${i * 0.9}s` }}
          />
        ))}
        <div className="absolute inset-6 rounded-full border border-primary/20" />
        <div className="absolute inset-16 rounded-full border border-primary/20" />
        <div className="absolute inset-0 animate-radar rounded-full [mask-image:conic-gradient(from_0deg,black,transparent_55%)] bg-[conic-gradient(from_0deg,color-mix(in_oklab,var(--primary)_45%,transparent),transparent_55%)]" />
        <Activity className="relative h-10 w-10 text-primary" />
      </div>

      <p className="relative mt-10 px-8 text-center text-xl font-semibold text-foreground">
        Locating nearest available trauma beds…
      </p>
      <p className="relative mt-2 text-sm text-muted-foreground">{label}</p>

      <div className="relative mt-8 w-56 space-y-2 text-xs text-muted-foreground/80">
        {["GPS position sent", "Querying live bed capacity", "Ranking by ETA"].map((s, i) => (
          <p key={s} className="animate-rise-in" style={{ animationDelay: `${i * 0.35}s` }}>
            <span className="mr-2 text-primary">▸</span>
            {s}
          </p>
        ))}
      </div>
    </div>
  );
}
