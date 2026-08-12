import { useEffect, useRef, useState } from "react";

// NO top-level leaflet import — would crash SSR
// All leaflet code is inside useEffect (browser-only)

export function AmbulanceMap({ 
  userLocation, 
  totalSeconds 
}: { 
  userLocation: [number, number]; 
  totalSeconds: number;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let frameId: number;

    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const startLoc: [number, number] = [
        userLocation[0] - 0.015,
        userLocation[1] - 0.015,
      ];

      const map = L.map(mapContainerRef.current, {
        center: userLocation,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "",
      }).addTo(map);

      const userIcon = L.divIcon({
        className: "bg-transparent border-none",
        html: `<div class="relative flex h-5 w-5 items-center justify-center">
                 <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" style="animation-duration: 2s;"></span>
                 <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary border border-white shadow-sm"></span>
               </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const ambulanceIcon = L.divIcon({
        className: "bg-transparent border-none",
        html: `<div class="relative flex h-6 w-6 items-center justify-center">
                 <span class="absolute inline-flex h-full w-full animate-pulse rounded-full bg-red-500 opacity-75"></span>
                 <span class="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white shadow-md items-center justify-center text-white text-[8px] font-bold">+</span>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(userLocation, { icon: userIcon }).addTo(map);
      const ambMarker = L.marker(startLoc, { icon: ambulanceIcon }).addTo(map);

      map.fitBounds([startLoc, userLocation], { padding: [30, 30], animate: false });

      mapInstanceRef.current = map;

      const startTime = Date.now();
      const durationMs = totalSeconds * 1000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        let progress = Math.min(elapsed / durationMs, 1);

        const currentLat = startLoc[0] + (userLocation[0] - startLoc[0]) * progress;
        const currentLng = startLoc[1] + (userLocation[1] - startLoc[1]) * progress;
        ambMarker.setLatLng([currentLat, currentLng]);

        if (progress < 1) {
          frameId = requestAnimationFrame(animate);
        }
      };

      frameId = requestAnimationFrame(animate);
    };

    initMap().catch(console.error);

    return () => {
      cancelAnimationFrame(frameId);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, totalSeconds]);

  if (!mounted) {
    return <div className="h-40 w-full rounded-2xl bg-secondary/30 animate-pulse" />;
  }

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-border/50">
      <div ref={mapContainerRef} className="h-full w-full" />
      {/* Vignette overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none ring-1 ring-inset ring-white/10 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
