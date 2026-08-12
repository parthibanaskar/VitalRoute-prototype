import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, ShieldCheck } from "lucide-react";
import type { InjuryId } from "@/lib/vitalroute-data";
import { INJURIES } from "@/lib/vitalroute-data";
import { MapCanvas } from "@/features/emergency/components/map-canvas";
import { InjurySelector } from "@/features/emergency/components/injury-selector";
import { ScanOverlay } from "@/features/emergency/components/scan-overlay";
import { RecommendationSheet } from "@/features/emergency/components/recommendation-sheet";
import { ActiveDispatch } from "@/features/emergency/components/active-dispatch";
import { OfflineSurvival } from "@/features/emergency/components/offline-survival";
import { fetchLiveHospitals, getDistance, type HospitalData } from "@/lib/hospital-api";

const TITLE = "VitalRoute — Two-Tap Emergency Dispatch";
const DESCRIPTION =
  "VitalRoute closes the panic gap: instant GPS, live hospital trauma-bed capacity, and ambulance dispatch with hospital pre-alert in two taps.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VitalRoute,
});

type Phase = "idle" | "scanning" | "recommendation" | "dispatched" | "offline";

function VitalRoute() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [legalAgreed, setLegalAgreed] = useState(false);
  const [injury, setInjury] = useState<InjuryId>("trauma");
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState<[number, number] | null>(null);
  
  // Background pre-fetching state
  const [hospitals, setHospitals] = useState<HospitalData[] | null>(null);
  const lastFetchedLoc = useRef<[number, number] | null>(null);
  
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-fetch hospitals immediately when location is found, but prevent rapid double-fetching
  useEffect(() => {
    if (location) {
      if (lastFetchedLoc.current) {
        const dist = getDistance(
          lastFetchedLoc.current[0], lastFetchedLoc.current[1],
          location[0], location[1]
        );
        // Only refetch if the user has moved more than 2km
        if (dist < 2) return;
      }
      
      lastFetchedLoc.current = location;
      fetchLiveHospitals(location[0], location[1]).then(data => {
        setHospitals(prev => {
          // If we got real data, use it. If we got rate-limited ([]), keep the old data if it exists.
          if (data && data.length > 0) return data;
          return prev ? prev : [];
        });
      });
    }
  }, [location]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleSelect = (id: InjuryId) => {
    setInjury(id);
    
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setPhase("offline");
      return;
    }

    setPhase("scanning");
    timer.current = setTimeout(() => setPhase("recommendation"), 1500);
  };

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setPhase("idle");
  };

  const injuryLabel = INJURIES.find((i) => i.id === injury)?.label ?? "";

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-background">
      {phase !== "dispatched" && (
        <MapCanvas 
          onLocationUpdate={(loc) => setLocation(loc)} 
        />
      )}

      {/* Top nav */}
      <header className="relative z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/45">
            <Activity className="h-5 w-5 text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg leading-none font-bold tracking-tight">
              VitalRoute
            </span>
            <span className="block text-[0.7rem] text-muted-foreground">
              Emergency response, two taps
            </span>
          </span>
        </div>
      </header>

      {/* Legal Warning Wall */}
      {!legalAgreed && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-md">
          <div className="animate-scale-in w-full max-w-sm rounded-3xl border border-alert/30 bg-background p-6 shadow-2xl">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-alert/10 text-alert ring-1 ring-alert/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-center text-xl font-bold tracking-tight text-foreground">Legal Warning</h2>
            <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
              Your exact GPS coordinates, IP address, and Device ID are actively logged. Misuse of emergency dispatch services or creating hoax calls is a felony punishable by law.
            </p>
            <button
              type="button"
              onClick={() => setLegalAgreed(true)}
              className="mt-6 w-full rounded-2xl bg-alert py-3.5 text-sm font-bold text-alert-foreground shadow-[var(--shadow-glow-alert)] transition-all hover:brightness-110 active:scale-[0.98]"
            >
              I Understand & Accept
            </button>
          </div>
        </div>
      )}

      {phase === "dispatched" ? (
        <div className="relative z-20 flex-1">
          <ActiveDispatch
          injury={injury}
          details={details}
          location={location}
          onCancel={reset}
        />
        </div>
      ) : phase === "offline" ? (
        <div className="relative z-20 flex-1 flex flex-col justify-end">
          <OfflineSurvival injury={injury} details={details} onBack={reset} />
        </div>
      ) : (
        <>
          <div className="flex-1" />
          <div className="relative z-20">
            {phase === "recommendation" ? (
              <RecommendationSheet
                injury={injury}
                location={location}
                preFetchedHospitals={hospitals}
                details={details}
                setDetails={setDetails}
                onBack={reset}
                onDispatch={() => setPhase("dispatched")}
              />
            ) : (
              <InjurySelector onSelect={handleSelect} />
            )}
          </div>
        </>
      )}

      {phase === "scanning" && <ScanOverlay label={injuryLabel} />}
    </main>
  );
}
