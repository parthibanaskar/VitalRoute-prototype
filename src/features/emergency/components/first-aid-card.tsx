import { HeartPulse, ShieldCheck } from "lucide-react";
import type { InjuryId } from "@/lib/vitalroute-data";
import { getDynamicFirstAid } from "@/lib/vitalroute-data";

/** State 5 — visual first aid, tailored to the selected injury. */
export function FirstAidCard({ injury, details }: { injury: InjuryId; details?: string }) {
  const guide = getDynamicFirstAid(injury, details);

  return (
    <div className="glass animate-rise-in rounded-3xl p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Immediate Action
          </p>
          <h3 className="mt-1 truncate text-xl font-bold tracking-tight">{guide.title}</h3>
        </div>
        <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
      </div>

      {guide.rhythm && (
        <div className="mt-5 flex flex-col items-center">
          <div className="relative grid h-32 w-32 place-items-center">
            <span className="absolute inset-0 animate-cpr rounded-full bg-alert/20" />
            <span
              className="absolute inset-4 animate-cpr rounded-full bg-alert/30"
              style={{ animationDelay: "0.06s" }}
            />
            <HeartPulse className="animate-cpr relative h-12 w-12 text-alert" />
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            Push down on every beat · 110 / min
          </p>
        </div>
      )}

      <ol className="mt-5 space-y-3">
        {guide.steps.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-1 ring-primary/35">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-base leading-snug font-semibold">{step.title}</span>
              <span className="block text-sm text-muted-foreground">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
