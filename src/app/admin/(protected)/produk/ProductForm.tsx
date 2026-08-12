"use client";

import { useActionState } from "react";
import type { Category, Product } from "@/lib/types";
import type { ProductFormState } from "@/app/actions/admin-products";
import ProductImageGallery from "./ProductImageGallery";

export default function ProductForm({
  categories,
  product,
  action,
}: {
  categories: Category[];
  product?: Product;
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const existingImages = product?.product_images ?? [];

  return (
    <form action={formAction} className="flex flex-col gap-3 max-w-lg">
      <div>
        <label className="text-xs font-medium mb-1 block">Nama Produk</label>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      <div>
        <label className="text-xs font-medium mb-1 block">Kategori</label>
        <select
          name="category_id"
          defaultValue={product?.category_id ?? ""}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none bg-white"
          style={{ borderColor: "var(--border)" }}
        >
          <option value="">Tanpa kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium mb-1 block">Satuan (contoh: 350ml/pcs)</label>
        <input
          name="unit"
          defaultValue={product?.unit ?? "pcs"}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium mb-1 block">Harga Normal (Rp)</label>
          <input
            name="price"
            type="number"
            min="1"
            required
            defaultValue={product?.price}
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Harga Diskon (opsional)</label>
          <input
            name="discount_price"
            type="number"
            min="0"
            defaultValue={product?.discount_price ?? ""}
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium mb-1 block">Stok</label>
        <input
          name="stock"
          type="number"
          min="0"
          required
          defaultValue={product?.stock ?? 0}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      <div>
        <label className="text-xs font-medium mb-1 block">Deskripsi</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      {product && (
        <ProductImageGallery
          productId={product.id}
          images={existingImages}
          coverUrl={product.image_url}
        />
      )}

      <div>
        <label className="text-xs font-medium mb-1 block">
          {product ? "Tambah Foto Baru ke Galeri" : "Foto Produk"} (bisa pilih lebih dari satu)
        </label>
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="w-full text-sm"
        />
        <p className="text-[11px] mt-1" style={{ color: "var(--ink-muted)" }}>
          Foto pertama yang lu upload otomatis jadi cover kalau produk belum punya foto.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={product?.is_active ?? true}
        />
        Tampilkan di toko
      </label>

      {state?.error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "#FDECEC", color: "var(--price)" }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full py-3 text-white font-semibold text-sm disabled:opacity-50 mt-2"
        style={{ background: "var(--primary)" }}
      >
        {isPending ? "Menyimpan..." : product ? "Simpan Perubahan" : "Tambah Produk"}
      </button>
    </form>
  );
}
