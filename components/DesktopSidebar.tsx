'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  CreditCard,
  Users,
  Image as ImageIcon,
  BarChart3,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import LogoutConfirm from '@/components/LogoutConfirm';

type Props = {
  sidebarOpen: boolean;
  onToggle: () => void;
  onLogout?: () => void;
};

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Briefcase, label: 'Projects', href: '/admin/projects' },
  { icon: MessageSquare, label: 'Reviews', href: '/admin/reviews' },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
  { icon: Users, label: 'Clients', href: '/admin/clients' },
  { icon: ImageIcon, label: 'Images', href: '/admin/images' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function DesktopSidebar({ sidebarOpen, onToggle, onLogout = () => {} }: Props) {
  const pathname = usePathname();
  const logout = typeof onLogout === 'function' ? onLogout : () => {};

  return (
    <aside
      className={`hidden md:flex flex-col h-full z-20 transition-all duration-300 bg-card border-r border-border ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}
    >
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Image src="/logo.png" alt="CICCL Logo" width={36} height={36} />
        {sidebarOpen && <h2 className="text-lg font-bold">CICCL Admin</h2>}
        <button
          onClick={onToggle}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="ml-auto p-2 rounded-md hover:bg-muted transition"
        >
          {sidebarOpen ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {adminMenuItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname === item.href ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <LogoutConfirm onConfirm={logout}>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </LogoutConfirm>

        <button
          onClick={onToggle}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="w-full flex items-center justify-center px-3 py-2 rounded-md hover:bg-muted transition"
        >
          {sidebarOpen ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
