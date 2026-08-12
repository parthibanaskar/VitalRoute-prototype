import { useEffect, useState } from "react";
import { CheckCircle2, PhoneCall, QrCode, ScanLine, Truck, X, BellRing, Upload } from "lucide-react";
import type { InjuryId } from "@/lib/vitalroute-data";
import { RECOMMENDED } from "@/lib/vitalroute-data";
import { FirstAidCard } from "./first-aid-card";
import { LongPressButton } from "./long-press-button";
import { QrMatrix } from "./qr-matrix";
import { AmbulanceMap } from "./ambulance-map";

const START_SECONDS = 345; // 05:45

function fmt(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** States 4 + 5 — active dispatch, medic handoff and visual first aid. */
export function ActiveDispatch({
  injury,
  details,
  location,
  onCancel,
}: {
  injury: InjuryId;
  details?: string;
  location: [number, number] | null;
  onCancel: () => void;
}) {
  const [seconds, setSeconds] = useState(START_SECONDS);
  const [showQr, setShowQr] = useState(false);
  const [showPing, setShowPing] = useState(false);
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHypertension, setHasHypertension] = useState(false);
  const [prescriptionAdded, setPrescriptionAdded] = useState(false);
  const [medicalIdSaved, setMedicalIdSaved] = useState(false);
  const hospital = RECOMMENDED[injury];

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    const pingId = setTimeout(() => setShowPing(true), 2500);
    const hidePingId = setTimeout(() => setShowPing(false), 7500); // Hide after 5 seconds of showing
    return () => {
      clearInterval(id);
      clearTimeout(pingId);
      clearTimeout(hidePingId);
    };
  }, []);

  return (
    <div className="animate-rise-in relative flex min-h-full flex-col gap-4 px-4 pt-4 pb-8">
      {/* Mock Contact Ping */}
      {showPing && (
        <div className="animate-fade-in fixed top-4 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-safe/40 bg-safe/90 p-4 shadow-2xl backdrop-blur-md">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background/20 text-background">
            <BellRing className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-background/80">Automated Alert</p>
            <p className="truncate text-sm font-bold text-background">
              Emergency Contact Pinged: Mom (SMS Sent)
            </p>
          </div>
        </div>
      )}

      {/* Confirmation */}
      <div className="glass-strong relative overflow-hidden rounded-3xl text-center">
        <div
          className="pointer-events-none absolute inset-0 animate-heartbeat"
          style={{ background: "var(--gradient-heartbeat)" }}
        />
        
        {location ? (
          <div className="p-2 pb-0 relative z-10">
            <AmbulanceMap userLocation={location} totalSeconds={START_SECONDS} />
          </div>
        ) : (
          <div className="pt-6">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-safe/15 ring-1 ring-safe/45 relative z-10">
              <CheckCircle2 className="h-8 w-8 text-safe" />
            </div>
          </div>
        )}

        <div className="relative p-6 pt-4">
          <h1 className="text-3xl font-bold tracking-tight">Ambulance Dispatched.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The destination hospital has been pre-alerted and is preparing for arrival.
          </p>

          <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Arriving in
          </p>
          <p className="font-sans text-6xl font-bold tabular-nums tracking-tight text-foreground">
            {fmt(seconds)}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm text-muted-foreground ring-1 ring-border">
            <Truck className="h-4 w-4 text-primary" />
            Unit 12 en route · {hospital.distance}
          </div>
        </div>
      </div>

      {/* Medic sync */}
      <div className="glass rounded-3xl p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">Paramedic Handoff</h3>
            <p className="text-xs text-muted-foreground">
              Medics scan this to instantly pull the live dispatch timeline and patient vitals.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowQr((v) => !v)}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 ease-in-out active:scale-95"
          >
            {showQr ? <X className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
            Medic Sync
          </button>
        </div>

        {showQr && (
          <div className="animate-soft-in mt-5 flex flex-col items-center">
            <QrMatrix seed={injury.length + 3} />
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <ScanLine className="h-3.5 w-3.5 text-primary" />
              Hold the screen toward the paramedic's scanner
            </p>
            <p className="mt-1 font-mono text-[0.7rem] tracking-widest text-muted-foreground/70">
              VR-8421-{injury.toUpperCase()}
            </p>
            
            {medicalIdSaved && (
              <div className="mt-5 w-full rounded-2xl border border-safe/30 bg-safe/10 p-4 text-left">
                <p className="text-[10px] font-bold text-safe uppercase tracking-widest mb-3 text-center">Payload Attached</p>
                <div className="space-y-2 text-sm text-foreground">
                  <p><span className="font-medium text-muted-foreground">Vitals:</span> Blood {bloodType || "Unk"} · Allergies: {allergies || "None"}</p>
                  {(hasDiabetes || hasHypertension) && (
                    <p><span className="font-medium text-muted-foreground">Conditions:</span> {[hasDiabetes ? 'Diabetes (Sugar)' : '', hasHypertension ? 'Hypertension (BP)' : ''].filter(Boolean).join(', ')}</p>
                  )}
                  {prescriptionAdded && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-safe mt-2 pt-2 border-t border-safe/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Prescription Media Embedded
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!medicalIdSaved && (
          <div className="mt-5 border-t border-border/50 pt-5 animate-soft-in">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Add Patient Data (Optional)</p>
            
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setHasDiabetes(!hasDiabetes)}
                className={`flex-1 rounded-xl border p-2 text-xs font-semibold transition-all ${hasDiabetes ? 'border-primary bg-primary/20 text-primary' : 'border-border/80 bg-secondary/30 text-muted-foreground'}`}
              >
                Diabetes (Sugar)
              </button>
              <button
                onClick={() => setHasHypertension(!hasHypertension)}
                className={`flex-1 rounded-xl border p-2 text-xs font-semibold transition-all ${hasHypertension ? 'border-primary bg-primary/20 text-primary' : 'border-border/80 bg-secondary/30 text-muted-foreground'}`}
              >
                Hypertension (BP)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input 
                type="text" 
                placeholder="Blood Type (O+)"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-secondary/30 p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-secondary/30 p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setPrescriptionAdded(!prescriptionAdded)}
              className={`mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-sm font-medium transition-all ${prescriptionAdded ? 'border-safe bg-safe/10 text-safe' : 'border-border bg-secondary/30 text-muted-foreground'}`}
            >
              <Upload className="h-4 w-4" />
              {prescriptionAdded ? "Prescription Attached" : "Upload Prescription Media"}
            </button>

            <button
              onClick={() => setMedicalIdSaved(true)}
              disabled={!bloodType && !allergies && !hasDiabetes && !hasHypertension && !prescriptionAdded}
              className="mt-1 w-full rounded-xl bg-primary/15 py-3.5 text-sm font-bold text-primary transition-all hover:bg-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Attach to Dispatch Payload
            </button>
          </div>
        )}
      </div>

      {/* First aid */}
      <FirstAidCard injury={injury} details={details} />

      {/* Fallbacks */}
      <a
        href="tel:911"
        className="flex items-center justify-center gap-3 rounded-3xl border border-alert/50 bg-alert/12 py-5 text-base font-semibold text-foreground transition-colors duration-300 ease-in-out active:bg-alert/20"
      >
        <PhoneCall className="h-5 w-5 text-alert" />
        Call Emergency Directly
      </a>

      <LongPressButton onComplete={onCancel} className="mx-auto w-full max-w-xs">
        Hold to Cancel SOS
      </LongPressButton>
    </div>
  );
}
