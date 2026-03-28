'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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
} from 'lucide-react';
import LogoutConfirm from '@/components/LogoutConfirm';

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

type Props = {
  onLogout?: () => void;
};

export default function MobileSidebar({ onLogout = () => {} }: Props) {
  const logout = typeof onLogout === 'function' ? onLogout : () => {};

  return (
    <div>
      <SheetTitle className="sr-only">Navigation</SheetTitle>
      <SheetDescription className="sr-only">Displays the mobile sidebar.</SheetDescription>

      <div className="p-6 border-b border-border flex items-center gap-3">
        <Image src="/logo.png" alt="CICCL Logo" width={36} height={36} />
        <h2 className="text-lg font-bold">CICCL Admin</h2>
      </div>

      <nav className="p-4 space-y-2">
        {adminMenuItems.map((item) => (
          <SheetClose asChild key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          </SheetClose>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-border">
        <LogoutConfirm onConfirm={logout}>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </LogoutConfirm>
      </div>
    </div>
  );
}
