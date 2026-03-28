"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LastVisited() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      localStorage.setItem('lastVisited', window.location.href);
    } catch (e) {
      // ignore storage errors
    }
  }, [pathname]);

  return null;
}
