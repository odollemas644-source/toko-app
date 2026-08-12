"use client";

import { useRef, useState } from "react";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const list = images.length > 0 ? images : [];

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(idx);
  }

  function goTo(idx: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }

  if (list.length === 0) {
    return (
      <div className="aspect-square bg-neutral-50 flex items-center justify-center text-6xl">
        🛍️
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="aspect-square flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
      >
        {list.map((url, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={idx}
            src={url}
            alt={`${productName} ${idx + 1}`}
            className="w-full aspect-square object-cover shrink-0 snap-center"
          />
        ))}
      </div>
      {list.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {list.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Foto ${idx + 1}`}
              className="rounded-full transition-all"
              style={{
                width: idx === active ? 16 : 6,
                height: 6,
                background: idx === active ? "var(--primary)" : "rgba(255,255,255,0.8)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
