import { createClient } from "@/lib/supabase/server";
import { createCategory, deleteCategory } from "@/app/actions/admin-misc";
import type { Category } from "@/lib/types";
import { Trash2 } from "lucide-react";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  const categories = (data ?? []) as Category[];

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Kategori</h1>

      <form action={createCategory} className="flex gap-2 mb-6 max-w-md">
        <input
          name="icon"
          placeholder="🥦"
          maxLength={2}
          className="w-14 rounded-xl border px-2 py-2.5 text-sm text-center outline-none"
          style={{ borderColor: "var(--border)" }}
        />
        <input
          name="name"
          required
          placeholder="Nama kategori"
          className="flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)" }}
        />
        <button
          type="submit"
          className="rounded-xl px-4 text-white text-sm font-semibold"
          style={{ background: "var(--primary)" }}
        >
          Tambah
        </button>
      </form>

      <div className="rounded-2xl bg-white border divide-y max-w-md" style={{ borderColor: "var(--border)" }}>
        {categories.length === 0 && (
          <p className="p-4 text-sm" style={{ color: "var(--ink-muted)" }}>Belum ada kategori.</p>
        )}
        {categories.map((c) => (
          <div key={c.id} className="p-3 flex items-center gap-3">
            <span className="text-xl">{c.icon || "🛒"}</span>
            <span className="flex-1 text-sm font-medium">{c.name}</span>
            <form action={deleteCategory.bind(null, c.id)}>
              <button type="submit" style={{ color: "var(--price)" }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
