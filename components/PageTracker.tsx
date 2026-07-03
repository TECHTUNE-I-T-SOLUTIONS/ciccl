"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'mobile';
  }
  return 'desktop';
}

export default function PageTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    // Skip tracking for admin and API routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_')) {
      lastPathRef.current = pathname;
      return;
    }

    // Avoid duplicate tracking for the same path
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    const trackVisit = async () => {
      try {
        // Get IP from a free service
        let ipAddress = 'unknown';
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
          const ipData = await ipRes.json();
          ipAddress = ipData.ip;
        } catch {
          // Fallback: use a hash of common headers
          ipAddress = `visitor-${Date.now()}`;
        }

        const payload = {
          ipAddress,
          route: pathname,
          referrer: document.referrer || '',
          deviceType: getDeviceType(),
        };

        // Fire and forget - don't block page navigation
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {
          // Silently fail - analytics should never block UX
        });
      } catch {
        // Silently fail
      }
    };

    // Delay slightly to not block rendering
    const timer = setTimeout(trackVisit, 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}