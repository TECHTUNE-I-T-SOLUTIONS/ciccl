'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  pendingReviews: number;
  pendingClientSubmissions: number;
  pendingProjects: number;
  totalRevenue: number;
  deviceTypes: { device: string; count: number }[];
  pageViews: { page: string; views: number }[];
  monthlyData: { date: string; visits: number; revenue: number }[];
}

export default function AdminAnalytics() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchAnalytics();
  }, []);

  const checkAuthAndFetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/admin/login');
        return;
      }

      const response = await fetch('/api/analytics?period=30days', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/auth/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const result = await response.json();
      setAnalytics(result.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching analytics';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-full min-h-screen bg-background p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground mb-8">Website traffic, revenue, and client engagement summary</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { label: 'Total Visits (30d)', value: analytics.totalVisits.toLocaleString() },
                { label: 'Unique Visitors', value: analytics.uniqueVisitors.toLocaleString() },
                { label: 'Revenue (30d)', value: `₦${analytics.totalRevenue.toLocaleString()}`, color: 'text-green-400' },
                { label: 'Pending Reviews', value: analytics.pendingReviews.toLocaleString(), color: 'text-orange-400' },
                { label: 'Client Inquiries', value: analytics.pendingClientSubmissions.toLocaleString(), color: 'text-blue-400' },
                { label: 'Unpublished Projects', value: analytics.pendingProjects.toLocaleString(), color: 'text-yellow-400' },
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-card border border-border rounded-lg"
                >
                  <p className="text-muted-foreground text-xs mb-1">{metric.label}</p>
                  <p className={`text-xl md:text-2xl font-bold ${metric.color || ''}`}>{metric.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Visits & Revenue Chart */}
              {analytics.monthlyData && analytics.monthlyData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 bg-card border border-border rounded-lg"
                >
                  <h3 className="text-lg font-semibold mb-4">Daily Visits & Revenue</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis dataKey="date" stroke="#666666" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" stroke="#FF6B00" />
                      <YAxis yAxisId="right" orientation="right" stroke="#4ADE80" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#181818', border: '1px solid #2A2A2A' }}
                        labelStyle={{ color: '#FFFFFF' }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="visits"
                        stroke="#FF6B00"
                        strokeWidth={2}
                        name="Visits"
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4ADE80"
                        strokeWidth={2}
                        name="Revenue (₦)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Device Types Chart */}
              {analytics.deviceTypes && analytics.deviceTypes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 bg-card border border-border rounded-lg"
                >
                  <h3 className="text-lg font-semibold mb-4">Devices</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.deviceTypes}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis dataKey="device" stroke="#666666" />
                      <YAxis stroke="#666666" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#181818', border: '1px solid #2A2A2A' }}
                        labelStyle={{ color: '#FFFFFF' }}
                      />
                      <Bar dataKey="count" fill="#FF6B00" name="Visits" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>

            {/* Page Views */}
            {analytics.pageViews && analytics.pageViews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-card border border-border rounded-lg mb-8"
              >
                <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
                <div className="space-y-3">
                  {analytics.pageViews.map((page, i) => (
                    <div key={i} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                      <span className="text-sm font-medium">{page.page}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(page.views / Math.max(...analytics.pageViews.map(p => p.views))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{page.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Payments Summary */}
            {analytics.totalRevenue > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-card border border-border rounded-lg"
              >
                <h3 className="text-lg font-semibold mb-4">Payment Summary (Last 30 Days)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">₦{analytics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Pending Reviews</p>
                    <p className="text-2xl font-bold text-orange-400">{analytics.pendingReviews}</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Client Inquiries</p>
                    <p className="text-2xl font-bold text-blue-400">{analytics.pendingClientSubmissions}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="p-8 bg-card border border-border rounded-lg text-center text-muted-foreground">
            No analytics data available yet. Start visiting pages to generate data.
          </div>
        )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}