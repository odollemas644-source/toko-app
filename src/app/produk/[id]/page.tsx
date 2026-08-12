import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductGallery from "@/components/ProductGallery";

export const revalidate = 0;

function formatRp(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name, slug), product_images(*)")
    .eq("id", id)
    .order("sort_order", { foreignTable: "product_images" })
    .single();

  if (!product) notFound();

  const p = product as Product;
  const hasDiscount = p.discount_price != null && p.discount_price < p.price;
  const effectivePrice = hasDiscount ? p.discount_price! : p.price;

  const galleryImages = (p.product_images && p.product_images.length > 0)
    ? p.product_images.map((img) => img.image_url)
    : p.image_url
      ? [p.image_url]
      : [];

  return (
    <div className="pb-28 min-h-screen">
      <header
        className="sticky top-0 z-30 px-4 py-4 flex items-center gap-3"
        style={{ background: "var(--primary)" }}
      >
        <Link href="/" className="text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-white font-display font-bold text-base line-clamp-1">
          Detail Produk
        </h1>
      </header>

      <ProductGallery images={galleryImages} productName={p.name} />

      <div className="p-4">
        {p.categories?.name && (
          <span
            className="inline-block text-[11px] font-medium px-2 py-1 rounded-full mb-2"
            style={{ background: "var(--sage)", color: "var(--primary-dark)" }}
          >
            {p.categories.name}
          </span>
        )}
        <h1 className="font-display font-bold text-xl leading-snug">{p.name}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>{p.unit}</p>

        <div className="mt-3 flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-sm line-through text-neutral-400">{formatRp(p.price)}</span>
          )}
          <span
            className="text-2xl font-bold"
            style={{ color: hasDiscount ? "var(--price)" : "var(--ink)" }}
          >
            {formatRp(effectivePrice)}
          </span>
        </div>

        <p className="text-sm mt-1" style={{ color: p.stock > 0 ? "var(--primary)" : "var(--price)" }}>
          {p.stock > 0 ? `Stok tersedia: ${p.stock}` : "Stok habis"}
        </p>

        {p.description && (
          <div className="mt-4">
            <h2 className="font-semibold text-sm mb-1">Deskripsi</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              {p.description}
            </p>
          </div>
        )}
      </div>

      <ProductDetailActions
        productId={p.id}
        name={p.name}
        price={effectivePrice}
        unit={p.unit}
        imageUrl={p.image_url}
        stock={p.stock}
      />
    </div>
  );
}
