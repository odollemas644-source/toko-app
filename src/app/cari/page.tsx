import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();

  let results: Product[] = [];
  if (q.trim()) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .ilike("name", `%${q.trim()}%`)
      .order("created_at", { ascending: false });
    results = (data ?? []) as Product[];
  }

  return (
    <div className="pb-20 min-h-screen">
      <Header />
      <div className="p-4">
        {q.trim() ? (
          <>
            <p className="text-sm mb-3" style={{ color: "var(--ink-muted)" }}>
              {results.length} hasil untuk &quot;{q}&quot;
            </p>
            {results.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed p-6 text-center text-sm"
                style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
              >
                Produk tidak ditemukan. Coba kata kunci lain.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-center py-10" style={{ color: "var(--ink-muted)" }}>
            Ketik nama produk di kolom pencarian di atas.
          </p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
