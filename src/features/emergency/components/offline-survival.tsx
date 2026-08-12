import { PhoneCall, AlertTriangle, ArrowLeft } from "lucide-react";
import type { InjuryId } from "@/lib/vitalroute-data";
import { INJURIES } from "@/lib/vitalroute-data";
import { FirstAidCard } from "./first-aid-card";

export function OfflineSurvival({
  injury,
  details,
  onBack,
}: {
  injury: InjuryId;
  details?: string;
  onBack: () => void;
}) {
  const label = INJURIES.find((i) => i.id === injury)?.label ?? "Emergency";

  return (
    <div className="animate-rise-in glass-strong relative max-h-[82vh] flex-col overflow-y-auto rounded-t-3xl px-4 pt-5 pb-8">
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Change emergency type"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary/60 text-muted-foreground transition-colors duration-300 ease-in-out hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold tracking-[0.18em] text-alert uppercase">
            {label}
          </p>
          <p className="text-sm font-medium text-warn">Offline Survival Mode</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-warn/40 bg-warn/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
          <p className="text-sm text-foreground">
            <span className="font-bold">No Internet Connection.</span> We cannot locate live hospitals. Follow the first-aid steps below and dial emergency services immediately.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <FirstAidCard injury={injury} details={details} />
      </div>

      <a
        href="tel:911"
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-3xl bg-alert py-6 text-xl font-bold tracking-tight text-alert-foreground shadow-[var(--shadow-glow-alert)] transition-all duration-300 ease-in-out active:scale-[0.98]"
      >
        <PhoneCall className="h-6 w-6" />
        Dial Emergency (911)
      </a>
    </div>
  );
}
