'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, LogOut, Save } from 'lucide-react';
import LogoutConfirm from '@/components/LogoutConfirm';
import { AdminLayout } from '@/components/AdminLayout';

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isVerified?: boolean;
  createdAt: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    checkAuthAndFetchProfile();
  }, []);

  const checkAuthAndFetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/admin/login');
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/auth/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfile(data.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching profile';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Profile load failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };
  

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast.success('Profile updated successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error updating profile';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error changing password';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    router.push('/auth/admin/login');
    toast.success('Logged out successfully');
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-full min-h-screen bg-background p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your profile and account settings</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-card border border-border rounded-lg"
            >
              <h2 className="text-xl font-bold mb-6">Profile Information</h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    title='name'
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    title='email'
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    title='phone'
                    name="phone"
                    value={profile.phone || ''}
                    onChange={handleProfileChange}
                    placeholder="e.g., +234 801 234 5678"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition"
                  />
                </div>


                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full md:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-card border border-border rounded-lg"
            >
              <h2 className="text-xl font-bold mb-6">Security</h2>

              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-6 py-2 bg-muted rounded-lg hover:bg-muted/80 transition"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input
                      title='currentPassword'
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={e =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      title='newPassword'
                      type="password"
                      value={passwordData.newPassword}
                      onChange={e =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      title='confirmPassword'
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={e =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="flex-1 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-card border border-border rounded-lg text-sm text-muted-foreground"
            >
              <p>Account created: {new Date(profile.createdAt).toLocaleDateString()}</p>
            </motion.div>

            {/* Logout Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <LogoutConfirm onConfirm={handleLogout}>
                <button className="w-full px-6 py-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition font-medium flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </LogoutConfirm>
            </motion.div>
          </div>
        ) : null}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
