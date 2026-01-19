import { useState, useMemo } from 'react';
import ComplaintHeatmap from '../admin/Heatmap';
import ClusterMap from './ClusterMap';

export default function MapWithFilters({ complaints = [] }) {
  const [view, setView] = useState('heat'); // 'heat' | 'cluster'
  const [category, setCategory] = useState('all');
  const categories = ['all', 'garbage', 'potholes', 'electric_poles', 'fallen_trees', 'misc'];

  const filtered = useMemo(() => {
    if (category === 'all') return complaints;
    return complaints.filter((c) => c.category === category);
  }, [complaints, category]);

  const heatPoints = filtered
    .filter((c) => c.location?.coordinates)
    .map((c) => ({ lat: c.location.coordinates[1], lng: c.location.coordinates[0] }));

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex gap-2 mb-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-2 py-1 text-sm">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setView('heat')} className={`px-3 py-1 text-sm rounded ${view === 'heat' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>Heatmap</button>
        <button onClick={() => setView('cluster')} className={`px-3 py-1 text-sm rounded ${view === 'cluster' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>Clusters</button>
      </div>
      {view === 'heat' ? <ComplaintHeatmap points={heatPoints} /> : <ClusterMap complaints={filtered} />}
    </div>
  );
}
