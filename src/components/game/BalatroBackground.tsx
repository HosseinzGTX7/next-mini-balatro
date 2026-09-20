"use client";

import React, { useEffect, useRef, memo } from "react";

interface BalatroBackgroundProps {
  intensity?: number;
  className?: string;
}

/**
 * Procedural HTML5 Canvas rendering the iconic hypnotic Balatro swirling vortex background.
 * Optimized with low-resolution internal buffer scaled up for retro aesthetics and 60fps performance.
 */
export const BalatroBackground = memo(function BalatroBackground({
  intensity = 1,
  className = "",
}: BalatroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Render at low internal resolution for authentic retro CRT feel & maximum performance
    const renderWidth = 160;
    const renderHeight = 100;
    canvas.width = renderWidth;
    canvas.height = renderHeight;

    const imgData = ctx.createImageData(renderWidth, renderHeight);
    const data = imgData.data;

    const render = () => {
      time += 0.015 * intensity;

      for (let y = 0; y < renderHeight; y++) {
        const ny = (y / renderHeight) * 2 - 1;
        for (let x = 0; x < renderWidth; x++) {
          const nx = (x / renderWidth) * 2 - 1;

          // Polar coordinates
          const r = Math.sqrt(nx * nx + ny * ny);
          const theta = Math.atan2(ny, nx);

          // Balatro vortex wave equation: sine combination of radius, angle, and time
          const wave1 = Math.sin(r * 4.5 - time * 2.2 + theta * 2.0);
          const wave2 = Math.cos(nx * 3.2 + time * 1.5 + Math.sin(ny * 2.0 + time));
          const wave3 = Math.sin(r * 3.0 + theta * 3.0 - time * 1.8);

          const val = (wave1 + wave2 + wave3) / 3.0; // range ~ -1 to 1

          const idx = (y * renderWidth + x) * 4;

          // Balatro color ramp: deep emerald felt green (#0d2b1d), fiery crimson (#fe5f55), deep blue (#003b6f)
          if (val < -0.2) {
            // Deep emerald felt
            const t = (val + 1) / 0.8;
            data[idx] = Math.floor(10 + 15 * t); // R
            data[idx + 1] = Math.floor(35 + 40 * t); // G
            data[idx + 2] = Math.floor(22 + 25 * t); // B
          } else if (val < 0.35) {
            // Transition into deep navy / cyan
            const t = (val + 0.2) / 0.55;
            data[idx] = Math.floor(8 + 20 * t);
            data[idx + 1] = Math.floor(25 + 35 * t);
            data[idx + 2] = Math.floor(45 + 75 * t);
          } else {
            // Subtle fiery vermilion / crimson crests
            const t = (val - 0.35) / 0.65;
            data[idx] = Math.floor(25 + 110 * t);
            data[idx + 1] = Math.floor(15 + 25 * t);
            data[idx + 2] = Math.floor(20 + 30 * t);
          }

          data[idx + 3] = 255; // Alpha
        }
      }

      ctx.putImageData(imgData, 0, 0);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover filter blur-lg opacity-40 scale-105"
        style={{ imageRendering: "pixelated" }}
      />
      {/* Dark vignette blending layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f14]/80 via-transparent to-[#0b0f14]/90" />
    </div>
  );
});
