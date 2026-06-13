"use client";

import { useEffect } from "react";

const GLYPHS = ["✦", "♡", "✧", "·", "✦"];

// Leaves a soft trail of sparkles behind the cursor. Desktop pointers only —
// no-op on touch devices and for reduced-motion users.
export function CursorTrail() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let last = 0;
    function onMove(event: PointerEvent) {
      const now = performance.now();
      if (now - last < 120) return;
      last = now;

      const spark = document.createElement("span");
      spark.className = "cursor-spark";
      spark.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      spark.style.left = `${event.clientX + Math.random() * 16 - 8}px`;
      spark.style.top = `${event.clientY + Math.random() * 16 - 8}px`;
      spark.style.fontSize = `${10 + Math.random() * 8}px`;
      document.body.appendChild(spark);
      spark.addEventListener("animationend", () => spark.remove());
    }

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
