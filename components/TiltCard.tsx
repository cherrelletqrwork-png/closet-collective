"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

// Tilts its children in 3D toward the cursor. Mouse only — touch and
// reduced-motion users get a plain wrapper.
export function TiltCard({
  children,
  className,
  maxTilt = 7,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.transform = `perspective(800px) rotateX(${(-y * maxTilt).toFixed(2)}deg) rotateY(${(x * maxTilt).toFixed(2)}deg) translateY(-4px)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={`tilt-card ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
