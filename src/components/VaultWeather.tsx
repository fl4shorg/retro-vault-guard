import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWeather } from '@/contexts/WeatherContext';

/* ── Snow ───────────────────────────────────────────────────────────── */
interface Flake {
  x: number; y: number;
  r: number; speed: number;
  drift: number; angle: number;
  opacity: number;
}

function useSnowCanvas(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{ flakes: Flake[]; raf: number }>({ flakes: [], raf: 0 });

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 140;
    const flakes: Flake[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.8 + 0.6,
      speed: Math.random() * 1.2 + 0.4,
      drift: (Math.random() - 0.5) * 0.5,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.55 + 0.25,
    }));
    stateRef.current.flakes = flakes;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const f of flakes) {
        f.angle += 0.008;
        f.y += f.speed;
        f.x += f.drift + Math.sin(f.angle) * 0.4;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        if (f.x > W + 4) f.x = -4;
        if (f.x < -4) f.x = W + 4;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,235,255,${f.opacity})`;
        ctx.fill();
      }

      stateRef.current.raf = requestAnimationFrame(draw);
    };

    stateRef.current.raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return canvasRef;
}

/* ── Rain ───────────────────────────────────────────────────────────── */
interface Drop {
  x: number; y: number;
  len: number; speed: number;
  opacity: number;
}

function useRainCanvas(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{ raf: number }>({ raf: 0 });

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ANGLE = 0.28; // radians — slight lean
    const COUNT = 220;
    const drops: Drop[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: Math.random() * 18 + 8,
      speed: Math.random() * 8 + 10,
      opacity: Math.random() * 0.35 + 0.12,
    }));

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const dx = Math.sin(ANGLE);
      const dy = Math.cos(ANGLE);

      ctx.strokeStyle = 'rgba(180,210,255,1)';
      ctx.lineWidth = 0.8;

      for (const d of drops) {
        d.y += d.speed;
        d.x += d.speed * Math.tan(ANGLE);
        if (d.y > H + d.len) {
          d.y = -d.len;
          d.x = Math.random() * (W + 200) - 100;
        }

        ctx.globalAlpha = d.opacity;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - dx * d.len, d.y - dy * d.len);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      stateRef.current.raf = requestAnimationFrame(draw);
    };

    stateRef.current.raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return canvasRef;
}

/* ── Fog ────────────────────────────────────────────────────────────── */
interface FogLayer {
  x: number; y: number;
  w: number; h: number;
  opacity: number; speed: number;
  phase: number; amp: number;
}

function useFogCanvas(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{ raf: number }>({ raf: 0 });

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 14;
    const layers: FogLayer[] = Array.from({ length: COUNT }, (_, i) => ({
      x: (Math.random() - 0.3) * window.innerWidth,
      y: Math.random() * window.innerHeight,
      w: window.innerWidth * (1.2 + Math.random() * 1.4),
      h: 90 + Math.random() * 200,
      opacity: 0.04 + Math.random() * 0.10,
      speed: 0.18 + Math.random() * 0.32,
      phase: Math.random() * Math.PI * 2,
      amp: 12 + Math.random() * 28,
    }));

    let t = 0;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t += 0.004;

      for (const l of layers) {
        l.x += l.speed;
        if (l.x > W + l.w * 0.5) l.x = -l.w * 0.8;

        const cy = l.y + Math.sin(t + l.phase) * l.amp;

        const grad = ctx.createRadialGradient(
          l.x, cy, 0,
          l.x, cy, l.w * 0.55,
        );
        grad.addColorStop(0,   `rgba(200,210,230,${l.opacity})`);
        grad.addColorStop(0.5, `rgba(190,205,225,${l.opacity * 0.55})`);
        grad.addColorStop(1,   'rgba(190,205,225,0)');

        ctx.save();
        ctx.scale(1, l.h / (l.w * 0.55));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(l.x, cy * (l.w * 0.55) / l.h, l.w * 0.55, l.w * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      stateRef.current.raf = requestAnimationFrame(draw);
    };

    stateRef.current.raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return canvasRef;
}

/* ── Portal wrapper ─────────────────────────────────────────────────── */
const canvasStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 9998,
};

function FogPortal() {
  const ref = useFogCanvas(true);
  return createPortal(<canvas ref={ref} style={canvasStyle} aria-hidden="true" />, document.body);
}

function SnowPortal() {
  const ref = useSnowCanvas(true);
  return createPortal(<canvas ref={ref} style={canvasStyle} aria-hidden="true" />, document.body);
}

function RainPortal() {
  const ref = useRainCanvas(true);
  return createPortal(<canvas ref={ref} style={canvasStyle} aria-hidden="true" />, document.body);
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function VaultWeather() {
  const { effect } = useWeather();
  if (effect === 'snow') return <SnowPortal />;
  if (effect === 'rain') return <RainPortal />;
  if (effect === 'fog')  return <FogPortal />;
  return null;
}
