'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import DesktopSidebar from '@/components/DesktopSidebar';
import MobileSidebar from '@/components/MobileSidebar';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const name = localStorage.getItem('adminName');
    if (name) setAdminName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    router.push('/auth/admin/login');
  };

  return (
    <div className="flex h-screen bg-background">
      <DesktopSidebar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />

      {/* Mobile sheet trigger & content */}
      <Sheet>
        <div className="md:hidden fixed left-4 top-4 z-50">
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg bg-card/60 backdrop-blur-md" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
        </div>

        <SheetContent side="left" className="w-64 sm:w-72">
          <MobileSidebar onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Bar */}
        <div className="sticky top-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:inline-flex p-2 rounded-lg bg-card/60 backdrop-blur-md"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{adminName}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
