import { useEffect, useRef, useState } from "react";
import { Radio, AlertTriangle } from "lucide-react";

// NOTE: react-leaflet and leaflet are NOT imported at the top level.
// They access `window` at module initialization time, which crashes SSR.
// We lazy-load them entirely inside useEffect (client-only).

/** Live map surface: aesthetic map plate + grid overlay + GPS pin. */
export function MapCanvas({ 
  dispatching = false,
  onLocationUpdate,
}: { 
  dispatching?: boolean;
  onLocationUpdate?: (loc: [number, number]) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [location, setLocation] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Reverse geocode when location changes
  useEffect(() => {
    if (!location) return;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location[0]}&lon=${location[1]}&zoom=18&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        if (data?.address) {
          const addr = data.address;
          const specific = addr.neighbourhood || addr.suburb || addr.village || addr.road || addr.pedestrian;
          const broad = addr.city || addr.town || addr.county || addr.state_district;
          let formattedAddress = "Unknown location";
          if (specific && broad && specific !== broad) {
            formattedAddress = `${specific}, ${broad}`;
          } else if (specific) {
            formattedAddress = specific;
          } else if (broad) {
            formattedAddress = broad;
          } else if (addr.state) {
            formattedAddress = addr.state;
          }
          setAddress(formattedAddress);
        }
      })
      .catch(console.error);
  }, [location]);

  const fetchIpLocation = async (fallbackMsg: string) => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const newLoc: [number, number] = [data.latitude, data.longitude];
        setLocation(prev => prev || newLoc);
        if (onLocationUpdate) onLocationUpdate(newLoc);
        setAccuracy(prev => prev || 5000);
        setErrorMsg(fallbackMsg + " (Using IP est.)");
      }
    } catch {
      setLocation(prev => prev || [51.505, -0.09]);
      setAccuracy(prev => prev || 10);
      setErrorMsg("GPS Failed & IP Failed");
    }
  };

  // Initialize map (client-only via dynamic import)
  useEffect(() => {
    setMounted(true);
    let watchId: number | null = null;
    let leafletMap: any = null;

    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // Dynamic import — runs only in browser, never on SSR server
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      const { MapContainer, TileLayer, Marker } = await import("react-leaflet");

      // Store for later use (we'll manage map via L directly)
      const map = L.map(mapContainerRef.current, {
        center: [51.505, -0.09],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "",
      }).addTo(map);

      const blueDotIcon = L.divIcon({
        className: "bg-transparent border-none",
        html: `<div class="relative flex h-6 w-6 items-center justify-center">
                 <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" style="animation-duration: 2s;"></span>
                 <span class="relative inline-flex h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md"></span>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      mapInstanceRef.current = map;

      // Update marker helper
      const updateMarker = (loc: [number, number]) => {
        if (markerRef.current) {
          markerRef.current.setLatLng(loc);
        } else {
          markerRef.current = L.marker(loc, { icon: blueDotIcon }).addTo(map);
        }
        const targetPoint = map.project(loc, map.getZoom());
        targetPoint.y += 200;
        const offsetCenter = map.unproject(targetPoint, map.getZoom());
        map.setView(offsetCenter, map.getZoom(), { animate: true });
      };

      // Start geolocation
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const newLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            setLocation(prev => {
              if (prev) return prev;
              if (onLocationUpdate) onLocationUpdate(newLoc);
              setAccuracy(pos.coords.accuracy);
              updateMarker(newLoc);
              return newLoc;
            });
          },
          () => {},
          { enableHighAccuracy: false, maximumAge: Infinity, timeout: 5000 }
        );

        watchId = navigator.geolocation.watchPosition(
          pos => {
            const newLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            setLocation(newLoc);
            if (onLocationUpdate) onLocationUpdate(newLoc);
            setAccuracy(pos.coords.accuracy);
            setErrorMsg(null);
            updateMarker(newLoc);
          },
          err => {
            let msg = "GPS Error";
            if (err.code === 1) msg = "Permission Denied";
            if (err.code === 2) msg = "Position Unavailable";
            if (err.code === 3) msg = "GPS Timeout";
            fetchIpLocation(msg).then(() => {
              setLocation(prev => {
                if (prev) updateMarker(prev);
                return prev;
              });
            });
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
      } else {
        fetchIpLocation("Browser doesn't support GPS");
      }
    };

    initMap().catch(console.error);

    return () => {
      if (watchId !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-zinc-950">
      {/* Map mounts here — leaflet takes over this div */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* Grid overlay for aesthetic */}
      <div className="grid-map absolute inset-0 opacity-60 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/10 to-background pointer-events-none z-10" />

      {dispatching && (
        <div
          className="absolute inset-0 animate-heartbeat pointer-events-none z-20"
          style={{ background: "var(--gradient-heartbeat)" }}
        />
      )}

      <div className="absolute top-20 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 pointer-events-auto shadow-md">
          {errorMsg ? (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          ) : (
            <Radio className={`h-3.5 w-3.5 ${location && accuracy && accuracy < 1000 ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
          )}
          <span className="text-[0.7rem] font-medium tracking-wide text-muted-foreground flex items-center gap-1">
            {errorMsg ? (
              <span className="text-amber-500/90">{errorMsg}</span>
            ) : location ? (
              address 
                ? `${address} · ${accuracy ? Math.round(accuracy) : "--"} m accuracy`
                : `GPS locked · ${accuracy ? Math.round(accuracy) : "--"} m accuracy`
            ) : (
              "Acquiring GPS..."
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
