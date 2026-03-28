'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    pendingReviews: 0,
    pendingClientSubmissions: 0,
    pendingProjects: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    checkAuthAndFetchAnalytics();
  }, []);

  const checkAuthAndFetchAnalytics = async () => {
    try {
      let token = localStorage.getItem('adminToken');
      if (!token) {
        const match = document.cookie.match(/(?:^|; )authToken=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }
      if (!token) {
        router.push('/auth/admin/login');
        return;
      }

      const response = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.info('Analytics fetch', response.status, response.statusText);

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/auth/admin/login');
        return;
      }

      if (!response.ok) {
        let message = `Failed to fetch analytics: status ${response.status}`;
        try {
          const errData = await response.json();
          console.error('Analytics endpoint error:', errData);
          if (errData?.error) message = errData.error;
        } catch (e) {
          const fallbackText = await response.text();
          if (fallbackText) message = `${message} ${fallbackText}`;
        }
        throw new Error(message);
      }

      const data = await response.json();
      setStats({
        totalVisits: data.data?.totalVisits || 0,
        uniqueVisitors: data.data?.uniqueVisitors || 0,
        pendingReviews: data.data?.pendingReviews || 0,
        pendingClientSubmissions: data.data?.pendingClientSubmissions || 0,
        pendingProjects: data.data?.pendingProjects || 0,
        totalRevenue: data.data?.totalRevenue || 0,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-full p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome back! Here's your business overview.</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Visits', value: stats.totalVisits.toLocaleString() },
                { label: 'Unique Visitors', value: stats.uniqueVisitors.toLocaleString() },
                { label: 'Pending Submissions', value: stats.pendingClientSubmissions, color: 'text-yellow-400' },
                { label: 'Pending Projects', value: stats.pendingProjects, color: 'text-blue-400' },
                { label: 'Total Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, color: 'text-primary' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-card rounded-lg border border-border"
                >
                  <p className="text-muted-foreground text-xs mb-2">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Manage Projects', description: 'Create and edit your portfolio projects', href: '/admin/projects' },
                { title: 'Review Submissions', description: 'Approve or reject client testimonials', href: '/admin/reviews' },
                { title: 'View Payments', description: 'Track all transactions and revenue', href: '/admin/payments' },
                { title: 'Manage Images', description: 'Upload and organize project images', href: '/admin/images' },
                { title: 'Client Inquiries', description: 'Respond to project inquiries', href: '/admin/clients' },
                { title: 'Analytics', description: 'View website traffic and metrics', href: '/admin/analytics' },
              ].map((action, i) => (
                <motion.a
                  key={i}
                  href={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="p-6 bg-card border border-border rounded-lg hover:border-primary transition cursor-pointer"
                >
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </motion.a>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
}
