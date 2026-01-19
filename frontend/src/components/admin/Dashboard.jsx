import { useState, useEffect, useMemo } from 'react';
import { FiFileText, FiClock, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AdminStatsCard from './AdminStatsCard';
import AdminComplaintTable from './ComplaintTable';

export default function AdminDashboard() {
  const { user, department } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/all')
      .then((res) => setComplaints(res.data.complaints || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Compute stats from complaints
  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending' || c.status === 'open').length,
    inProgress: complaints.filter((c) => c.status === 'in-progress' || c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
  }), [complaints]);

  if (loading) return <div className="flex justify-center py-20">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">
          {department ? `Department: ${department.replace('_', ' ')}` : 'All Departments'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard title="Total Complaints" value={stats.total} icon={FiFileText} color="blue" />
        <AdminStatsCard title="Pending" value={stats.pending} icon={FiClock} color="yellow" />
        <AdminStatsCard title="In Progress" value={stats.inProgress} icon={FiLoader} color="blue" />
        <AdminStatsCard title="Resolved" value={stats.resolved} icon={FiCheckCircle} color="green" />
      </div>

      {/* Complaints Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Complaints</h2>
        <AdminComplaintTable
          complaints={complaints.slice(0, 10)}
          onRowClick={(c) => console.log('View complaint:', c._id)}
        />
      </div>
    </div>
  );
}