'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const SERVICE_TYPES = [
  'Cost Planning',
  'Budget Management',
  'Contract Administration',
  'Project Controls',
  'Quantity Surveying',
  'Construction Cost Analysis',
];

export default function SubmitProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    serviceType: '',
    description: '',
    budget: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('clientToken');
    if (!token) {
      router.push('/auth/client/login');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('clientToken');
      if (!token) {
        router.push('/auth/client/login');
        return;
      }

      const response = await fetch('/api/clients/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectName: formData.projectName,
          serviceType: formData.serviceType,
          description: formData.description,
          budget: parseFloat(formData.budget),
          status: 'submitted',
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('clientToken');
        router.push('/auth/client/login');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit project');
      }

      toast.success('Project submitted successfully! We will review and get back to you soon.');
      router.push('/client/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error submitting project';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full min-h-screen bg-background p-4 md:p-8 flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Submit New Project</h1>
          <p className="text-muted-foreground mt-2">Tell us about your project requirements and budget</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Project Name *</label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g., Commercial Building Construction"
              required
              className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Service Type *</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition"
            >
              <option value="">Select a service</option>
              {SERVICE_TYPES.map(service => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Project Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project in detail, including scope, objectives, and any specific requirements..."
              required
              rows={5}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum 20 characters</p>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium mb-2">Estimated Budget (₦) *</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g., 5000000"
              required
              min="0"
              step="100000"
              className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition"
            />
            <p className="text-xs text-muted-foreground mt-1">This helps us provide accurate quotes</p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-primary/10 border border-primary rounded-lg">
            <p className="text-sm text-primary">
              <span className="font-semibold">Next Steps:</span> After submission, our team will review your project details and contact you within 24-48 hours with a comprehensive quote and timeline.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Project'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
