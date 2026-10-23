import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  pulseSpeed: number;
  pulsePhase: number;
  type: 'standard' | 'start' | 'goal' | 'frontier';
  connections: number[];
}

interface PulseParticle {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

export const HeroSearchGraphCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking for subtle interactive magnetism
    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    // Initialize search graph nodes
    const nodeCount = Math.min(36, Math.max(18, Math.floor(width / 32)));
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      let type: Node['type'] = 'standard';
      if (i === 0) type = 'start';
      else if (i === 1) type = 'goal';
      else if (i % 6 === 0) type = 'frontier';

      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        baseRadius: type === 'standard' ? 2.5 : 4.5,
        radius: type === 'standard' ? 2.5 : 4.5,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
        type,
        connections: []
      });
    }

    // Active path-traversal pulses along graph edges
    const pulses: PulseParticle[] = [];
    let pulseSpawnCounter = 0;

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Animation Render Loop
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Update and position nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Soft drift
        n.x += n.vx;
        n.y += n.vy;

        // Bounce gently off boundaries with margin
        if (n.x < 15) { n.x = 15; n.vx *= -1; }
        if (n.x > width - 15) { n.x = width - 15; n.vx *= -1; }
        if (n.y < 15) { n.y = 15; n.vy *= -1; }
        if (n.y > height - 15) { n.y = height - 15; n.vy *= -1; }

        // Mouse avoidance/gentle push
        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        const distToMouse = Math.hypot(dx, dy);
        if (distToMouse < 90 && distToMouse > 0) {
          const force = (90 - distToMouse) / 90;
          n.x -= (dx / distToMouse) * force * 1.5;
          n.y -= (dy / distToMouse) * force * 1.5;
        }

        // Pulse radius
        n.pulsePhase += n.pulseSpeed;
        n.radius = n.baseRadius + Math.sin(n.pulsePhase) * 0.8;
      }

      // 2. Draw search graph edges (connecting close nodes)
      const connectDist = Math.max(90, Math.min(130, width / 7));
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].connections = [];
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

          if (dist < connectDist) {
            nodes[i].connections.push(j);
            const alpha = (1 - dist / connectDist) * 0.22;

            // Draw line
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);

            // Special line styling if connecting key nodes
            if (n1.type === 'start' || n2.type === 'start') {
              ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 1.6})`;
              ctx.lineWidth = 1.2;
            } else if (n1.type === 'goal' || n2.type === 'goal') {
              ctx.strokeStyle = `rgba(244, 63, 94, ${alpha * 1.6})`;
              ctx.lineWidth = 1.2;
            } else {
              ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
              ctx.lineWidth = 0.8;
            }
            ctx.stroke();
          }
        }
      }

      // 3. Spawn traveling search pulses
      pulseSpawnCounter++;
      if (pulseSpawnCounter > 30 && pulses.length < 8) {
        pulseSpawnCounter = 0;
        const candidates = nodes
          .map((n, idx) => ({ idx, count: n.connections.length }))
          .filter((c) => c.count > 0);

        if (candidates.length > 0) {
          const from = candidates[Math.floor(Math.random() * candidates.length)].idx;
          const to = nodes[from].connections[Math.floor(Math.random() * nodes[from].connections.length)];
          const fromNode = nodes[from];
          const color =
            fromNode.type === 'start'
              ? '#10b981'
              : fromNode.type === 'goal'
              ? '#f43f5e'
              : fromNode.type === 'frontier'
              ? '#f59e0b'
              : '#6366f1';

          pulses.push({
            fromNode: from,
            toNode: to,
            progress: 0,
            speed: 0.012 + Math.random() * 0.018,
            color
          });
        }
      }

      // 4. Update and render search pulses
      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const p = pulses[pIdx];
        p.progress += p.speed;

        if (p.progress >= 1) {
          pulses.splice(pIdx, 1);
          continue;
        }

        const nFrom = nodes[p.fromNode];
        const nTo = nodes[p.toNode];
        if (!nFrom || !nTo) {
          pulses.splice(pIdx, 1);
          continue;
        }

        const curX = nFrom.x + (nTo.x - nFrom.x) * p.progress;
        const curY = nFrom.y + (nTo.y - nFrom.y) * p.progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // 5. Render Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        ctx.save();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);

        if (n.type === 'start') {
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.fill();

          // Outer beacon ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 3 + Math.sin(n.pulsePhase * 2) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (n.type === 'goal') {
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 12;
          ctx.fill();

          // Outer beacon ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 3 + Math.cos(n.pulsePhase * 2) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (n.type === 'frontier') {
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.fill();
        } else {
          ctx.fillStyle = '#6366f1';
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 4;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
};
