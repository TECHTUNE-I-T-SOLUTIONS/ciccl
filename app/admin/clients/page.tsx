'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, MessageCircle, Eye, MoreVertical } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

interface Inquiry {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  budget: number;
  description: string;
  status: 'new' | 'contacted' | 'converted';
  createdAt: string;
}

export default function AdminClients() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'converted'>('new');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchInquiries();
  }, []);

  const checkAuthAndFetchInquiries = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/admin/login');
        return;
      }

      const response = await fetch('/api/inquiries?status=all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/auth/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch client inquiries');

      const data = await response.json();
      setInquiries(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching inquiries';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (inquiryId: string, newStatus: 'contacted' | 'converted') => {
    setActionLoading(inquiryId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedInquiry = await response.json();
      setInquiries(
        inquiries.map(i => (i._id === inquiryId ? updatedInquiry.data : i))
      );
      if (selectedInquiry?._id === inquiryId) {
        setSelectedInquiry(updatedInquiry.data);
      }
      toast.success('Status updated successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error updating status';
      toast.error(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleContactViaWhatsApp = (inquiry: Inquiry) => {
    const message = encodeURIComponent(
      `Hi ${inquiry.fullName}, thank you for your inquiry about ${inquiry.serviceType}. We would like to discuss your project requirements. Please let us know your availability for a call.`
    );
    window.open(`https://wa.me/${inquiry.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    handleUpdateStatus(inquiry._id, 'contacted');
  };

  const filteredInquiries = inquiries.filter(i => {
    if (filter === 'new') return i.status === 'new';
    if (filter === 'contacted') return i.status === 'contacted';
    if (filter === 'converted') return i.status === 'converted';
    return true;
  });

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    converted: inquiries.filter(i => i.status === 'converted').length,
    totalBudget: inquiries.reduce((sum, i) => sum + (i.budget || 0), 0),
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-full min-h-screen bg-background p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Client Inquiries</h1>
          <p className="text-muted-foreground mt-2">Manage project inquiries and track client conversions</p>
          
          {stats.new > 0 && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary rounded-lg">
              <p className="text-sm text-primary font-medium">
                You have <span className="font-bold">{stats.new}</span> new inquiry/inquiries waiting for response
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          {[
            { label: 'Total Inquiries', value: stats.total },
            { label: 'New', value: stats.new, color: 'text-orange-400' },
            { label: 'Contacted', value: stats.contacted, color: 'text-blue-400' },
            { label: 'Converted', value: stats.converted, color: 'text-green-400' },
            { label: 'Potential Revenue', value: `₦${(stats.totalBudget / 1000000).toFixed(1)}M`, color: 'text-primary' },
          ].map((stat, i) => (
            <div key={i} className="p-3 md:p-4 bg-card border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-lg md:text-2xl font-bold ${stat.color || ''}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['new', 'contacted', 'converted', 'all'].map(f => (
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
        ) : filteredInquiries.length === 0 ? (
          <div className="p-8 bg-card border border-border rounded-lg text-center text-muted-foreground">
            No inquiries found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry, index) => (
              <motion.div
                key={inquiry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 md:p-6 bg-card border border-border rounded-lg hover:border-primary transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{inquiry.fullName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        inquiry.status === 'new'
                          ? 'bg-orange-500/20 text-orange-400'
                          : inquiry.status === 'contacted'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {inquiry.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{inquiry.email}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                      <span>Service: {inquiry.serviceType}</span>
                      <span>Budget: ₦{inquiry.budget.toLocaleString()}</span>
                      <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{inquiry.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setShowDetails(true);
                      }}
                      className="p-2 hover:bg-primary/10 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleContactViaWhatsApp(inquiry)}
                      disabled={actionLoading === inquiry._id}
                      className="p-2 hover:bg-green-500/10 rounded-lg transition disabled:opacity-50"
                      title="Contact via WhatsApp"
                    >
                      {actionLoading === inquiry._id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-green-400" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedInquiry && (
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
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-4">Inquiry Details</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{selectedInquiry.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-sm">{selectedInquiry.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{selectedInquiry.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Service Type</p>
                  <p className="font-medium">{selectedInquiry.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Budget</p>
                  <p className="font-medium text-lg text-primary">₦{selectedInquiry.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedInquiry.description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className={`font-medium ${
                    selectedInquiry.status === 'new'
                      ? 'text-orange-400'
                      : selectedInquiry.status === 'contacted'
                      ? 'text-blue-400'
                      : 'text-green-400'
                  }`}>
                    {selectedInquiry.status.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Received</p>
                  <p className="text-sm">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedInquiry.status === 'new' && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedInquiry._id, 'contacted');
                        setShowDetails(false);
                      }}
                      disabled={actionLoading === selectedInquiry._id}
                      className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50"
                    >
                      Mark Contacted
                    </button>
                    <button
                      onClick={() => handleContactViaWhatsApp(selectedInquiry)}
                      className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </>
                )}
                {selectedInquiry.status === 'contacted' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedInquiry._id, 'converted');
                      setShowDetails(false);
                    }}
                    disabled={actionLoading === selectedInquiry._id}
                    className="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
                  >
                    Mark as Converted
                  </button>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
