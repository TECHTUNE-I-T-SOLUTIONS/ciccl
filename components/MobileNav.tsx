'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Briefcase, MessageSquare, Mail, User } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/projects', icon: Briefcase, label: 'Projects' },
    { href: '/reviews', icon: MessageSquare, label: 'Reviews' },
    { href: '/contact', icon: Mail, label: 'Contact' },
    { href: '/auth/client/login', icon: User, label: 'Account' },
  ];

  // Hide on authentication and admin pages
  if (pathname?.includes('/auth') || pathname?.includes('/admin') || pathname?.includes('/client')) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40"
    >
      <div className="w-full max-w-full px-2">
        <nav className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center py-3 px-2 relative"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-1 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs">{item.label}</span>
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
}
