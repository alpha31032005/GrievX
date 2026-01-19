import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPlusCircle,
  FiList,
  FiClock,
  FiUser,
  FiAlertTriangle,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const CitizenDashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    // Fetch user's own recent activity
    api.get('/analytics/my-activity?limit=5')
      .then((res) => setRecentActivity(res.data.data || []))
      .catch(() => setRecentActivity([]))
      .finally(() => setActivityLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="px-4 py-10">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400 opacity-20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-accent-info opacity-20 blur-3xl rounded-full"></div>
        </div>

        {/* Main Container */}
        <div className="relative z-10 max-w-6xl mx-auto space-y-10 animate-fadeInUp">

          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">
              Welcome, {user?.name || 'Citizen'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your civic reports and track their progress.
            </p>
          </div>

          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl flex items-center gap-6 hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.name ? user.name[0].toUpperCase() : <FiUser />}
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name || user?.email || 'Citizen User'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You are helping build a smarter community 💙
              </p>
            </div>
          </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* New Complaint */}
          <Link
            to="/citizen/complaint"
            className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary-600 w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                <FiPlusCircle />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  File New Complaint
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Report an issue instantly.
                </p>
              </div>
            </div>
          </Link>

          {/* My Complaints */}
          <Link
            to="/citizen/my-complaints"
            className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="bg-accent-success w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                <FiList />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  My Complaints
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  View all your submitted reports.
                </p>
              </div>
            </div>
          </Link>

          {/* Track Complaint Status */}
          <Link
            to="/citizen/track-status"
            className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="bg-accent-warning w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                <FiClock />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Track Status
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Monitor your complaint resolution.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-accent-warning" /> Recent Activity
          </h2>

          <div className="space-y-4">
            {activityLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
                <p className="text-gray-600 dark:text-gray-400">No complaints yet. File your first complaint to get started!</p>
                <Link to="/citizen/complaint" className="inline-block mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                  File Complaint
                </Link>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{activity.icon}</span>
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Category: {activity.category?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                    {activity.timeAgo}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
