import { useState, useMemo } from 'react';
import ComplaintHeatmap from '../admin/Heatmap';
import ClusterMap from './ClusterMap';

const STATUS_LEGEND = [
  { label: 'Open', color: '#EF4444' },
  { label: 'In Progress', color: '#F59E0B' },
  { label: 'Resolved', color: '#22C55E' },
  { label: 'Rejected', color: '#6B7280' },
  { label: 'Closed', color: '#3B82F6' },
];

export default function MapWithFilters({ complaints = [] }) {
  const [view, setView] = useState('cluster'); // 'heat' | 'cluster'
  const [category, setCategory] = useState('all');
  const categories = ['all', 'garbage', 'potholes', 'electric_poles', 'fallen_trees', 'misc'];

  const filtered = useMemo(() => {
    if (category === 'all') return complaints;
    return complaints.filter((c) => c.category === category);
  }, [complaints, category]);

  const heatPoints = filtered
    .filter((c) => c.location?.coordinates)
    .map((c) => ({ lat: c.location.coordinates[1], lng: c.location.coordinates[0] }));

  const geoCount = filtered.filter((c) => c.location?.coordinates).length;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-500"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>

        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setView('cluster')}
            className={`px-3 py-1.5 text-sm font-medium transition ${
              view === 'cluster'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Markers
          </button>
          <button
            onClick={() => setView('heat')}
            className={`px-3 py-1.5 text-sm font-medium transition ${
              view === 'heat'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Heatmap
          </button>
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {geoCount} of {filtered.length} complaints have GPS data
        </span>
      </div>

      {/* Map */}
      {view === 'heat' ? <ComplaintHeatmap points={heatPoints} /> : <ClusterMap complaints={filtered} />}

      {/* Status Legend (shown in cluster/marker view) */}
      {view === 'cluster' && (
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Legend:</span>
          {STATUS_LEGEND.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
