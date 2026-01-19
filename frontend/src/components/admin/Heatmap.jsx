import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';

// Heatmap layer component
function HeatLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points?.length) return;
    const heat = L.heatLayer(points.map(p => [p.lat, p.lng, p.intensity || 1]), {
      radius: 25, blur: 15, maxZoom: 17,
    }).addTo(map);
    return () => map.removeLayer(heat);
  }, [map, points]);
  return null;
}

export default function ComplaintHeatmap({ points = [], center = [19.076, 72.877] }) {
  return (
    <MapContainer center={center} zoom={12} className="h-96 w-full rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <HeatLayer points={points} />
    </MapContainer>
  );
}