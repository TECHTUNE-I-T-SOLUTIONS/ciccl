'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const [isClient, setIsClient] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const isInteractive = useRef(false);

  useEffect(() => {
    setIsClient(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      isInteractive.current =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        !!target.closest('button') ||
        !!target.closest('a') ||
        target.classList.contains('interactive') ||
        !!target.closest('.interactive');
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop for real-time cursor tracking
    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX.current - 6}px, ${mouseY.current - 6}px) scale(${
          isInteractive.current ? 1.5 : 1
        })`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${mouseX.current - 16}px, ${mouseY.current - 16}px) scale(${
          isInteractive.current ? 1.8 : 1
        })`;
        ringRef.current.style.opacity = isInteractive.current ? '1' : '0.6';
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${mouseX.current - 32}px, ${mouseY.current - 32}px)`;
        glowRef.current.style.opacity = isInteractive.current ? '0.4' : '0.15';
      }

      requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (!isClient) return null;

  return (
    <>
      {/* Hide default cursor */}
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>

      {/* Main cursor dot */}
      <div
        ref={dotRef}
        className="fixed w-3 h-3 bg-primary rounded-full pointer-events-none z-[9999] will-change-transform"
        style={{
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fixed w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-[9998] will-change-transform"
        style={{
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Glow effect */}
      <div
        ref={glowRef}
        className="fixed w-16 h-16 bg-primary rounded-full pointer-events-none z-[9997] blur-2xl will-change-transform"
        style={{
          transition: 'opacity 0.2s ease',
        }}
      />
    </>
  );
}
