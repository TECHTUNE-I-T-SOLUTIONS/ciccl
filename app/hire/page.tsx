'use client';

import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Loader2 } from 'lucide-react';

function HirePageFallback() {
  return (
    <main className="w-full bg-background">
      <Navbar />
      <div className="w-full max-w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
      <Footer />
      <MobileNav />
    </main>
  );
}

export default function HirePage() {
  return (
    <Suspense fallback={<HirePageFallback />}>
      <HirePageContent />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Inner component that uses useSearchParams – must be wrapped in Suspense
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

type PaymentStatus = 'idle' | 'initializing' | 'processing' | 'success' | 'failed';

function HirePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentRef, setPaymentRef] = useState<string>('');

  // Determine initial step based on query params
  const initialService = searchParams.get('service') || '';
  const initialStep: 'select' | 'details' | 'payment' = initialService ? 'details' : 'select';

  const [step, setStep] = useState<'select' | 'details' | 'payment'>(initialStep);
  const [formData, setFormData] = useState({
    serviceType: initialService || 'cost-estimation',
    packageType: 'custom',
    projectName: '',
    projectDescription: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    paymentMethod: 'paystack',
    amount: '',
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

  // Load Paystack inline script
  useEffect(() => {
    if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectPackage = (pkgId: string) => {
    const pkg = packages.find(p => p.id === pkgId);
    setFormData((prev) => ({
      ...prev,
      packageType: pkgId,
      amount: pkg ? pkg.price.toString() : prev.amount,
    }));
    setStep('details');
  };

  const selectService = (serviceId: string) => {
    setFormData((prev) => ({ ...prev, serviceType: serviceId }));
    setStep('details');
  };

  const verifyPayment = useCallback(async (reference: string) => {
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (data.success) {
        setPaymentStatus('success');
        toast.success('Payment verified successfully!');
        // Redirect to success page after a moment
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setPaymentStatus('failed');
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      setPaymentStatus('failed');
      toast.error('Failed to verify payment. Please contact support.');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPaymentStatus('initializing');

    try {
      // Validate amount
      const amountNum = parseFloat(formData.amount);
      if (!amountNum || amountNum <= 0) {
        toast.error('Please enter a valid payment amount');
        setLoading(false);
        setPaymentStatus('idle');
        return;
      }

      // Initialize payment on the server
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          packageType: formData.packageType,
          amount: amountNum,
          projectDetails: {
            name: formData.projectName,
            description: formData.projectDescription,
          },
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          paymentMethod: formData.paymentMethod,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to initiate payment');
      }

      const data = await response.json();
      const reference = data.data.transactionRef;
      setPaymentRef(reference);

      // Open Paystack inline popup
      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

      if (typeof window.PaystackPop === 'undefined') {
        toast.error('Payment system is loading. Please try again.');
        setLoading(false);
        setPaymentStatus('idle');
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: formData.clientEmail,
        amount: amountNum * 100, // Paystack uses kobo
        ref: reference,
        metadata: {
          clientName: formData.clientName,
          serviceType: formData.serviceType,
          packageType: formData.packageType,
          projectName: formData.projectName,
        },
        callback: (response: any) => {
          // Payment was successful in the popup
          setPaymentStatus('processing');
          // Verify with our backend
          verifyPayment(response.reference || reference);
        },
        onClose: () => {
          // User closed the popup without completing
          setLoading(false);
          setPaymentStatus('idle');
          toast.info('Payment window was closed. You can try again.');
        },
      });

      handler.openIframe();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
      setLoading(false);
      setPaymentStatus('idle');
    }
  };

  const resetForm = () => {
    setPaymentStatus('idle');
    setPaymentRef('');
    setStep('select');
    setFormData({
      serviceType: 'cost-estimation',
      packageType: 'custom',
      projectName: '',
      projectDescription: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      paymentMethod: 'paystack',
      amount: '',
    });
  };

  return (
    <>
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
                  onClick={() => selectService(service.id)}
                  className="p-6 rounded-lg border-2 border-border hover:border-primary transition text-left"
                >
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </motion.button>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-8">Or Select a Package</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <motion.button
                  key={pkg.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectPackage(pkg.id)}
                  className="p-6 rounded-lg bg-card border-2 border-border hover:border-primary transition text-center"
                >
                  <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-primary mb-4">₦{pkg.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                </motion.button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setFormData(prev => ({ ...prev, packageType: 'custom' }));
                  setStep('details');
                }}
                className="px-6 py-3 border-2 border-dashed border-border hover:border-primary rounded-lg text-muted-foreground hover:text-primary transition"
              >
                + Custom Amount (No Package)
              </motion.button>
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
                title="Project Name"
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
                title="Project Description"
                className="w-full px-4 py-2 bg-card border border-border rounded-lg resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount to Pay (₦)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₦</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Enter amount"
                  title="Payment Amount"
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.packageType !== 'custom' 
                  ? `Amount prefilled from selected ${packages.find(p => p.id === formData.packageType)?.name} package. You can modify it.`
                  : 'Enter a custom amount you wish to pay.'}
              </p>
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
                  title="Full Name"
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
                  title="Email Address"
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
                title="Phone Number"
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
          <div className="max-w-2xl mx-auto mt-12 space-y-6">
            {paymentStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-lg p-8 text-center space-y-4"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-green-500">Payment Successful!</h2>
                <p className="text-muted-foreground">
                  Your payment has been processed and verified. Reference: <span className="font-mono text-primary">{paymentRef}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  The owner will review your project details and get back to you shortly.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={resetForm}
                  className="px-6 py-2 bg-primary text-background rounded-lg font-medium"
                >
                  Make Another Payment
                </motion.button>
              </motion.div>
            ) : paymentStatus === 'failed' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-lg p-8 text-center space-y-4"
              >
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h2 className="text-2xl font-bold text-red-500">Payment Failed</h2>
                <p className="text-muted-foreground">
                  Your payment could not be processed. Please try again or contact support.
                </p>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => { setPaymentStatus('idle'); setLoading(false); }}
                    className="px-6 py-2 bg-primary text-background rounded-lg font-medium"
                  >
                    Try Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={resetForm}
                    className="px-6 py-2 border border-border rounded-lg font-medium"
                  >
                    Start Over
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Payment Summary & Method</h2>

                <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-lg">Order Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service</span>
                    <span>{services.find(s => s.id === formData.serviceType)?.title || formData.serviceType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Package</span>
                    <span className="capitalize">{formData.packageType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Project</span>
                    <span>{formData.projectName}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₦{parseFloat(formData.amount || '0').toLocaleString()}</span>
                  </div>
                </div>

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
                    disabled={loading}
                    className="flex-1 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition disabled:opacity-50"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-2 bg-primary text-background rounded-lg font-medium hover:bg-secondary transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {paymentStatus === 'initializing' ? 'Initializing...' : 'Processing...'}
                      </>
                    ) : (
                      `Pay ₦${parseFloat(formData.amount || '0').toLocaleString()}`
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
      <MobileNav />
    </>
  );
}