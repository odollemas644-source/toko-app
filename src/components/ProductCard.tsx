"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-store";

function formatRp(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const hasDiscount =
    product.discount_price != null && product.discount_price < product.price;
  const effectivePrice = hasDiscount ? product.discount_price! : product.price;
  const pct = hasDiscount
    ? Math.round((1 - product.discount_price! / product.price) * 100)
    : 0;
  const outOfStock = product.stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price: effectivePrice,
      unit: product.unit,
      image_url: product.image_url,
      quantity: 1,
      stock: product.stock,
    });
  }

  return (
    <Link
      href={`/produk/${product.id}`}
      className="rounded-2xl bg-white overflow-hidden flex flex-col border"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="relative aspect-square bg-neutral-50">
        {hasDiscount && <div className="stamp">-{pct}%</div>}
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            🛍️
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-neutral-600">Stok habis</span>
          </div>
        )}
      </div>
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <p className="text-[13px] font-medium leading-snug line-clamp-2 min-h-[34px]">
          {product.name}
        </p>
        <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
          {product.unit}
        </p>
        <div className="mt-auto flex items-end justify-between pt-1">
          <div>
            {hasDiscount && (
              <p className="text-[10px] line-through text-neutral-400">
                {formatRp(product.price)}
              </p>
            )}
            <p className="text-sm font-bold" style={{ color: hasDiscount ? "var(--price)" : "var(--ink)" }}>
              {formatRp(effectivePrice)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="rounded-full w-7 h-7 flex items-center justify-center shrink-0 disabled:opacity-30"
            style={{ background: "var(--primary)" }}
            aria-label="Tambah ke keranjang"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </Link>
  );
}
