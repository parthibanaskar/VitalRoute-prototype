import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

const userIcon = divIcon({
  className: "bg-transparent border-none",
  html: `<div class="relative flex h-5 w-5 items-center justify-center">
           <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" style="animation-duration: 2s;"></span>
           <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary border border-white shadow-sm"></span>
         </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const ambulanceIcon = divIcon({
  className: "bg-transparent border-none",
  html: `<div class="relative flex h-6 w-6 items-center justify-center">
           <span class="absolute inline-flex h-full w-full animate-pulse rounded-full bg-alert opacity-75"></span>
           <span class="relative inline-flex h-3.5 w-3.5 rounded-full bg-alert border-2 border-white shadow-md flex items-center justify-center text-white text-[8px] font-bold">+</span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapFitter({ bounds }: { bounds: [[number, number], [number, number]] | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [30, 30], animate: false });
    }
  }, [map, bounds]);
  return null;
}

export function AmbulanceMap({ 
  userLocation, 
  totalSeconds 
}: { 
  userLocation: [number, number]; 
  totalSeconds: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [ambLocation, setAmbLocation] = useState<[number, number]>([0, 0]);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Simulate ambulance starting ~1.5km away
    const startLoc: [number, number] = [
      userLocation[0] - 0.015,
      userLocation[1] - 0.015
    ];
    setAmbLocation(startLoc);
    
    setBounds([startLoc, userLocation]);

    const startTime = Date.now();
    const durationMs = totalSeconds * 1000;

    let frameId: number;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      let progress = elapsed / durationMs;
      if (progress > 1) progress = 1;

      const currentLat = startLoc[0] + (userLocation[0] - startLoc[0]) * progress;
      const currentLng = startLoc[1] + (userLocation[1] - startLoc[1]) * progress;
      
      setAmbLocation([currentLat, currentLng]);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(frameId);
  }, [userLocation, totalSeconds]);

  if (!mounted) return <div className="h-40 w-full rounded-2xl bg-secondary/30 animate-pulse" />;

  return (
    <div className="h-40 w-full overflow-hidden rounded-2xl border border-border/50 relative">
      <MapContainer
        center={userLocation}
        zoom={14}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />
        <Marker position={userLocation} icon={userIcon} />
        <Marker position={ambLocation} icon={ambulanceIcon} />
        <MapFitter bounds={bounds} />
      </MapContainer>
      
      {/* Vignette overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none ring-1 ring-inset ring-white/10 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
