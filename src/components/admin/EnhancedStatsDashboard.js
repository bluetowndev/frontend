import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.REACT_APP_API_URL || "";

const EnhancedStatsDashboard = ({ filters }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, [filters]);

  const fetchDashboardStats = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.state && filters.state !== 'all') params.append('state', filters.state);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`${apiUrl}/api/attendance/admin-dashboard-stats?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      } else {
        toast.error(data.error || "Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { overview, stateWiseStats, topPerformers, dailyTrends, recentActivity } = stats;

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={overview.totalUsers}
          icon="👥"
          color="blue"
          subtitle="Registered users"
        />
        <MetricCard
          title="Active Users"
          value={overview.activeUsers}
          icon="✅"
          color="green"
          subtitle={`${((overview.activeUsers / overview.totalUsers) * 100).toFixed(1)}% active`}
        />
        <MetricCard
          title="Total Attendance"
          value={overview.totalAttendanceEntries}
          icon="📊"
          color="purple"
          subtitle="Entries recorded"
        />
        <MetricCard
          title="Total Distance"
          value={`${overview.totalDistanceCovered} km`}
          icon="🚗"
          color="orange"
          subtitle={`Avg: ${overview.avgDistancePerUser} km/user`}
        />
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Check-Ins"
          value={overview.checkIns}
          icon="🟢"
          color="green"
          small
        />
        <MetricCard
          title="Check-Outs"
          value={overview.checkOuts}
          icon="🔴"
          color="red"
          small
        />
        <MetricCard
          title="Site Visits"
          value={overview.siteVisits}
          icon="🏗️"
          color="blue"
          small
        />
      </div>

      {/* State-wise Statistics and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State-wise Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📍</span> State-wise Performance
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(stateWiseStats)
              .sort(([, a], [, b]) => b.attendanceCount - a.attendanceCount)
              .map(([state, data]) => (
                <div key={state} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{state}</span>
                    <span className="text-sm text-gray-600">
                      {data.activeUsers}/{data.totalUsers} users
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(data.activeUsers / data.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{data.attendanceCount} entries</span>
                    <span>{((data.activeUsers / data.totalUsers) * 100).toFixed(1)}% active</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏆</span> Top Performers
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {topPerformers.map((performer, index) => (
              <div key={performer.userId} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{performer.fullName}</p>
                    <p className="text-sm text-gray-600">{performer.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{performer.attendanceCount}</p>
                    <p className="text-xs text-gray-600">{performer.siteVisits} visits</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📈</span> Daily Trends
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Users</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Ins</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Outs</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site Visits</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyTrends.slice(-7).map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{day.activeUsers}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-medium">{day.checkIns}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-medium">{day.checkOuts}</td>
                  <td className="px-4 py-3 text-sm text-blue-600 font-medium">{day.siteVisits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚡</span> Recent Activity
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user?.fullName || 'Unknown User'}
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-600">{activity.purpose}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.locationName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">
                  {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color, subtitle, small }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`${small ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStatsDashboard;

