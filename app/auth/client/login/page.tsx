'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function ClientLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Invalid credentials');
      const data = await response.json();

      if (data.user.role !== 'client') throw new Error('Unauthorized');

      try {
        localStorage.setItem('clientToken', data.token);
        localStorage.setItem('clientName', data.user.name || 'Client');
      } catch (e) {}

      toast.success('Logged in!');
      router.push('/client/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
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
            <h1 className="text-3xl font-bold mb-2">Client Login</h1>
            <p className="text-muted-foreground">Access your project dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-background rounded-lg font-medium hover:bg-secondary transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
            <Link href="/auth/client/recover" className="block text-primary hover:underline">
              Forgot password?
            </Link>
            <div>
              Don't have an account?{' '}
              <Link href="/auth/client/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
