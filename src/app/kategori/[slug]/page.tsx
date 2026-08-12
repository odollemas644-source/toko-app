import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category?.id ?? "")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const list = (products ?? []) as Product[];

  return (
    <div className="pb-20 min-h-screen">
      <header
        className="sticky top-0 z-30 px-4 py-4 flex items-center gap-3"
        style={{ background: "var(--primary)" }}
      >
        <Link href="/" className="text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-white font-display font-bold text-base">
          {category?.icon ? `${category.icon} ` : ""}
          {category?.name ?? "Kategori"}
        </h1>
      </header>

      <div className="p-4">
        {list.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed p-6 text-center text-sm"
            style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
          >
            Belum ada produk di kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
