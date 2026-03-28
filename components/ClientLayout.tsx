'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
} from 'lucide-react';

const clientMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/client/dashboard' },
  { icon: Briefcase, label: 'My Projects', href: '/client/projects' },
  { icon: Settings, label: 'Account Settings', href: '/client/settings' },
];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clientName, setClientName] = useState('Client');

  useEffect(() => {
    const name = localStorage.getItem('clientName');
    if (name) {
      setClientName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientName');
    router.push('/auth/client/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-screen bg-card border-r border-border overflow-y-auto transition-all duration-300 z-40"
      >
        <div className="p-6">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-primary">Client Portal</h1>
          )}
        </div>

        <nav className="space-y-2 px-4">
          {clientMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{clientName}</p>
              <p className="text-xs text-muted-foreground">Client Account</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
