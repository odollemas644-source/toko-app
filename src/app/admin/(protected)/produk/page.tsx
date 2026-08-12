import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ProductRowActions from "./ProductRowActions";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-xl">Produk</h1>
        <Link
          href="/admin/produk/baru"
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-white text-sm font-semibold"
          style={{ background: "var(--primary)" }}
        >
          <Plus className="w-4 h-4" /> Tambah
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Belum ada produk.</p>
      ) : (
        <div className="rounded-2xl bg-white border divide-y" style={{ borderColor: "var(--border)" }}>
          {products.map((p) => (
            <div key={p.id} className="p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-neutral-50 shrink-0 overflow-hidden flex items-center justify-center">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  "🛍️"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                  {p.categories?.name ?? "Tanpa kategori"} · Stok {p.stock}
                </p>
              </div>
              <p className="text-sm font-bold shrink-0">Rp{Number(p.price).toLocaleString("id-ID")}</p>
              <ProductRowActions productId={p.id} isActive={p.is_active} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
