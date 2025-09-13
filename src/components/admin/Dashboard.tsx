import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { getReports } from '../../lib/storage';
import { mockAnalytics } from '../../lib/mockData';
import {
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import type { Analytics, Report } from '../../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = () => {
      const reports: Report[] = getReports() || [];

      if (reports.length > 0) {
        const totalReports = reports.length;
        const resolvedReports = reports.filter(r => r.status === 'resolved').length;

        const reportsByCategory = reports.reduce((acc, report) => {
          acc[report.category as keyof typeof acc] = (acc[report.category as keyof typeof acc] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const reportsByStatus = reports.reduce((acc, report) => {
          acc[report.status as keyof typeof acc] = (acc[report.status as keyof typeof acc] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const reportsByPriority = reports.reduce((acc, report) => {
          acc[report.priority as keyof typeof acc] = (acc[report.priority as keyof typeof acc] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setAnalytics({
          totalReports,
          resolvedReports,
          averageResponseTime: 2.3,
          reportsByCategory: reportsByCategory as any,
          reportsByStatus: reportsByStatus as any,
          reportsByPriority: reportsByPriority as any,
        });
      } else {
        setAnalytics(mockAnalytics);
      }

      setLoading(false);
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse h-24"></Card>
        ))}
      </div>
    );
  }

  const resolutionRate =
    analytics.totalReports > 0
      ? ((analytics.resolvedReports / analytics.totalReports) * 100).toFixed(1)
      : '0';
  const activeIssues = analytics.totalReports - analytics.resolvedReports;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F87171', '#A78BFA'];

  const transformToChartData = (data: Record<string, number>) =>
    Object.entries(data).map(([name, value]) => ({ name, value }));

  const categoryData = transformToChartData(analytics.reportsByCategory);
  const statusData = transformToChartData(analytics.reportsByStatus);
  const priorityData = transformToChartData(analytics.reportsByPriority);

  // Trend sample data
  const trendData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    submitted: Math.floor(Math.random() * 5),
    resolved: Math.floor(Math.random() * 5),
    in_progress: Math.floor(Math.random() * 5)
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Reports', value: analytics.totalReports, icon: <BarChart3 className="w-8 h-8 text-blue-600" /> },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: <CheckCircle className="w-8 h-8 text-green-600" /> },
          { label: 'Avg Response Time', value: `${analytics.averageResponseTime}d`, icon: <Clock className="w-8 h-8 text-purple-600" /> },
          { label: 'Active Issues', value: activeIssues, icon: <Users className="w-8 h-8 text-orange-600" /> },
        ].map((item, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
              {item.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Reports Trend */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600"/> Reports Trend (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="submitted" stroke="#6366F1" strokeWidth={3} />
            <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} />
            <Line type="monotone" dataKey="in_progress" stroke="#F59E0B" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Category & Priority Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#3B82F6"
                label
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Status Distribution Area Chart */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={statusData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
