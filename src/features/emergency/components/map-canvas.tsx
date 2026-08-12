import { useEffect, useState } from "react";
import { Radio, AlertTriangle } from "lucide-react";
import { MapContainer, TileLayer, useMap, Marker } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      // Convert the GPS coordinate to a pixel coordinate at the current zoom
      const targetPoint = map.project(center, map.getZoom());
      
      // Shift the map's center 200 pixels DOWN (Y axis increases downwards).
      // This causes the marker to visually appear 200 pixels HIGHER on the screen.
      targetPoint.y += 200;
      
      // Convert back to GPS coordinates and set absolute view
      const offsetCenter = map.unproject(targetPoint, map.getZoom());
      map.setView(offsetCenter, map.getZoom(), { animate: true });
    }
  }, [map, center]);
  return null;
}

const blueDotIcon = divIcon({
  className: "bg-transparent border-none",
  html: `<div class="relative flex h-6 w-6 items-center justify-center">
           <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" style="animation-duration: 2s;"></span>
           <span class="relative inline-flex h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md"></span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/** Live map surface: aesthetic map plate + grid overlay + GPS pin. */
export function MapCanvas({ 
  dispatching = false,
  onLocationUpdate,
}: { 
  dispatching?: boolean;
  onLocationUpdate?: (loc: [number, number]) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reverse geocode when location changes
  useEffect(() => {
    if (location) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location[0]}&lon=${location[1]}&zoom=18&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
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
    }
  }, [location]);

  const fetchIpLocation = async (fallbackMsg: string) => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const newLoc: [number, number] = [data.latitude, data.longitude];
        setLocation((prev) => prev || newLoc);
        if (onLocationUpdate) onLocationUpdate(newLoc);
        setAccuracy((prev) => prev || 5000); 
        setErrorMsg(fallbackMsg + " (Using IP est.)");
      }
    } catch (err) {
      setLocation((prev) => prev || [51.505, -0.09]);
      setAccuracy((prev) => prev || 10);
      setErrorMsg("GPS Failed & IP Failed");
    }
  };

  useEffect(() => {
    setMounted(true);
    let watchId: number | null = null;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setLocation(newLoc);
          if (onLocationUpdate) onLocationUpdate(newLoc);
          setAccuracy(pos.coords.accuracy);
          setErrorMsg(null); // Clear errors on success
        },
        (err) => {
          console.warn("Geolocation error:", err);
          let msg = "GPS Error";
          if (err.code === 1) msg = "Permission Denied";
          if (err.code === 2) msg = "Position Unavailable (No HTTPS?)";
          if (err.code === 3) msg = "GPS Timeout";
          fetchIpLocation(msg);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
      );
    } else {
      fetchIpLocation("Browser doesn't support GPS");
    }

    return () => {
      if (watchId !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-zinc-950">
      {mounted && (
        <MapContainer
          center={location || [51.505, -0.09]}
          zoom={16}
          zoomControl={false}
          attributionControl={false}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          />
          {location && <Marker position={location} icon={blueDotIcon} />}
          <MapUpdater center={location} />
        </MapContainer>
      )}

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
