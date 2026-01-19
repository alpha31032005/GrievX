import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiCheck, FiClock, FiLoader, FiSearch } from 'react-icons/fi';
import api from '../../services/api';

// Status step mapping
const STATUS_STEPS = {
  open: 0,
  pending: 0,
  in_progress: 1,
  resolved: 2,
  closed: 2,
  completed: 2,
};

const STEP_LABELS = ['Pending', 'In Progress', 'Completed'];

// Status Tracker Component
const StatusTracker = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto my-6">
      {STEP_LABELS.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === STEP_LABELS.length - 1;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                    : isCurrent
                    ? 'bg-primary-600 shadow-lg shadow-primary-600/30 animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                {isCompleted ? (
                  <FiCheck className="w-6 h-6" />
                ) : isCurrent ? (
                  <FiLoader className="w-6 h-6 animate-spin" />
                ) : (
                  <FiClock className="w-5 h-5" />
                )}
              </div>
              <span
                className={`mt-2 text-sm font-semibold ${
                  isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : isCurrent
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className="flex-1 mx-2">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function TrackStatus() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [filteredComplaints, setFilteredComplaints] = useState([]);

  useEffect(() => {
    api.get('/complaints/user/me')
      .then((res) => {
        const data = res.data.complaints || res.data || [];
        setComplaints(data);
        setFilteredComplaints(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching complaints:', err);
        setLoading(false);
      });
  }, []);

  // Filter by complaint ID
  const handleSearch = (value) => {
    setSearchId(value);
    if (!value.trim()) {
      setFilteredComplaints(complaints);
    } else {
      const filtered = complaints.filter(c => 
        c._id.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredComplaints(filtered);
    }
  };

  const getStatusStep = (status) => STATUS_STEPS[status] ?? 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-10">
        
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
            <span className="text-gray-900 dark:text-white font-semibold">Track Status</span>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
          Track Complaint Status
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Monitor the progress of your submitted complaints
        </p>

        {/* Search Box */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by Complaint ID..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
            <FiClock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchId ? 'No complaints found with that ID' : 'No complaints to track'}
            </p>
            <Link
              to="/citizen/complaint"
              className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              File a New Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                {/* Complaint Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Complaint ID
                    </p>
                    <p className="text-sm font-mono text-primary-600 dark:text-primary-400">
                      #{complaint._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Filed on</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Category & Description */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize mb-1">
                    {complaint.category?.replace('_', ' ') || 'General Issue'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {complaint.description}
                  </p>
                </div>

                {/* Status Tracker */}
                <StatusTracker currentStep={getStatusStep(complaint.status)} />

                {/* Current Status Label */}
                <div className="text-center mt-4">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      getStatusStep(complaint.status) === 2
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : getStatusStep(complaint.status) === 1
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {getStatusStep(complaint.status) === 2
                      ? '✅ Resolved'
                      : getStatusStep(complaint.status) === 1
                      ? '🔄 Being Processed'
                      : '⏳ Awaiting Review'}
                  </span>
                </div>

                {/* Resolution Info (if resolved) */}
                {complaint.resolution && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <strong>Resolution:</strong> {complaint.resolution}
                    </p>
                    {complaint.resolutionDate && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Resolved on {formatDate(complaint.resolutionDate)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
