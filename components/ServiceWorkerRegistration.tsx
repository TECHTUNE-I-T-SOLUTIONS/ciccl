"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    (async function registerSW() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered:', reg);
      } catch (err) {
        console.warn('Service worker registration failed:', err);
      }
    })();
  }, []);

  return null;
}
