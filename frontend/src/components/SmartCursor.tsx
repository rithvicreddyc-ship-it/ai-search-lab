import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const SmartCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    // Only enable on desktop pointer devices
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      return !isTouch;
    }
    return false;
  });

  const [cursorMode, setCursorMode] = useState<'default' | 'hover' | 'text' | 'cell' | 'drag'>('default');
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Position refs for 60fps buttery smooth requestAnimationFrame updates without React re-render lag
  const mousePos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<ClickRipple[]>([]);
  const lastSpawnPos = useRef({ x: -100, y: -100 });

  const colors = ['#6366f1', '#0ea5e9', '#10b981', '#a855f7', '#f59e0b'];

  useEffect(() => {
    if (!isEnabled) return;

    // Add CSS class to body to hide system cursor gracefully on non-touch devices
    document.body.classList.add('smart-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      setIsVisible(true);

      // Spawn spark trail particles if mouse moved at least 6px
      const dist = Math.hypot(e.clientX - lastSpawnPos.current.x, e.clientY - lastSpawnPos.current.y);
      if (dist > 8 && particlesRef.current.length < 35) {
        lastSpawnPos.current = { x: e.clientX, y: e.clientY };
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * 0.8;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.2 + Math.random() * 2.2,
          color,
          alpha: 0.85,
          decay: 0.025 + Math.random() * 0.025
        });
      }

      // Check context target for smart cursor morphing
      const target = e.target as HTMLElement | null;
      if (target) {
        // Text input / textarea
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox'
        ) {
          setCursorMode('text');
        }
        // Clickable interactive elements
        else if (
          target.closest('button') ||
          target.closest('a') ||
          target.closest('[role="button"]') ||
          target.closest('select') ||
          target.closest('[role="tab"]') ||
          target.classList.contains('cursor-pointer') ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'A'
        ) {
          setCursorMode('hover');
        }
        // Grid cell in interactive search canvas
        else if (
          target.closest('.grid-cell') ||
          target.getAttribute('data-cell') !== null ||
          target.closest('canvas')
        ) {
          setCursorMode('cell');
        } else {
          setCursorMode('default');
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
      // Spawn expanding click shockwave ripple
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 36,
        alpha: 0.8,
        color: cursorMode === 'hover' ? '#6366f1' : '#0ea5e9'
      });

      // Burst of click sparks
      for (let i = 0; i < 7; i++) {
        const angle = (Math.PI * 2 * i) / 7 + (Math.random() - 0.5) * 0.4;
        const speed = 1.2 + Math.random() * 1.5;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 2,
          color: colors[i % colors.length],
          alpha: 0.95,
          decay: 0.035
        });
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Canvas sizing for particles
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // 60FPS Physics & Animation loop
    let animId: number;
    const updatePhysics = () => {
      // 1. Smooth lerp for trailing ring
      const lerpFactor = 0.22;
      trailPos.current.x += (mousePos.current.x - trailPos.current.x) * lerpFactor;
      trailPos.current.y += (mousePos.current.y - trailPos.current.y) * lerpFactor;

      // Update inner dot (instant precision)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Update trailing ring (smooth elastic follow)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // 2. Render particle canvas & click shockwaves
      const cvs = canvasRef.current;
      if (cvs) {
        const ctx = cvs.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, cvs.width, cvs.height);

          // Update & draw click shockwaves
          for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
            const rip = ripplesRef.current[i];
            rip.radius += 2.2;
            rip.alpha *= 0.92;

            if (rip.alpha <= 0.04 || rip.radius >= rip.maxRadius) {
              ripplesRef.current.splice(i, 1);
              continue;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
            ctx.strokeStyle = rip.color;
            ctx.lineWidth = 1.8;
            ctx.globalAlpha = rip.alpha;
            ctx.shadowColor = rip.color;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.restore();
          }

          // Update & draw particle trail sparks
          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            p.size *= 0.96;

            if (p.alpha <= 0.05 || p.size <= 0.4) {
              particlesRef.current.splice(i, 1);
              continue;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.restore();
          }
        }
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animId);
      document.body.classList.remove('smart-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('resize', handleResize);
    };
  }, [isEnabled, cursorMode]);

  if (!isEnabled) return null;

  // Outer ring dynamic styling based on state
  let ringClasses =
    'fixed top-0 left-0 pointer-events-none z-[9999] rounded-full transition-all duration-150 ease-out will-change-transform';

  if (!isVisible) {
    ringClasses += ' opacity-0 scale-50';
  } else if (isMouseDown) {
    ringClasses += ' w-5 h-5 bg-indigo-500/30 border-2 border-indigo-600 shadow-md shadow-indigo-500/50 scale-90';
  } else if (cursorMode === 'hover') {
    ringClasses +=
      ' w-12 h-12 bg-indigo-500/15 border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 backdrop-blur-[2px] animate-pulse';
  } else if (cursorMode === 'text') {
    ringClasses +=
      ' w-3 h-7 bg-sky-500/20 border-2 border-sky-500 rounded-sm shadow-md shadow-sky-500/30';
  } else if (cursorMode === 'cell') {
    ringClasses +=
      ' w-10 h-10 bg-emerald-500/20 border-2 border-emerald-500 rounded-xl shadow-md shadow-emerald-500/30';
  } else {
    ringClasses +=
      ' w-8 h-8 bg-indigo-500/10 border border-indigo-400/80 shadow-sm shadow-indigo-500/20';
  }

  // Inner center dot dynamic styling
  let dotClasses =
    'fixed top-0 left-0 pointer-events-none z-[10000] rounded-full will-change-transform transition-all duration-75';

  if (!isVisible) {
    dotClasses += ' opacity-0 scale-0';
  } else if (isMouseDown) {
    dotClasses += ' w-2 h-2 bg-indigo-600 scale-125';
  } else if (cursorMode === 'hover') {
    dotClasses += ' w-2.5 h-2.5 bg-indigo-600 shadow-md shadow-indigo-500';
  } else if (cursorMode === 'text') {
    dotClasses += ' w-1 h-3.5 bg-sky-600 rounded-xs';
  } else if (cursorMode === 'cell') {
    dotClasses += ' w-2.5 h-2.5 bg-emerald-600 shadow-md shadow-emerald-500';
  } else {
    dotClasses += ' w-2 h-2 bg-indigo-600 shadow-xs shadow-indigo-500/80';
  }

  return (
    <>
      {/* Spark Particle & Shockwave Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998] select-none"
        aria-hidden="true"
      />

      {/* Trailing Elastic Halo Ring */}
      <div ref={ringRef} className={ringClasses} aria-hidden="true">
        {/* Subtle center crosshair in hover/cell mode */}
        {(cursorMode === 'hover' || cursorMode === 'cell') && (
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-indigo-700/60 pointer-events-none">
            +
          </span>
        )}
      </div>

      {/* Sharp Center Pointer Dot */}
      <div ref={dotRef} className={dotClasses} aria-hidden="true" />
    </>
  );
};
