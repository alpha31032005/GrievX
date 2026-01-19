import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';

export default function ClusterMap({ complaints = [], center = [19.076, 72.877] }) {
  return (
    <MapContainer center={center} zoom={12} className="h-96 w-full rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup chunkedLoading>
        {complaints.map((c) => (
          <Marker key={c._id} position={[c.location?.coordinates[1], c.location?.coordinates[0]]}>
            <Popup>
              <strong>{c.title}</strong><br />
              <span className="text-xs">{c.category} • {c.status}</span>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
