import { CarFront, Flame, HeartPulse, HelpCircle } from "lucide-react";
import type { InjuryId } from "@/lib/vitalroute-data";
import { INJURIES } from "@/lib/vitalroute-data";

const ICONS: Record<InjuryId, typeof CarFront> = {
  trauma: CarFront,
  cardiac: HeartPulse,
  burn: Flame,
  other: HelpCircle,
};

/** State 1 — bottom emergency selector with massive tap targets. */
export function InjurySelector({ onSelect }: { onSelect: (id: InjuryId) => void }) {
  return (
    <div className="animate-rise-in glass-strong relative rounded-t-3xl px-4 pt-5 pb-8">
      <div
        className="pointer-events-none absolute inset-0 animate-heartbeat rounded-t-3xl"
        style={{ background: "var(--gradient-heartbeat)" }}
      />
      <div className="relative">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" />
        <p className="text-center text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Step 1 of 2
        </p>
        <h2 className="mt-1 text-center text-2xl font-bold tracking-tight">Select Emergency</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Tap what you see. We handle the rest.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {INJURIES.map((injury) => {
            const Icon = ICONS[injury.id];
            const isCritical = injury.id === "cardiac" || injury.id === "trauma";
            return (
              <button
                key={injury.id}
                type="button"
                onClick={() => onSelect(injury.id)}
                className={`group flex min-h-36 flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-300 ease-in-out active:scale-[0.97] ${
                  isCritical
                    ? "border-alert/40 bg-alert/10 hover:border-alert hover:shadow-[var(--shadow-glow-alert)]"
                    : "border-border bg-secondary/50 hover:border-primary/60 hover:shadow-[var(--shadow-glow-primary)]"
                }`}
              >
                <Icon
                  className={`h-9 w-9 transition-transform duration-300 ease-in-out group-active:scale-110 ${
                    isCritical ? "text-alert" : "text-primary"
                  }`}
                />
                <span className="min-w-0">
                  <span className="block text-base leading-tight font-semibold">
                    {injury.label}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">{injury.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
