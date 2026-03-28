'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function ClientRecover() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'recover'>('email');
  const [formData, setFormData] = useState({
    email: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === 'email') {
        setStep('recover');
      } else {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Recovery failed');
        
        toast.success('Password reset!');
        router.push('/auth/client/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 mt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-muted-foreground">Recover your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'email' ? (
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-card border border-border rounded-lg"
              />
            ) : (
              <>
                <input
                  type="text"
                  name="securityAnswer"
                  placeholder="Security answer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg"
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg"
                />
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-background rounded-lg font-medium hover:bg-secondary transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : step === 'email' ? 'Continue' : 'Reset Password'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/client/login" className="text-primary hover:underline text-sm">
              Back to login
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
