'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Download, Eye } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

interface Payment {
  _id: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  packageType: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  transactionRef: string;
  paystackReference?: string;
  createdAt: string;
}

export default function AdminPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('success');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkAuthAndFetchPayments();
  }, []);

  const checkAuthAndFetchPayments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/admin/login');
        return;
      }

      const response = await fetch('/api/payments?status=all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/auth/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch payments');

      const data = await response.json();
      setPayments(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching payments';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'success') return p.status === 'success';
    if (filter === 'pending') return p.status === 'pending';
    if (filter === 'failed') return p.status === 'failed';
    return true;
  });

  const stats = {
    total: payments.length,
    successful: payments.filter(p => p.status === 'success').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalRevenue: payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Client Name', 'Email', 'Service', 'Package', 'Amount', 'Status', 'Reference'];
    const rows = filteredPayments.map(p => [
      new Date(p.createdAt).toLocaleDateString(),
      p.clientName,
      p.clientEmail,
      p.serviceType,
      p.packageType,
      `${p.currency}${p.amount.toLocaleString()}`,
      p.status.toUpperCase(),
      p.transactionRef,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-full min-h-screen bg-background p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Payment Transactions</h1>
              <p className="text-muted-foreground mt-2">Track all payment history and revenue</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-700 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total Transactions', value: stats.total },
              { label: 'Successful', value: stats.successful, color: 'text-green-400' },
              { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
              { label: 'Failed', value: stats.failed, color: 'text-red-400' },
              { label: 'Total Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, color: 'text-primary' },
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-card border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['success', 'pending', 'failed', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:border-primary'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 bg-card border border-border rounded-lg text-center text-muted-foreground">
            No payments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold">Date</th>
                  <th className="text-left p-4 text-sm font-semibold">Client</th>
                  <th className="text-left p-4 text-sm font-semibold">Service</th>
                  <th className="text-left p-4 text-sm font-semibold">Amount</th>
                  <th className="text-left p-4 text-sm font-semibold">Status</th>
                  <th className="text-left p-4 text-sm font-semibold">Reference</th>
                  <th className="text-left p-4 text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-card/50 transition"
                  >
                    <td className="p-4 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-sm">
                      <div>
                        <p className="font-medium">{payment.clientName}</p>
                        <p className="text-xs text-muted-foreground">{payment.clientEmail}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <p>{payment.serviceType}</p>
                      <p className="text-xs text-muted-foreground">{payment.packageType}</p>
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {payment.currency}
                      {payment.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        payment.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : payment.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-mono text-xs">{payment.transactionRef.slice(0, 8)}...</td>
                    <td className="p-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetails(true);
                        }}
                        className="flex items-center gap-1 text-primary hover:text-orange-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowDetails(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-4">Payment Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Client Name</p>
                  <p className="font-medium">{selectedPayment.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{selectedPayment.clientEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service Type</p>
                  <p className="font-medium">{selectedPayment.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Package</p>
                  <p className="font-medium">{selectedPayment.packageType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-medium text-lg text-primary">
                    {selectedPayment.currency}
                    {selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`font-medium ${
                    selectedPayment.status === 'success'
                      ? 'text-green-400'
                      : selectedPayment.status === 'pending'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}>
                    {selectedPayment.status.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transaction Reference</p>
                  <p className="font-mono text-sm">{selectedPayment.transactionRef}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-700 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
