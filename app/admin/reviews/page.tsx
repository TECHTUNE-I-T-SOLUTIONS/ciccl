'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Check, X, Trash2, Star } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

interface Review {
  _id: string;
  clientName: string;
  email: string;
  projectReference: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminReviews() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchReviews();
  }, []);

  const checkAuthAndFetchReviews = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/admin/login');
        return;
      }

      const response = await fetch('/api/reviews?status=all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/auth/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching reviews';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject') => {
    setActionLoading(reviewId);
    try {
      const token = localStorage.getItem('adminToken');
      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} review`);

      const updatedReview = await response.json();
      setReviews(
        reviews.map(r => (r._id === reviewId ? updatedReview.data : r))
      );
      toast.success(`Review ${action}ed successfully`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Error ${action}ing review`;
      toast.error(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    setActionLoading(reviewId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete review');

      setReviews(reviews.filter(r => r._id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error deleting review';
      toast.error(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'approved') return r.status === 'approved';
    if (filter === 'rejected') return r.status === 'rejected';
    return true;
  });

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="w-full max-w-full min-h-screen bg-background p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Manage Reviews</h1>
          <p className="text-muted-foreground mt-2">Approve or reject client testimonials and reviews</p>
          {pendingCount > 0 && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary rounded-lg">
              <p className="text-sm text-primary font-medium">
                You have <span className="font-bold">{pendingCount}</span> pending review{pendingCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
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
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 bg-card border border-border rounded-lg text-center text-muted-foreground">
            No reviews found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 md:p-6 bg-card border border-border rounded-lg"
              >
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{review.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{review.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">Project: {review.projectReference}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-foreground">{review.comment}</p>

                  {/* Status and Date */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded ${
                      review.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : review.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>

                  {/* Actions */}
                  {review.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleReviewAction(review._id, 'approve')}
                        disabled={actionLoading === review._id}
                        className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading === review._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewAction(review._id, 'reject')}
                        disabled={actionLoading === review._id}
                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading === review._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Reject
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={actionLoading === review._id}
                        className="px-4 py-2 hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
