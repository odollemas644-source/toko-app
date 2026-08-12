import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle2 className="w-16 h-16 mb-4" style={{ color: "var(--primary)" }} />
      <h1 className="font-display font-bold text-xl mb-1">Pesanan Berhasil Dibuat!</h1>
      <p className="text-sm mb-1" style={{ color: "var(--ink-muted)" }}>
        Nomor pesanan kamu:
      </p>
      <p className="font-mono font-bold text-sm mb-6 px-3 py-1.5 rounded-lg" style={{ background: "var(--sage)" }}>
        {order}
      </p>
      <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--ink-muted)" }}>
        Tim toko akan segera menghubungi kamu lewat WhatsApp untuk konfirmasi pesanan.
      </p>
      <Link
        href="/"
        className="rounded-full px-6 py-3 text-white font-semibold text-sm"
        style={{ background: "var(--primary)" }}
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
