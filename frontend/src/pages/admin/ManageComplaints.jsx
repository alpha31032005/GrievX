import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiCheckCircle, FiClock, FiXCircle, FiArrowLeft, FiHome, FiEye, FiLoader } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const ManageComplaints = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // Track which complaint is being updated
  const [selectedComplaint, setSelectedComplaint] = useState(null); // For modal view
  const [resolutionText, setResolutionText] = useState("");

  // Fetch complaints from backend
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    api.get("/complaints/all")
      .then((res) => {
        setComplaints(res.data.complaints || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching complaints:", err);
        setLoading(false);
      });
  };

  // Update complaint status
  const updateStatus = async (complaintId, newStatus, resolution = null) => {
    setUpdating(complaintId);
    try {
      const payload = { status: newStatus };
      if (resolution) payload.resolution = resolution;
      
      await api.put(`/complaints/${complaintId}/status`, payload);
      
      // Update local state
      setComplaints(prev => prev.map(c => 
        c._id === complaintId 
          ? { ...c, status: newStatus, resolution: resolution || c.resolution, resolutionDate: newStatus === 'resolved' ? new Date() : c.resolutionDate }
          : c
      ));
      
      setSelectedComplaint(null);
      setResolutionText("");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  const filteredData = complaints.filter((c) =>
    (c.category && c.category.toLowerCase().includes(search.toLowerCase())) ||
    (c.status && c.status.toLowerCase().includes(search.toLowerCase())) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Badge colors
  const statusColors = {
    open: "bg-yellow-500",
    in_progress: "bg-blue-500",
    resolved: "bg-green-500",
    closed: "bg-gray-500",
  };

  const statusLabels = {
    open: "Pending",
    in_progress: "In Progress",
    resolved: "Completed",
    closed: "Closed",
  };

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-24 w-72 h-72 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-16 right-24 w-80 h-80 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto animate-fadeInUp">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <FiHome className="w-4 h-4" />
            <span>/</span>
            <Link to="/admin/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-semibold">Manage Complaints</span>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Manage Complaints 🛠️
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          {user?.role === 'chief' ? 'Chief view of all civic issues across all departments.' : 'Admin view of ' + (user?.department || 'department') + ' complaints.'}
        </p>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading complaints...</p>
          </div>
        ) : (
          <>
        {/* Search Bar */}
        <div className="flex items-center mb-6 bg-white dark:bg-gray-800 rounded-xl shadow p-3 max-w-md">
          <FiSearch className="text-gray-500 dark:text-gray-300 w-5 h-5 mr-3" />
          <input
            type="text"
            placeholder="Search complaints..."
            className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto shadow-xl rounded-2xl">
          <table
            className={`min-w-full ${
              isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            } rounded-xl`}
          >
            <thead
              className={`${
                isDark ? "bg-gray-700" : "bg-gray-100"
              } text-left text-sm uppercase`}
            >
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((c) => (
                <tr
                  key={c._id}
                  className={`border-b ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  } hover:bg-gray-50 dark:hover:bg-gray-700 transition`}
                >
                  <td className="p-4">{c.user || "Citizen"}</td>
                  <td className="p-4 capitalize">{c.category}</td>
                  <td className="p-4">{c.location || "N/A"}</td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-white text-xs font-semibold ${
                        statusColors[c.status] || "bg-gray-500"
                      }`}
                    >
                      {statusLabels[c.status] || c.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="p-4">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex justify-center gap-2 flex-wrap">
                      {/* View Details */}
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition flex items-center gap-1 text-xs"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      {/* Mark In Progress - only show if not already in progress or resolved */}
                      {c.status === 'open' && (
                        <button
                          onClick={() => updateStatus(c._id, 'in_progress')}
                          disabled={updating === c._id}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-1 text-xs disabled:opacity-50"
                          title="Mark In Progress"
                        >
                          {updating === c._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiClock className="w-4 h-4" />}
                        </button>
                      )}

                      {/* Resolve - show if open or in progress */}
                      {(c.status === 'open' || c.status === 'in_progress') && (
                        <button
                          onClick={() => setSelectedComplaint({ ...c, action: 'resolve' })}
                          disabled={updating === c._id}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-1 text-xs disabled:opacity-50"
                          title="Mark Resolved"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Close - show for all except closed */}
                      {c.status !== 'closed' && (
                        <button
                          onClick={() => updateStatus(c._id, 'closed')}
                          disabled={updating === c._id}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-1 text-xs disabled:opacity-50"
                          title="Close Complaint"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
        )}

        {/* Modal for View/Resolve */}
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedComplaint.action === 'resolve' ? 'Resolve Complaint' : 'Complaint Details'}
                  </h2>
                  <button
                    onClick={() => { setSelectedComplaint(null); setResolutionText(""); }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Complaint Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Complaint ID</p>
                    <p className="font-mono text-sm text-primary-600 dark:text-primary-400">
                      #{selectedComplaint._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Status</p>
                    <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${statusColors[selectedComplaint.status]}`}>
                      {statusLabels[selectedComplaint.status] || selectedComplaint.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Category</p>
                    <p className="capitalize text-gray-900 dark:text-white">{selectedComplaint.category?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Department</p>
                    <p className="capitalize text-gray-900 dark:text-white">{selectedComplaint.department?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Filed On</p>
                    <p className="text-gray-900 dark:text-white">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Priority</p>
                    <p className="capitalize text-gray-900 dark:text-white">{selectedComplaint.priority || 'Medium'}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Description</p>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Image */}
                {selectedComplaint.imageUrl && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Attached Image</p>
                    <img
                      src={selectedComplaint.imageUrl}
                      alt="Complaint"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Resolution Form (if resolving) */}
                {selectedComplaint.action === 'resolve' && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Resolution Note *</p>
                    <textarea
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Describe how the issue was resolved..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-primary-500 outline-none transition"
                    />
                  </div>
                )}

                {/* Existing Resolution */}
                {selectedComplaint.resolution && !selectedComplaint.action && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Resolution</p>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-green-800 dark:text-green-300">{selectedComplaint.resolution}</p>
                      {selectedComplaint.resolutionDate && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Resolved on {new Date(selectedComplaint.resolutionDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => { setSelectedComplaint(null); setResolutionText(""); }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                
                {selectedComplaint.action === 'resolve' && (
                  <button
                    onClick={() => updateStatus(selectedComplaint._id, 'resolved', resolutionText)}
                    disabled={!resolutionText.trim() || updating === selectedComplaint._id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {updating === selectedComplaint._id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiCheckCircle className="w-4 h-4" />
                    )}
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageComplaints;
