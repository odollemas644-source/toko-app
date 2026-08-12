"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get("q") || "").trim();
    if (q) router.push(`/cari?q=${encodeURIComponent(q)}`);
  }

  return (
    <header
      className="sticky top-0 z-30 px-4 pt-4 pb-3"
      style={{ background: "var(--primary)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white/70 text-xs">Belanja di</p>
          <h1 className="text-white font-display font-bold text-lg leading-tight">
            Toko Segar Jaya
          </h1>
        </div>
        <Link
          href="/keranjang"
          className="relative rounded-full bg-white/15 p-2.5 active:scale-95 transition"
          aria-label="Keranjang"
        >
          <ShoppingCart className="w-5 h-5 text-white" />
          {totalItems > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              style={{ background: "var(--accent-dark)" }}
            >
              {totalItems}
            </span>
          )}
        </Link>
      </div>
      <form onSubmit={handleSearch}>
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            name="q"
            placeholder="Cari produk atau kategori..."
            className="w-full text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
      </form>
    </header>
  );
}
