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
  pageViews: { page: string; views: number }[];
  deviceTypes: { device: string; count: number }[];
  dailyVisits: { date: string; visits: number }[];
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
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

      const data = await response.json();
      setAnalytics(data.data);
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Website Analytics</h1>
        <p className="text-muted-foreground mb-8">Track visitor behavior and engagement metrics</p>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Visits', value: analytics.totalVisits.toLocaleString() },
                { label: 'Unique Visitors', value: analytics.uniqueVisitors.toLocaleString() },
                { label: 'Conversion Rate', value: `${(analytics.conversionRate * 100).toFixed(2)}%`, color: 'text-primary' },
                { label: 'Avg Session Duration', value: `${Math.floor(analytics.avgSessionDuration)}s` },
                { label: 'Bounce Rate', value: `${(analytics.bounceRate * 100).toFixed(2)}%` },
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-card border border-border rounded-lg"
                >
                  <p className="text-muted-foreground text-sm mb-2">{metric.label}</p>
                  <p className={`text-3xl font-bold ${metric.color || ''}`}>{metric.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Visits Chart */}
              {analytics.dailyVisits && analytics.dailyVisits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 bg-card border border-border rounded-lg"
                >
                  <h3 className="text-lg font-semibold mb-4">Daily Visits</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyVisits}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis dataKey="date" stroke="#666666" />
                      <YAxis stroke="#666666" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#181818', border: '1px solid #2A2A2A' }}
                        labelStyle={{ color: '#FFFFFF' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="visits"
                        stroke="#FF6B00"
                        strokeWidth={2}
                        dot={{ fill: '#FF6B00' }}
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
                      <Bar dataKey="count" fill="#FF6B00" />
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
                className="p-6 bg-card border border-border rounded-lg"
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
          </>
        ) : (
          <div className="p-8 bg-card border border-border rounded-lg text-center text-muted-foreground">
            No analytics data available
          </div>
        )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
