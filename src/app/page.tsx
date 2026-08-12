import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: promoProducts }, { data: newProducts }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .not("discount_price", "is", null)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  const cats = (categories ?? []) as Category[];
  const promos = (promoProducts ?? []) as Product[];
  const latest = (newProducts ?? []) as Product[];

  return (
    <div className="pb-20 min-h-screen">
      <Header />
      <CategoryGrid categories={cats} />

      {promos.length > 0 && (
        <section className="px-4 mb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base">Lagi Diskon 🔥</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
            {promos.map((p) => (
              <div key={p.id} className="w-36 shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-4 mt-5">
        <h2 className="font-display font-bold text-base mb-3">Produk Terbaru</h2>
        {latest.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed p-6 text-center text-sm"
            style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
          >
            Belum ada produk. Tambahkan lewat halaman admin.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
