import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Status → color mapping for markers
const STATUS_COLORS = {
  open: '#EF4444',        // red
  in_progress: '#F59E0B', // amber
  resolved: '#22C55E',    // green
  rejected: '#6B7280',    // gray
  closed: '#3B82F6',      // blue
};

// Create a colored circle-marker icon using inline SVG
const createColoredIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
    <circle cx="14" cy="14" r="6" fill="#fff"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
};

// Format category name for display
const formatCategory = (cat) =>
  cat ? cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'N/A';

export default function ClusterMap({ complaints = [], center = [20.7931, 76.6997] }) {
  // Filter to only complaints that have valid coordinates
  const mappable = complaints.filter(
    (c) => c.location?.coordinates?.[0] && c.location?.coordinates?.[1]
  );

  return (
    <MapContainer center={center} zoom={13} className="h-96 w-full rounded-lg z-0">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      />
      <MarkerClusterGroup chunkedLoading>
        {mappable.map((c) => {
          const color = STATUS_COLORS[c.status] || '#6B7280';
          return (
            <Marker
              key={c._id}
              position={[c.location.coordinates[1], c.location.coordinates[0]]}
              icon={createColoredIcon(color)}
            >
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <p className="font-bold text-gray-800 mb-1 leading-tight">{c.title || c.description?.substring(0, 60)}</p>
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <p><span className="font-semibold">ID:</span> {c._id?.substring(0, 10)}…</p>
                    <p><span className="font-semibold">Type:</span> {formatCategory(c.category)}</p>
                    <p>
                      <span className="font-semibold">Status:</span>{' '}
                      <span style={{ color }} className="font-semibold capitalize">{c.status?.replace('_', ' ')}</span>
                    </p>
                    {c.locationName && <p><span className="font-semibold">Area:</span> {c.locationName}</p>}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
