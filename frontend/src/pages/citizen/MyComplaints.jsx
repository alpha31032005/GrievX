import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiCalendar, FiMapPin } from 'react-icons/fi';
import api from '../../services/api';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/user/me')
      .then((res) => {
        setComplaints(res.data.complaints || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching complaints:', err);
        setLoading(false);
      });
  }, []);

  const statusColors = {
    open: 'bg-yellow-500',
    in_progress: 'bg-blue-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500',
  };

  const priorityColors = {
    low: 'bg-gray-400',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/citizen/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <FiHome className="w-4 h-4" />
            <span>/</span>
            <Link to="/citizen/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-semibold">My Complaints</span>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
          My Complaints
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Track all your submitted civic issue reports
        </p>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No complaints found</p>
            <Link
              to="/citizen/complaint"
              className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              File Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 space-y-4"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${statusColors[complaint.status] || 'bg-gray-500'}`}>
                    {complaint.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  {complaint.priority && (
                    <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${priorityColors[complaint.priority] || 'bg-gray-400'}`}>
                      {complaint.priority?.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Category */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                  {complaint.category || 'General Issue'}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                  {complaint.description || 'No description provided'}
                </p>

                {/* Location */}
                {complaint.location && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <FiMapPin className="w-4 h-4" />
                    <span className="truncate">{complaint.location}</span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 text-xs">
                  <FiCalendar className="w-4 h-4" />
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Image Preview */}
                {complaint.imageUrl && (
                  <img
                    src={complaint.imageUrl}
                    alt="Complaint"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
