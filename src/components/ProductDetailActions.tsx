"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export default function ProductDetailActions({
  productId,
  name,
  price,
  unit,
  imageUrl,
  stock,
}: {
  productId: string;
  name: string;
  price: number;
  unit: string;
  imageUrl: string | null;
  stock: number;
}) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();
  const outOfStock = stock <= 0;

  function handleAdd() {
    addItem({
      product_id: productId,
      name,
      price,
      unit,
      image_url: imageUrl,
      quantity: qty,
      stock,
    });
    router.push("/keranjang");
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center gap-3"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="flex items-center rounded-full border"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-9 h-9 flex items-center justify-center"
          aria-label="Kurangi"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center text-sm font-semibold">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          className="w-9 h-9 flex items-center justify-center"
          aria-label="Tambah"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="flex-1 rounded-full py-3 text-white font-semibold text-sm disabled:opacity-40"
        style={{ background: "var(--primary)" }}
      >
        {outOfStock ? "Stok Habis" : "Masukkan Keranjang"}
      </button>
    </div>
  );
}
