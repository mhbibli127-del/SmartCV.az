"use client";
import React, { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye, Download, Activity, Calendar, Filter } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/ui/states";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics?date=${dateRange}`);
      if (!response.ok) {
        throw new Error(`Analytics request failed (${response.status})`);
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Could not load analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Mock data for charts (in production, this would come from the database)
  const viewsData = [
    { name: 'Mon', views: 400, downloads: 240 },
    { name: 'Tue', views: 300, downloads: 139 },
    { name: 'Wed', views: 200, downloads: 980 },
    { name: 'Thu', views: 278, downloads: 390 },
    { name: 'Fri', views: 189, downloads: 480 },
    { name: 'Sat', views: 239, downloads: 380 },
    { name: 'Sun', views: 349, downloads: 430 }
  ];

  const categoryData = [
    { name: 'Professional', value: 400 },
    { name: 'Creative', value: 300 },
    { name: 'Tech', value: 300 },
    { name: 'Academic', value: 200 },
    { name: 'Healthcare', value: 150 }
  ];

  const topTemplates = [
    { name: 'Modern Professional', views: 1250, downloads: 340 },
    { name: 'Software Engineer', views: 1890, downloads: 534 },
    { name: 'Startup Founder', views: 1678, downloads: 489 },
    { name: 'Data Scientist', views: 1456, downloads: 423 },
    { name: 'Creative Designer', views: 1680, downloads: 512 }
  ];

  if (loading) {
    return <LoadingState label="Loading analytics…" className="h-96" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load analytics"
        description={error}
        onRetry={fetchAnalytics}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-gray-900 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-300 text-lg">Real-time insights into user behavior and template performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white font-medium"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Eye size={24} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics?.totalViews || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Views</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
              <Download size={24} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +8.3%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics?.totalDownloads || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Downloads</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +15.2%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics?.totalUsers || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Active Users</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center">
              <Activity size={24} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +5.7%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics?.conversionRate || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">Conversion Rate</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views vs Downloads Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Views vs Downloads</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#0088FE" name="Views" />
              <Bar dataKey="downloads" fill="#00C49F" name="Downloads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Templates */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Templates</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Template</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Views</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Downloads</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Conversion</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topTemplates.map((template, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{template.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{template.views.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600">{template.downloads.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 font-medium">
                      {((template.downloads / template.views) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <TrendingUp size={16} className="text-green-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Real-time Activity</h3>
        <div className="space-y-4">
          {[
            { user: 'user@example.com', action: 'viewed', template: 'Modern Professional', time: '2 min ago' },
            { user: 'john@test.com', action: 'downloaded', template: 'Software Engineer', time: '5 min ago' },
            { user: 'sarah@demo.com', action: 'selected', template: 'Creative Designer', time: '8 min ago' },
            { user: 'mike@corp.com', action: 'viewed', template: 'Data Scientist', time: '12 min ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {activity.user[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-500">
                    {activity.action} <span className="font-medium">{activity.template}</span>
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
