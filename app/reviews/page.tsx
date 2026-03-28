'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';

interface Review {
  _id: string;
  clientName: string;
  projectReference: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    projectReference: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      setReviews(data.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      toast.success('Review submitted! Awaiting approval.');
      setFormData({ clientName: '', email: '', projectReference: '', rating: 5, comment: '' });
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full bg-background">
      <Navbar />
      <div className="w-full max-w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold mb-4">Client Reviews</h1>
          <p className="text-muted-foreground text-lg mb-12">Feedback from satisfied clients</p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-card rounded-lg border border-border animate-pulse" />
            ))
          ) : reviews.length > 0 ? (
            reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} size={18} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-3">{review.comment}</p>
                <div className="text-sm">
                  <p className="font-medium">{review.clientName}</p>
                  <p className="text-muted-foreground">{review.projectReference}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-muted-foreground col-span-2">No reviews yet</p>
          )}
        </div>

        {/* Submit Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto bg-card rounded-lg border border-border p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Share Your Experience</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="clientName"
                placeholder="Your name"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition"
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition"
              />
            </div>

            <input
              type="text"
              name="projectReference"
              placeholder="Project name/reference"
              value={formData.projectReference}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition"
            />

            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg"
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Good</option>
                <option value="2">2 Stars - Fair</option>
                <option value="1">1 Star - Poor</option>
              </select>
            </div>

            <textarea
              name="comment"
              placeholder="Your review..."
              value={formData.comment}
              onChange={handleChange}
              required
              minLength={10}
              rows={4}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg resize-none"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-primary text-background rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </motion.button>
          </form>
        </motion.div>
      </div>
      <Footer />
      <MobileNav />
    </main>
  );
}
