"use client";

import { useEffect, useRef } from "react";

// Floating sparkles/hearts over the hero that drift away from the cursor
// for a parallax feel. Each child wrapper carries a data-depth factor; the
// inner span keeps its own sparkle/drift CSS animation.
const DECOR = [
  { depth: 18, className: "absolute left-6 top-12 text-3xl text-rose/40", inner: "sparkle", glyph: "✦" },
  { depth: 30, className: "absolute right-8 top-28 text-4xl text-rose/30", inner: "sparkle sparkle-delay-1", glyph: "♡" },
  { depth: 24, className: "absolute bottom-10 left-1/2 text-3xl text-rose/30", inner: "sparkle sparkle-delay-2", glyph: "✧" },
  { depth: 14, className: "absolute bottom-6 left-[12%] text-2xl text-rose/45", inner: "drift-up", glyph: "♡" },
  { depth: 22, className: "absolute bottom-2 left-[58%] text-xl text-rose/35", inner: "drift-up drift-delay-1", glyph: "♡" },
  { depth: 34, className: "absolute bottom-8 left-[85%] text-2xl text-rose/40", inner: "drift-up drift-delay-2", glyph: "✿" },
];

export function HeroDecor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = ref.current;
    if (!container) return;

    const layers =
      container.querySelectorAll<HTMLElement>("[data-depth]");

    function onMove(event: PointerEvent) {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      for (const layer of layers) {
        const depth = Number(layer.dataset.depth);
        layer.style.transform = `translate(${(-x * depth).toFixed(1)}px, ${(-y * depth).toFixed(1)}px)`;
      }
    }

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="blob absolute -left-20 top-10 h-72 w-72 rounded-full bg-blush/60" />
      <div className="blob blob-delay absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-rose/15" />
      {DECOR.map((item, index) => (
        <span key={index} data-depth={item.depth} className={item.className}>
          <span className={`inline-block ${item.inner}`}>{item.glyph}</span>
        </span>
      ))}
    </div>
  );
}
