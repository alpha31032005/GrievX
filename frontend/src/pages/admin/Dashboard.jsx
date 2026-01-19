import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiClipboard,
  FiUsers,
  FiX,
  FiServer,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const { user, department } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rate: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    // Fetch overview stats
    api.get('/analytics/overview')
      .then((res) => setStats({
        total: res.data.total || 0,
        pending: res.data.pending || 0,
        resolved: res.data.resolved || 0,
        rate: res.data.resolutionRate || 0,
      }))
      .catch(() => setStats({ total: 0, pending: 0, resolved: 0, rate: 0 }))
      .finally(() => setLoading(false));

    // Fetch recent activity
    api.get('/analytics/activity?limit=5')
      .then((res) => setRecentActivity(res.data.data || []))
      .catch(() => setRecentActivity([]))
      .finally(() => setActivityLoading(false));
  }, []);

  const fetchSystemStats = async () => {
    try {
      const res = await api.get('/analytics/system');
      setSystemStats(res.data);
      setShowSystemModal(true);
    } catch (err) {
      setSystemStats({ error: 'Failed to fetch system stats' });
      setShowSystemModal(true);
    }
  };

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-12 animate-fadeInUp">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard ⚙️
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {department ? `Department: ${department.replace('_', ' ')}` : 'All Departments'} • Monitor civic activities
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
            <FiClipboard className="text-blue-600 dark:text-blue-400 w-10 h-10 mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.total}</h3>
            <p className="text-gray-500 dark:text-gray-400">Total Complaints</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
            <FiAlertTriangle className="text-yellow-500 w-10 h-10 mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.pending}</h3>
            <p className="text-gray-500 dark:text-gray-400">Pending Review</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
            <FiCheckCircle className="text-green-500 w-10 h-10 mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.resolved}</h3>
            <p className="text-gray-500 dark:text-gray-400">Resolved Issues</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
            <FiUsers className="text-purple-500 w-10 h-10 mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : `${stats.rate}%`}</h3>
            <p className="text-gray-500 dark:text-gray-400">Resolution Rate</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <Link
              to="/admin/manage"
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition">
                  <FiClipboard />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Manage Complaints
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Review, update, and resolve pending issues.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/analytics"
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-600 w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition">
                  <FiBarChart2 />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Analytics Overview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Insightful data trends and visualizations.
                  </p>
                </div>
              </div>
            </Link>

            <div
              onClick={fetchSystemStats}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-600 w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition">
                  <FiActivity />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    System Activity
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Monitor system load and health status.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Recent System Log */}
        <div className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity Log
          </h2>

          <div className="space-y-4">
            {activityLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-center">
                <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{activity.icon}</span>
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.department?.replace('_', ' ')} • by {activity.userName}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap ml-4">
                    {activity.timeAgo}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* System Activity Modal */}
      {showSystemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiServer className="text-blue-600" />
                System Activity
              </h2>
              <button
                onClick={() => setShowSystemModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {systemStats?.error ? (
                <p className="text-red-500">{systemStats.error}</p>
              ) : systemStats ? (
                <>
                  {/* System Health */}
                  <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">System Operational</p>
                      <p className="text-sm text-green-600 dark:text-green-500">Uptime: {systemStats.uptime}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
                      <FiClock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.todayComplaints}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Today's Complaints</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
                      <FiCheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.todayResolved}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Today Resolved</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
                      <FiTrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.weekComplaints}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
                      <FiCheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.weekResolved}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Week Resolved</p>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Total Complaints</span>
                      <span className="font-bold text-gray-900 dark:text-white">{systemStats.totalComplaints}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-700 dark:text-gray-300">Total Resolved</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{systemStats.totalResolved}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-700 dark:text-gray-300">Resolution Rate</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {systemStats.totalComplaints > 0 
                          ? ((systemStats.totalResolved / systemStats.totalComplaints) * 100).toFixed(1) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
