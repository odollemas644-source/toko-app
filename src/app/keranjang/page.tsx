"use client";

import Link from "next/link";
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";

function formatRp(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <div className="pb-32 min-h-screen">
      <header
        className="sticky top-0 z-30 px-4 py-4 flex items-center gap-3"
        style={{ background: "var(--primary)" }}
      >
        <Link href="/" className="text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-white font-display font-bold text-base">Keranjang</h1>
      </header>

      {items.length === 0 ? (
        <div className="p-6 text-center mt-10">
          <p className="text-5xl mb-3">🛒</p>
          <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
            Keranjang kamu masih kosong.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full px-5 py-2.5 text-white text-sm font-semibold"
            style={{ background: "var(--primary)" }}
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-3 bg-white rounded-2xl p-3 border"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="w-16 h-16 rounded-xl bg-neutral-50 overflow-hidden shrink-0 flex items-center justify-center text-2xl">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  "🛍️"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                <p className="text-xs mb-1" style={{ color: "var(--ink-muted)" }}>{item.unit}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-bold text-sm" style={{ color: "var(--primary)" }}>
                    {formatRp(item.price * item.quantity)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? removeItem(item.product_id)
                          : updateQuantity(item.product_id, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded-full border flex items-center justify-center"
                      style={{ borderColor: "var(--border)" }}
                      aria-label="Kurangi"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs w-4 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-6 h-6 rounded-full border flex items-center justify-center disabled:opacity-30"
                      style={{ borderColor: "var(--border)" }}
                      aria-label="Tambah"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="w-6 h-6 flex items-center justify-center text-neutral-400"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t p-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Total</span>
            <span className="font-bold text-lg">{formatRp(totalPrice)}</span>
          </div>
          <Link
            href="/checkout"
            className="block text-center rounded-full py-3 text-white font-semibold text-sm"
            style={{ background: "var(--accent-dark)" }}
          >
            Checkout
          </Link>
        </div>
      )}
    </div>
  );
}
