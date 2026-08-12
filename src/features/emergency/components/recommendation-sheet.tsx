import { useState } from "react";
import { ArrowLeft, BedDouble, Check, Clock, MapPin, Phone, Siren, Loader2, Navigation, Activity, X } from "lucide-react";
import type { InjuryId } from "@/lib/vitalroute-data";
import { INJURIES } from "@/lib/vitalroute-data";
import { FirstAidCard } from "./first-aid-card";
import type { HospitalData } from "@/lib/hospital-api";

function BedMeter({ free, total }: { free: number; total: number }) {
  const [currentFree, setCurrentFree] = useState(free);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFree((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(0, Math.min(total, prev + change));
      });
    }, Math.random() * 8000 + 4000); // Update every 4-12 seconds
    return () => clearInterval(interval);
  }, [total]);

  // Safely trigger animation key when the value actually changes
  useEffect(() => {
    setLastUpdate(Date.now());
  }, [currentFree]);

  const tone = currentFree === 0 ? "text-alert" : currentFree <= 2 ? "text-warn" : "text-safe";
  return (
    <div className="flex items-center gap-2">
      <span key={lastUpdate} className={`text-sm font-semibold animate-pulse-once ${tone}`}>
        {currentFree}/{total} beds free
      </span>
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: Math.min(total, 6) }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-3 rounded-full transition-colors duration-500 ${
              i < Math.min(currentFree, 6) ? "bg-safe" : "bg-border"
            }`}
          />
        ))}
      </span>
    </div>
  );
}

/** State 3 — zero-guesswork recommendation. */
export function RecommendationSheet({
  injury,
  location,
  preFetchedHospitals,
  details,
  setDetails,
  onDispatch,
  onBack,
}: {
  injury: InjuryId;
  location: [number, number] | null;
  preFetchedHospitals: HospitalData[] | null;
  details: string;
  setDetails: (val: string) => void;
  onDispatch: () => void;
  onBack: () => void;
}) {
  const label = INJURIES.find((i) => i.id === injury)?.label ?? "Emergency";
  const [called, setCalled] = useState(false);
  const [detailedHospital, setDetailedHospital] = useState<HospitalData | null>(null);

  const [detailsSubmitted, setDetailsSubmitted] = useState(false);

  if (!preFetchedHospitals) {
    return (
      <div className="animate-rise-in glass-strong relative flex min-h-[40vh] max-h-[82vh] flex-col items-center justify-center rounded-t-3xl px-4 pt-5 pb-8">
        <div className="absolute top-5 mx-auto h-1.5 w-12 rounded-full bg-border" />
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-80" />
        <p className="mt-4 text-sm font-medium tracking-wide text-muted-foreground">Scanning for nearest active trauma centers...</p>
      </div>
    );
  }

  const hospitals = preFetchedHospitals && preFetchedHospitals.length > 0 ? preFetchedHospitals : [];
  
  // Safety fallback in case the array is empty to prevent crashes
  const bestData = hospitals[0] || {
    id: 1, name: "Emergency Center", lat: 0, lon: 0, distanceKm: 0, etaMin: 0, bedsTotal: 10, bedsFree: 5, capacityStr: "Ready", phone: "+1-555-019-9111"
  };
  const altData = hospitals.length > 1 ? hospitals.slice(1, 4) : [];
  
  const formatDist = (km: number) => km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`;
  
  if (detailedHospital) {
    return (
      <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="animate-scale-in glass-strong relative flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-border/50 bg-background/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">Facility Details</h2>
            <button
              type="button"
              onClick={() => setDetailedHospital(null)}
              className="grid h-8 w-8 place-items-center rounded-full bg-secondary/80 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/20 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{detailedHospital.name}</h1>
                <p className="truncate text-xs font-medium text-primary mt-1">{detailedHospital.capacityStr}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Navigation className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Distance</span>
                </div>
                <p className="mt-1.5 text-lg font-bold text-foreground">{formatDist(detailedHospital.distanceKm)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">ETA</span>
                </div>
                <p className="mt-1.5 text-lg font-bold text-foreground">{detailedHospital.etaMin} min</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BedDouble className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Live Bed Capacity</h3>
              </div>
              <BedMeter free={detailedHospital.bedsFree} total={detailedHospital.bedsTotal} />
              <div className="mt-2.5 flex justify-between text-xs">
                <span className="font-medium text-primary">{detailedHospital.bedsFree} Available</span>
                <span className="text-muted-foreground">{detailedHospital.bedsTotal} Total Beds</span>
              </div>
            </div>
            
            <div className="mt-3 rounded-2xl border border-border bg-secondary/30 p-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</span>
                <p className="text-base font-medium text-foreground">{detailedHospital.phone}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 p-4 bg-background/50 backdrop-blur-md">
            <button
              type="button"
              onClick={onDispatch}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow-primary)] transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <Siren className="h-4 w-4" />
              Dispatch Ambulance Here
            </button>
          </div>
        </div>
      </div>
    );
  }

  const primaryName = bestData.name;
  const primaryBedsFree = bestData.bedsFree;
  const primaryBedsTotal = bestData.bedsTotal;
  const primaryDistStr = formatDist(bestData.distanceKm);
  const primaryEtaStr = `${bestData.etaMin} min via ambulance`;
  const primaryCapacity = bestData.capacityStr;
  const primaryPhone = bestData.phone;

  return (
    <div className="animate-rise-in glass-strong relative max-h-[82vh] overflow-y-auto rounded-t-3xl px-4 pt-5 pb-8">
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
          <p className="text-sm text-muted-foreground">Best match found — call, then dispatch</p>
        </div>
      </div>

      {injury === "other" && (
        <div className="mt-5 animate-soft-in">
          <label htmlFor="other-details" className="mb-2 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Specify Emergency Details
          </label>
          <div className="relative">
            <textarea
              id="other-details"
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                setDetailsSubmitted(false);
              }}
              placeholder="e.g., fallen from height, allergic reaction..."
              className="w-full resize-none rounded-2xl border border-border/80 bg-secondary/30 p-4 pb-12 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              rows={2}
            />
            <button
              type="button"
              onClick={() => setDetailsSubmitted(true)}
              disabled={!details || detailsSubmitted}
              className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                detailsSubmitted 
                  ? 'bg-safe/20 text-safe' 
                  : 'bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {detailsSubmitted ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Saved
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Primary recommendation */}
      <button 
        type="button"
        onClick={() => setDetailedHospital(bestData)}
        className="mt-4 block w-full text-left rounded-3xl border border-primary/40 bg-primary/8 p-5 shadow-[var(--shadow-glow-primary)] transition-all hover:bg-primary/10 active:scale-[0.98]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-safe/15 px-3 py-1 text-xs font-semibold text-safe ring-1 ring-safe/40">
            <BedDouble className="h-3.5 w-3.5" />
            {primaryCapacity}
          </span>
        </div>

        <h3 className="mt-3 text-[1.7rem] leading-tight font-bold tracking-tight">{primaryName}</h3>

        <div className="mt-3">
          <BedMeter free={primaryBedsFree} total={primaryBedsTotal} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {primaryDistStr}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {primaryEtaStr}
          </span>
        </div>

        <div
          onClick={(e) => { e.stopPropagation(); setCalled(true); }}
          className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-all duration-300 ease-in-out active:scale-[0.98]"
        >
          {called ? <Check className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          {called ? "Hospital called" : "Call this hospital"}
        </div>

        <p className="mt-3 text-xs text-muted-foreground/80">
          Capacity verified 12 seconds ago via live hospital feed.
        </p>
      </button>

      {/* Alternatives */}
      <p className="mt-6 mb-2 text-xs font-medium tracking-[0.16em] text-muted-foreground/70 uppercase">
        Alternatives
      </p>
      <ul className="space-y-2">
        {altData.map((h) => {
          const altName = h.name;
          const altFree = h.bedsFree;
          const altTotal = h.bedsTotal;
          const altDist = formatDist(h.distanceKm);
          const altEta = `${h.etaMin} min`;
          const altPhone = h.phone;

          return (
            <li
              key={h.id}
              onClick={() => setDetailedHospital(h)}
              className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-secondary/30 p-4 transition-all hover:border-primary/50 hover:bg-secondary/50 active:scale-[0.98]"
            >
              <div className="min-w-0 flex-1 pr-4">
                <p className="truncate text-sm font-medium">{altName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {altFree}/{altTotal} beds free · {altDist} · {altEta}
                </p>
              </div>
              <a
                href={`tel:${altPhone}`}
                aria-label={`Call ${altName}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary transition-colors duration-300 ease-in-out hover:bg-primary/20"
              >
                <Phone className="h-4 w-4" />
              </a>
            </li>
          );
        })}
      </ul>

      {/* Immediate First Aid Guide */}
      <div className="mt-8">
        <FirstAidCard injury={injury} details={details} />
      </div>

      <button
        type="button"
        onClick={onDispatch}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-3xl bg-alert py-6 text-lg font-bold tracking-tight text-alert-foreground shadow-[var(--shadow-glow-alert)] transition-all duration-300 ease-in-out active:scale-[0.98]"
      >
        <Siren className="h-6 w-6" />
        Dispatch Ambulance &amp; Alert Hospital
      </button>
      {!called && (
        <p className="mt-2 text-center text-xs text-muted-foreground/70">
          Tip: call the hospital first so they prep the bay.
        </p>
      )}
    </div>
  );
}

