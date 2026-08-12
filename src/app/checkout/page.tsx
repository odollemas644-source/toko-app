"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { placeOrder } from "@/app/actions/checkout";

function formatRp(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await placeOrder({
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      notes,
      items,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    clearCart();
    router.push(`/checkout/sukses?order=${result.orderNumber}`);
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-center mt-10 min-h-screen">
        <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
          Keranjang kosong, tidak ada yang bisa di-checkout.
        </p>
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
          Kembali belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32 min-h-screen">
      <header
        className="sticky top-0 z-30 px-4 py-4 flex items-center gap-3"
        style={{ background: "var(--primary)" }}
      >
        <Link href="/keranjang" className="text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-white font-display font-bold text-base">Checkout</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        <div>
          <h2 className="font-semibold text-sm mb-2">Data Pengiriman</h2>
          <div className="flex flex-col gap-2.5">
            <input
              required
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
            <input
              required
              placeholder="No. HP / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
            />
            <textarea
              required
              placeholder="Alamat lengkap"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="rounded-xl border px-3 py-2.5 text-sm outline-none resize-none"
              style={{ borderColor: "var(--border)" }}
            />
            <textarea
              placeholder="Catatan (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="rounded-xl border px-3 py-2.5 text-sm outline-none resize-none"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-sm mb-2">Ringkasan Pesanan</h2>
          <div className="rounded-2xl bg-white border p-3 flex flex-col gap-2" style={{ borderColor: "var(--border)" }}>
            {items.map((i) => (
              <div key={i.product_id} className="flex justify-between text-sm">
                <span className="line-clamp-1 pr-2">{i.name} x{i.quantity}</span>
                <span className="shrink-0">{formatRp(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold text-sm" style={{ borderColor: "var(--border)" }}>
              <span>Total</span>
              <span>{formatRp(totalPrice)}</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm rounded-lg px-3 py-2" style={{ background: "#FDECEC", color: "var(--price)" }}>
            {error}
          </p>
        )}

        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t p-4"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-3 text-white font-semibold text-sm disabled:opacity-50"
            style={{ background: "var(--accent-dark)" }}
          >
            {loading ? "Memproses..." : `Buat Pesanan · ${formatRp(totalPrice)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
