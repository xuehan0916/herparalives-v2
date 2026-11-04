"use client";
import { useEffect, useRef } from "react";

// 前景剪影从旋涡深处向镜头展开。只用一个 canvas，避免大量 DOM 动画。
export default function VortexScene({
  active,
  paused,
}: {
  active: boolean;
  paused: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ctx = element.getContext("2d");
    if (!ctx) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sprite = new Image();
    sprite.src = "/images/women-silhouettes.png";
    let width = 0,
      height = 0,
      frame = 0,
      elapsed = 7,
      previous = 0,
      disposed = false;
    const resize = () => {
      width = element.clientWidth;
      height = element.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = width * scale;
      element.height = height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      if (!active || paused || media.matches) paint(7);
    };
    const paint = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const cx = width * 0.5,
        cy = height * 0.43;
      const reach = Math.hypot(width, height) * 0.64;
      // 固定种子的星尘，服务端和客户端都不产生随机布局抖动。
      for (let i = 0; i < 95; i++) {
        const p = (i * 0.618 + time * 0.016) % 1;
        const angle = i * 2.399 + p * 0.9 + time * 0.008;
        const r = 50 + p * p * reach;
        const x = cx + Math.cos(angle) * r,
          y = cy + Math.sin(angle) * r * 0.75;
        ctx.globalAlpha = Math.sin(p * Math.PI) * 0.42;
        ctx.fillStyle = i % 3 === 0 ? "#d4c4ac" : "#b5c8c0";
        ctx.beginPath();
        ctx.arc(x, y, 0.5 + p * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (sprite.complete && sprite.naturalWidth) {
        const tileW = sprite.naturalWidth / 4,
          tileH = sprite.naturalHeight / 2;
        for (let i = 0; i < 28; i++) {
          const p = (i / 28 + time * 0.029) % 1;
          const angle = i * 2.399 + p * 1.65 + time * 0.025;
          const r = 105 + Math.pow(p, 1.9) * reach;
          const x = cx + Math.cos(angle) * r,
            y = cy + Math.sin(angle) * r * 0.73;
          const h = (34 + Math.pow(p, 2) * 270) * (width < 600 ? 0.68 : 1);
          const w = (h * tileW) / tileH;
          const tile = i % 8;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.cos(angle) * 0.11);
          ctx.globalAlpha = Math.min(0.53, Math.sin(p * Math.PI) * 0.57);
          ctx.drawImage(
            sprite,
            (tile % 4) * tileW,
            Math.floor(tile / 4) * tileH,
            tileW,
            tileH,
            -w / 2,
            -h / 2,
            w,
            h,
          );
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };
    const animate = (stamp: number) => {
      if (disposed) return;
      const moving = active && !paused && !media.matches && !document.hidden;
      if (moving && previous) elapsed += Math.min(stamp - previous, 50) / 1000;
      previous = stamp;
      if (moving) {
        paint(elapsed);
        frame = window.requestAnimationFrame(animate);
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const refresh = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      paint(elapsed);
      if (active && !paused && !media.matches && !document.hidden)
        frame = requestAnimationFrame(animate);
    };
    media.addEventListener("change", refresh);
    document.addEventListener("visibilitychange", refresh);
    sprite.onload = refresh;
    resize();
    paint(7);
    refresh();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener("change", refresh);
      document.removeEventListener("visibilitychange", refresh);
      sprite.onload = null;
    };
  }, [active, paused]);
  return (
    <div
      className={"vortex-scene" + (active ? " is-active" : " is-distant")}
      aria-hidden="true"
    >
      <div className="vortex-painting" />
      <div className="vortex-aura" />
      <canvas ref={canvas} />
      <div className="vortex-shade" />
      <div className="film-grain" />
    </div>
  );
}
