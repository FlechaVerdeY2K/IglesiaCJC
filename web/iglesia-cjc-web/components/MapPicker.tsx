"use client";
import { useEffect, useRef } from "react";

const CHURCH_LAT = 9.9478;
const CHURCH_LNG = -83.9986;

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, address: string) => void;
};

export default function MapPicker({ lat, lng, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet (requires window)
    import("leaflet").then(L => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initLat = lat || CHURCH_LAT;
      const initLng = lng || CHURCH_LNG;

      const map = L.map(mapRef.current!).setView([initLat, initLng], 16);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map);
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
        onChange(pos.lat, pos.lng, address);
      });

      map.on("click", async (e: any) => {
        marker.setLatLng(e.latlng);
        const address = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        onChange(e.latlng.lat, e.latlng.lng, address);
      });
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker when lat/lng props change externally
  useEffect(() => {
    if (!markerRef.current || !lat || !lng) return;
    markerRef.current.setLatLng([lat, lng]);
    mapInstanceRef.current?.setView([lat, lng], 16);
  }, [lat, lng]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: "240px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }} />
      <p className="text-white/25 text-xs mt-1">Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación</p>
    </>
  );
}
