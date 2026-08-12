"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProduct, toggleProductActive } from "@/app/actions/admin-products";

export default function ProductRowActions({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !active;
    setActive(next);
    startTransition(() => toggleProductActive(productId, next));
  }

  function handleDelete() {
    if (!confirm("Hapus produk ini? Tindakan tidak bisa dibatalkan.")) return;
    startTransition(() => deleteProduct(productId));
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="text-[10px] font-semibold px-2 py-1 rounded-full text-white"
        style={{ background: active ? "var(--primary)" : "#9CA3AF" }}
      >
        {active ? "Aktif" : "Nonaktif"}
      </button>
      <Link href={`/admin/produk/${productId}`} className="text-neutral-400">
        <Pencil className="w-4 h-4" />
      </Link>
      <button onClick={handleDelete} disabled={isPending} style={{ color: "var(--price)" }}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
