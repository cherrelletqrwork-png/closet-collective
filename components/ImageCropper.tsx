"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const MAX_OUTPUT_EDGE = 1280;
const VIEW_W = 300;

const ASPECTS: { label: string; value: number }[] = [
  { label: "Portrait 4:5", value: 4 / 5 },
  { label: "Square 1:1", value: 1 },
];

// Dependency-free crop modal: pan (drag) + zoom (slider) over a fixed-aspect
// frame, exported to a JPEG data URL via canvas. Works with mouse and touch.
export function ImageCropper({
  src,
  onCancel,
  onApply,
}: {
  src: string;
  onCancel: () => void;
  onApply: (dataUrl: string) => void;
}) {
  const [aspect, setAspect] = useState(ASPECTS[0].value);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null
  );

  const viewW = VIEW_W;
  const viewH = Math.round(VIEW_W / aspect);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);

  // Reset framing whenever the source or aspect changes.
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [src, aspect]);

  const coverScale = natural
    ? Math.max(viewW / natural.w, viewH / natural.h)
    : 1;
  const dispScale = coverScale * zoom;
  const dispW = natural ? natural.w * dispScale : viewW;
  const dispH = natural ? natural.h * dispScale : viewH;
  const maxX = Math.max(0, (dispW - viewW) / 2);
  const maxY = Math.max(0, (dispH - viewH) / 2);

  function clamp(o: { x: number; y: number }) {
    return {
      x: Math.max(-maxX, Math.min(maxX, o.x)),
      y: Math.max(-maxY, Math.min(maxY, o.y)),
    };
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setOffset(
      clamp({
        x: drag.current.ox + (e.clientX - drag.current.x),
        y: drag.current.oy + (e.clientY - drag.current.y),
      })
    );
  }
  function onPointerUp() {
    drag.current = null;
  }

  const [saving, setSaving] = useState(false);

  async function apply() {
    if (!natural) return;
    const o = clamp(offset);
    // Map the viewport rectangle back to source pixels.
    const imgLeft = viewW / 2 + o.x - dispW / 2;
    const imgTop = viewH / 2 + o.y - dispH / 2;
    let sx = (0 - imgLeft) / dispScale;
    let sy = (0 - imgTop) / dispScale;
    let sW = viewW / dispScale;
    let sH = viewH / dispScale;
    // Guard against float drift past the image edges.
    sx = Math.max(0, Math.min(sx, natural.w - sW));
    sy = Math.max(0, Math.min(sy, natural.h - sH));
    sW = Math.min(sW, natural.w - sx);
    sH = Math.min(sH, natural.h - sy);

    const outW = Math.min(Math.round(sW), MAX_OUTPUT_EDGE);
    const outH = Math.round(outW * (viewH / viewW));

    setSaving(true);
    try {
      // Decode via a fetched blob rather than an <img> element so the canvas
      // is never tainted — existing photos are remote Supabase URLs, and a
      // cross-origin <img> would block toDataURL().
      const blob = await fetch(src).then((r) => r.blob());
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no ctx");
      ctx.drawImage(bitmap, sx, sy, sW, sH, 0, 0, outW, outH);
      bitmap.close();
      onApply(canvas.toDataURL("image/jpeg", 0.85));
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-cocoa/40 p-4">
      <div className="w-full max-w-sm rounded-lg border border-blush-deep bg-white p-5 shadow-soft">
        <p className="font-script text-3xl text-rose">tidy it up</p>
        <h2 className="text-2xl font-bold text-cocoa">Crop photo</h2>

        <div className="mt-3 flex gap-2">
          {ASPECTS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => setAspect(a.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                aspect === a.value
                  ? "bg-rose text-white"
                  : "border border-rose/40 text-rose-deep hover:bg-blush-light"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div
          className="relative mx-auto mt-4 touch-none overflow-hidden rounded-md border border-blush-deep bg-ivory"
          style={{ width: viewW, height: viewH }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Crop preview"
            draggable={false}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              width: dispW,
              height: dispH,
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
            }}
          />
        </div>

        <label className="mt-4 block text-xs font-extrabold uppercase tracking-[0.16em] text-cocoa-light">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => {
              setZoom(Number(e.target.value));
              setOffset((o) => clamp(o));
            }}
            className="mt-1 w-full accent-rose"
          />
        </label>
        <p className="mt-1 text-xs font-bold text-cocoa-light">
          Drag the photo to reposition.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={apply}
            disabled={!natural || saving}
            className="flex-1 rounded-full bg-rose px-5 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-60"
          >
            {saving ? "Cropping..." : "Apply crop"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-rose/40 px-5 py-3 text-sm font-extrabold text-rose-deep"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
