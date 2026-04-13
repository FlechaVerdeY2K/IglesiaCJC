"use client";
import { useEffect, useRef, useState } from "react";
import { Search, Loader } from "lucide-react";
import type { LeafletMouseEvent, Map as LeafletMap, Marker } from "leaflet";

const CHURCH_LAT = 9.95239;
const CHURCH_LNG = -84.05036;

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, address: string) => void;
};

export default function MapPicker({ lat, lng, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const initialCenterRef = useRef({
    lat: lat || CHURCH_LAT,
    lng: lng || CHURCH_LNG,
  });
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;
    const mapElement = mapRef.current;

    import("leaflet").then(L => {
      if (cancelled || !mapElement || mapInstanceRef.current) return;

      const markerIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        shadowSize: [41, 41],
      });

      const initLat = initialCenterRef.current.lat;
      const initLng = initialCenterRef.current.lng;

      const map = L.map(mapElement).setView([initLat, initLng], 16);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const marker = L.marker([initLat, initLng], { draggable: true, icon: markerIcon }).addTo(map);
      markerRef.current = marker;

      const reverseGeocode = async (lat: number, lng: number) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await res.json();
          return data.display_name as string;
        } catch {
          return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
      };

      marker.on("dragend", async () => {
        const pos = marker.getLatLng();
        const address = await reverseGeocode(pos.lat, pos.lng);
        onChangeRef.current(pos.lat, pos.lng, address);
      });

      map.on("click", async (e: LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        const address = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        onChangeRef.current(e.latlng.lat, e.latlng.lng, address);
      });
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!markerRef.current || !lat || !lng) return;
    markerRef.current.setLatLng([lat, lng]);
    mapInstanceRef.current?.setView([lat, lng], 16);
  }, [lat, lng]);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=cr`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  const selectResult = (r: { display_name: string; lat: string; lon: string }) => {
    const rlat = parseFloat(r.lat);
    const rlng = parseFloat(r.lon);
    markerRef.current?.setLatLng([rlat, rlng]);
    mapInstanceRef.current?.setView([rlat, rlng], 17);
    onChange(rlat, rlng, r.display_name);
    setResults([]);
    setQuery(r.display_name.split(",")[0]);
  };

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Search bar */}
      <div className="relative mb-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="input w-full pl-8 text-sm"
              placeholder="Buscar dirección..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); search(); } }}
            />
          </div>
          <button
            type="button"
            onClick={search}
            disabled={searching}
            className="px-3 py-2 rounded-xl border border-border text-white/60 hover:text-white hover:border-white/30 transition-all text-sm flex items-center gap-1.5"
          >
            {searching ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
          </button>
        </div>

        {/* Results dropdown */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border overflow-hidden z-[1000]" style={{ background: "#0D1628" }}>
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white border-b border-white/5 last:border-0 transition-colors"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={mapRef} style={{ height: "240px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }} />
      <p className="text-white/25 text-xs mt-1">Busca una dirección o haz clic en el mapa para ubicar el evento</p>
    </>
  );
}
