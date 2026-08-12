"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const icon = String(formData.get("icon") || "").trim() || null;
  if (!name) return;

  const supabase = await createClient();
  await supabase.from("categories").insert({
    name,
    icon,
    slug: `${slugify(name)}-${Date.now().toString(36)}`,
    sort_order: 99,
  });
  revalidatePath("/admin/kategori");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status, status_updated_at: new Date().toISOString() })
    .eq("id", orderId);
  revalidatePath("/admin/pesanan");
}
