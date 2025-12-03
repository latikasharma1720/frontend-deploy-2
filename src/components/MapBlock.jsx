import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/** Simple pin icon so markers render */
const pin = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -32],
  shadowSize: [41, 41],
});

/** Fit map to two points */
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds.pad(0.25), { animate: true });
  }, [points, map]);
  return null;
}

/** Debounce helper */
const useDebounced = (value, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
};

export default function MapBlock({
  pickupText = "",
  dropoffText = "",
  /** center Fort Wayne, IN */
  initialCenter = { lat: 41.0793, lng: -85.1394 },
  height = 360,
}) {
  const debouncedPickup = useDebounced(pickupText.trim());
  const debouncedDrop = useDebounced(dropoffText.trim());

  const [pickupPt, setPickupPt] = useState(null);
  const [dropPt, setDropPt] = useState(null);
  const [error, setError] = useState("");

  // Abort inflight lookups if user types again
  const abortRef = useRef(null);

  // Restrict search to an area around Fort Wayne to improve accuracy and avoid weird results
  // (rough box around the city)
  const viewbox = "-85.35,41.20,-84.95,40.95"; // lonW,latN,lonE,latS

  async function geocode(q) {
    // Clean up any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=0&q=${encodeURIComponent(
      q
    )}&viewbox=${viewbox}&bounded=1`;

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          // You cannot set User-Agent from the browser; Accept-Language is fine.
          "Accept-Language": "en",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    } catch (err) {
      // Swallow network/abort/rate errors and surface a friendly note
      console.warn("Geocode failed:", err);
      return null;
    }
  }

  // Lookup both points when user stops typing
  useEffect(() => {
    let mounted = true;

    (async () => {
      setError("");

      // Only geocode if BOTH have values
      if (!debouncedPickup || !debouncedDrop) {
        setPickupPt(null);
        setDropPt(null);
        return;
      }

      const [p1, p2] = await Promise.all([geocode(debouncedPickup), geocode(debouncedDrop)]);

      if (!mounted) return;

      setPickupPt(p1);
      setDropPt(p2);

      if (!p1 || !p2) {
        setError("We couldn’t locate one or both places. Please refine the addresses (include 'Fort Wayne, IN').");
      }
    })();

    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, [debouncedPickup, debouncedDrop]);

  const points = useMemo(() => {
    const arr = [];
    if (pickupPt) arr.push(pickupPt);
    if (dropPt) arr.push(dropPt);
    return arr;
  }, [pickupPt, dropPt]);

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.12)", marginTop: 16 }}>
      {error && (
        <div
          style={{
            background: "#fff6e5",
            color: "#8a5a00",
            padding: "10px 12px",
            fontSize: 14,
            borderBottom: "1px solid #f1dfbf",
          }}
        >
          ⚠️ {error}
        </div>
      )}
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={12}
        style={{ height }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pickupPt && <Marker position={pickupPt} icon={pin} />}
        {dropPt && <Marker position={dropPt} icon={pin} />}

        {pickupPt && dropPt && (
          <Polyline positions={[pickupPt, dropPt]} pathOptions={{ weight: 4, opacity: 0.9 }} />
        )}

        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}
