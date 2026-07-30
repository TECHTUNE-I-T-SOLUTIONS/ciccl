'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';

export default function ContactContent() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'cost-estimation',
    budgetRange: 'under-5m',
    message: '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      const data = await response.json();
      toast.success('Inquiry submitted! Redirecting to WhatsApp...');
      
      // Redirect to WhatsApp
      setTimeout(() => {
        window.open(data.whatsappUrl, '_blank');
      }, 1000);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectType: 'cost-estimation',
        budgetRange: 'under-5m',
        message: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-background">
      <Navbar />
      <div className="w-full max-w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg">
              Have a project in mind? Let's discuss how I can help with your surveying needs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition"
                  placeholder="+234 ..."
                />
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Project Type</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition"
                >
                  <option value="cost-estimation">Cost Estimation</option>
                  <option value="budget-planning">Budget Planning</option>
                  <option value="contract-admin">Contract Administration</option>
                  <option value="risk-management">Risk Management</option>
                  <option value="value-engineering">Value Engineering</option>
                  <option value="project-control">Project Control</option>
                </select>
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Budget Range</label>
              <select
                name="budgetRange"
                value={formData.budgetRange}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition"
              >
                <option value="under-5m">Under 5 Million</option>
                <option value="5m-50m">5M - 50M</option>
                <option value="50m-500m">50M - 500M</option>
                <option value="500m-1b">500M - 1B</option>
                <option value="above-1b">Above 1 Billion</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                minLength={20}
                rows={6}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition resize-none"
                placeholder="Tell me about your project..."
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-background rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send via WhatsApp'}
            </motion.button>
          </form>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-xl font-semibold mb-6">Other Ways to Reach Me</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Email</p>
                <a href="mailto:akanjialex@gmail.com" className="text-primary hover:underline">
                  akanjialex@gmail.com
                </a>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Phone</p>
                <a href="tel:+2347034356398" className="text-primary hover:underline">
                  +234 703 435 6398
                </a>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Location</p>
                <p className="text-foreground">Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
      <MobileNav />
    </main>
  );
}
