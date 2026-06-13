"use client";

import { useState } from "react";

// Photo gallery for the listing detail page: a large active image with a
// row of thumbnails beneath. Falls back to a single image when there's
// only one photo.
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const photos = images.length ? images : [];
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-blush-deep bg-white p-3 shadow-soft">
        <img
          src={current}
          alt={alt}
          className="aspect-[4/5] w-full rounded-md object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {photos.map((image, index) => (
            <button
              key={`${image.slice(0, 24)}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-md border-2 transition ${
                index === active
                  ? "border-rose"
                  : "border-blush-deep/40 hover:border-rose/60"
              }`}
              aria-label={`View photo ${index + 1}`}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
