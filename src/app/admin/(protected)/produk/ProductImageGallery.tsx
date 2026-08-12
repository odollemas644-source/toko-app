"use client";

import { useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { deleteProductImage, setCoverImage } from "@/app/actions/admin-products";
import type { ProductImage } from "@/lib/types";

export default function ProductImageGallery({
  productId,
  images,
  coverUrl,
}: {
  productId: string;
  images: ProductImage[];
  coverUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  if (images.length === 0) return null;

  return (
    <div>
      <label className="text-xs font-medium mb-1 block">Galeri Foto Saat Ini</label>
      <div className="grid grid-cols-4 gap-2">
        {images.map((img) => {
          const isCover = img.image_url === coverUrl;
          return (
            <div
              key={img.id}
              className="relative aspect-square rounded-lg overflow-hidden border group"
              style={{ borderColor: isCover ? "var(--primary)" : "var(--border)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              {isCover && (
                <span
                  className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: "var(--primary)" }}
                >
                  Cover
                </span>
              )}
              <div className="absolute bottom-1 right-1 flex gap-1">
                {!isCover && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => startTransition(() => setCoverImage(productId, img.image_url))}
                    className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
                    title="Jadikan cover"
                  >
                    <Star className="w-3.5 h-3.5" style={{ color: "var(--accent-dark)" }} />
                  </button>
                )}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm("Hapus foto ini dari galeri?")) {
                      startTransition(() => deleteProductImage(img.id, productId));
                    }
                  }}
                  className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" style={{ color: "var(--price)" }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
