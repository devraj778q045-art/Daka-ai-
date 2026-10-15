import React, { useEffect, useRef } from 'react';
import { OrbState } from '../types/deka';

interface DekaOrbProps {
  state: OrbState;
  size?: number;
  onClick?: () => void;
  className?: string;
  batterySaver?: boolean;
}

export const DekaOrb: React.FC<DekaOrbProps> = ({
  state = 'idle',
  size = 240,
  onClick,
  className = '',
  batterySaver = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let lastRenderTime = 0;

    // Particle nodes in the energy field
    const particles = Array.from({ length: 24 }).map((_, i) => ({
      angle: (i * Math.PI * 2) / 24,
      distanceRatio: 0.65 + (i % 3) * 0.15,
      speed: 0.015 + (i % 4) * 0.005,
      radius: 1.5 + (i % 3) * 1.2,
      opacity: 0.3 + (i % 5) * 0.14,
    }));

    const render = (now: number = performance.now()) => {
      // In battery saver mode, throttle render loop to ~15 FPS to save CPU and battery
      if (batterySaver && now - lastRenderTime < 65) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = now;

      time += batterySaver ? 0.015 : 0.03;
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = size * 0.28;

      // Pulse multiplier according to state
      let pulse = 1;
      let glowColor = batterySaver ? '#0891b2' : '#00f0ff';
      let secondaryGlow = batterySaver ? '#1e40af' : '#3b82f6';
      let speedMultiplier = batterySaver ? 0.6 : 1;

      if (state === 'listening') {
        pulse = 1 + Math.sin(time * 6) * (batterySaver ? 0.05 : 0.12);
        glowColor = batterySaver ? '#06b6d4' : '#00f0ff';
        secondaryGlow = '#0891b2';
        speedMultiplier = batterySaver ? 1.0 : 2.2;
      } else if (state === 'thinking') {
        pulse = 1 + Math.sin(time * 4) * (batterySaver ? 0.03 : 0.06);
        glowColor = '#818cf8';
        secondaryGlow = '#00f0ff';
        speedMultiplier = batterySaver ? 1.2 : 3.0;
      } else if (state === 'speaking') {
        pulse = 1 + Math.abs(Math.sin(time * 8)) * (batterySaver ? 0.08 : 0.18);
        glowColor = '#22d3ee';
        secondaryGlow = '#60a5fa';
        speedMultiplier = batterySaver ? 1.0 : 1.8;
      } else {
        pulse = 1 + Math.sin(time * 2) * (batterySaver ? 0.02 : 0.04);
      }

      const activeRadius = baseRadius * pulse;

      // 1. Broad outer ambient glow (dimmed in battery saver mode)
      const outerGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        activeRadius * 0.3,
        centerX,
        centerY,
        activeRadius * (batterySaver ? 1.5 : 2.2)
      );
      outerGlow.addColorStop(0, batterySaver ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0, 240, 255, 0.28)');
      outerGlow.addColorStop(0.5, batterySaver ? 'rgba(59, 130, 246, 0.04)' : 'rgba(59, 130, 246, 0.12)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, activeRadius * (batterySaver ? 1.5 : 2.2), 0, Math.PI * 2);
      ctx.fill();

      // 2. Ripple shockwaves for listening/speaking (skipped in battery saver to save CPU)
      if (!batterySaver && (state === 'listening' || state === 'speaking')) {
        for (let i = 1; i <= 3; i++) {
          const waveRadius = (activeRadius * (1 + ((time * 0.8 + i * 0.35) % 1) * 1.1));
          const waveAlpha = Math.max(0, 1 - (waveRadius / (activeRadius * 2.2)));
          ctx.strokeStyle = `rgba(0, 240, 255, ${waveAlpha * 0.45})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 3. Rotating energy rings
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.5 * speedMultiplier);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.ellipse(0, 0, activeRadius * 1.35, activeRadius * 0.95, time * 0.3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([4, 16]);
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, activeRadius * 1.15, activeRadius * 1.45, -time * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Orbiting energy particles
      particles.forEach((p, idx) => {
        p.angle += p.speed * speedMultiplier;
        const currentDist = activeRadius * p.distanceRatio * (1 + Math.sin(time + idx) * 0.1);
        const px = centerX + Math.cos(p.angle) * currentDist;
        const py = centerY + Math.sin(p.angle) * currentDist;

        ctx.fillStyle = idx % 2 === 0 ? glowColor : secondaryGlow;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 5. Solid electric core with plasma layers
      const coreGrad = ctx.createRadialGradient(
        centerX - activeRadius * 0.25,
        centerY - activeRadius * 0.25,
        activeRadius * 0.05,
        centerX,
        centerY,
        activeRadius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.2, '#a5f3fc');
      coreGrad.addColorStop(0.5, glowColor);
      coreGrad.addColorStop(0.8, '#1e3a8a');
      coreGrad.addColorStop(1, '#080c14');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, activeRadius, 0, Math.PI * 2);
      ctx.fill();

      // 6. Surface plasma filaments (wavy electric contours)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, activeRadius, 0, Math.PI * 2);
      ctx.clip();

      for (let j = 0; j < 3; j++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + j * 0.15})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const distortion = Math.sin(a * 4 + time * (2 + j)) * (6 + j * 3);
          const r = activeRadius * (0.45 + j * 0.22) + distortion;
          const x = centerX + Math.cos(a) * r;
          const y = centerY + Math.sin(a) * r;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      // 7. Specular highlight for glassy depth
      const specGrad = ctx.createRadialGradient(
        centerX - activeRadius * 0.45,
        centerY - activeRadius * 0.45,
        2,
        centerX - activeRadius * 0.4,
        centerY - activeRadius * 0.4,
        activeRadius * 0.5
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.25)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(centerX - activeRadius * 0.35, centerY - activeRadius * 0.35, activeRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, size, batterySaver]);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      role="button"
      tabIndex={0}
      title={batterySaver ? "DEKA AI Neural Core (Battery Saver Mode) — Tap to speak" : "DEKA AI Neural Core — Tap to speak"}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={`pointer-events-none transition-all duration-500 ${
          batterySaver
            ? 'drop-shadow-[0_0_10px_rgba(0,240,255,0.2)] opacity-80'
            : 'drop-shadow-[0_0_35px_rgba(0,240,255,0.45)] opacity-100'
        }`}
      />
    </div>
  );
};
