"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleCanvas — Canvas-based particle network.
 * Performance-first: uses requestAnimationFrame + Canvas 2D,
 * zero DOM nodes for particles, minimal GC pressure.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
}

const CONFIG = {
  count: 70,           // particle count — lower = faster
  maxSpeed: 0.28,      // px per frame
  minRadius: 1.2,
  maxRadius: 2.2,
  connectDist: 130,    // max distance to draw a line
  particleColor: "60, 130, 246",   // RGB — blue-ish
  lineOpacityMax: 0.18,
  particleOpacityMin: 0.25,
  particleOpacityMax: 0.55,
  bgColor: "#050810",  // very dark blue-black
};

function initParticles(w: number, h: number): Particle[] {
  return Array.from({ length: CONFIG.count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 2 * CONFIG.maxSpeed,
    vy: (Math.random() - 0.5) * 2 * CONFIG.maxSpeed,
    r: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
    opacity: CONFIG.particleOpacityMin + Math.random() * (CONFIG.particleOpacityMax - CONFIG.particleOpacityMin),
  }));
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // ── Resize handler ──────────────────────────────────────────────────────
    let w = 0, h = 0;
    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      // Re-scatter particles to fit new size
      particlesRef.current = initParticles(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement ?? canvas);
    resize();

    // ── Draw loop ───────────────────────────────────────────────────────────
    const draw = () => {
      const pts = particlesRef.current;
      if (!w || !h) { rafRef.current = requestAnimationFrame(draw); return; }

      // Background fill — faster than clearRect for opaque canvas
      ctx.fillStyle = CONFIG.bgColor;
      ctx.fillRect(0, 0, w, h);

      // Move + bounce
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      // Draw lines (upper triangle only — O(n²/2))
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          const maxD2 = CONFIG.connectDist * CONFIG.connectDist;
          if (dist2 < maxD2) {
            const alpha = CONFIG.lineOpacityMax * (1 - dist2 / maxD2);
            ctx.strokeStyle = `rgba(${CONFIG.particleColor},${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        ctx.fillStyle = `rgba(${CONFIG.particleColor},${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        display: "block",
        // Performance hints
        willChange: "contents",
        imageRendering: "pixelated",
      }}
      aria-hidden="true"
    />
  );
}
