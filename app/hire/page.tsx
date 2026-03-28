'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';

export default function HirePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'payment'>('select');
  const [formData, setFormData] = useState({
    serviceType: 'cost-estimation',
    packageType: 'standard',
    projectName: '',
    projectDescription: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    paymentMethod: 'paystack',
  });

  const services = [
    {
      id: 'cost-estimation',
      title: 'Cost Estimation',
      description: 'Accurate project cost estimation',
    },
    {
      id: 'budget-planning',
      title: 'Budget Planning',
      description: 'Comprehensive budget management',
    },
    {
      id: 'contract-admin',
      title: 'Contract Administration',
      description: 'Professional contract management',
    },
  ];

  const packages = [
    { id: 'basic', name: 'Basic', price: 50000 },
    { id: 'standard', name: 'Standard', price: 100000 },
    { id: 'premium', name: 'Premium', price: 250000 },
  ];

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedPackage = packages.find(p => p.id === formData.packageType);
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: selectedPackage?.price,
        }),
      });

      if (!response.ok) throw new Error('Failed to initiate payment');

      const data = await response.json();
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.success('Payment initiated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-background">
      <Navbar />
      <div className="w-full max-w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold mb-4 text-center">Hire My Services</h1>
          <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto">
            Select a service and let's get started on your project.
          </p>
        </motion.div>

        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mt-12"
          >
            <h2 className="text-2xl font-bold mb-8">Select a Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {services.map((service) => (
                <motion.button
                  key={service.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, serviceType: service.id }));
                    setStep('details');
                  }}
                  className="p-6 rounded-lg border-2 border-border hover:border-primary transition text-left"
                >
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </motion.button>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-8">Select a Package</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <motion.button
                  key={pkg.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, packageType: pkg.id }));
                    setStep('details');
                  }}
                  className="p-6 rounded-lg bg-card border-2 border-border hover:border-primary transition text-center"
                >
                  <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-primary mb-4">₦{pkg.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="max-w-2xl mx-auto mt-12 space-y-6">
            <h2 className="text-2xl font-bold">Project Details</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-card border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Description</label>
              <textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 bg-card border border-border rounded-lg resize-none"
              />
            </div>

            <h2 className="text-2xl font-bold pt-4">Your Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-card border border-border rounded-lg"
              />
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                type="button"
                onClick={() => setStep('select')}
                className="flex-1 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                type="submit"
                className="flex-1 py-2 bg-primary text-background rounded-lg font-medium hover:bg-secondary transition"
              >
                Continue to Payment
              </motion.button>
            </div>
          </form>
        )}

        {step === 'payment' && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-12 space-y-6">
            <h2 className="text-2xl font-bold">Payment Method</h2>

            <div>
              <label className="block text-sm font-medium mb-3">Select Payment Gateway</label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack"
                    checked={formData.paymentMethod === 'paystack'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Paystack</p>
                    <p className="text-sm text-muted-foreground">Pay with card or bank transfer</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    disabled
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">Stripe (Coming Soon)</p>
                    <p className="text-sm text-muted-foreground">International payments</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-primary text-background rounded-lg font-medium hover:bg-secondary transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed to Paystack'}
              </motion.button>
            </div>
          </form>
        )}
      </div>
      <Footer />
      <MobileNav />
    </main>
  );
}
