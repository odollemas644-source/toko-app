"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function uploadOneImage(
  supabase: SupabaseServerClient,
  file: File,
  nameHint: string
): Promise<{ url: string } | { error: string }> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${slugify(nameHint)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file);
  if (uploadErr) return { error: uploadErr.message };
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

/** Upload semua file dari input multiple, urut sesuai urutan dipilih. */
async function uploadManyImages(
  supabase: SupabaseServerClient,
  files: File[],
  nameHint: string
): Promise<{ urls: string[]; error?: string }> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const result = await uploadOneImage(supabase, file, nameHint);
    if ("error" in result) return { urls, error: result.error };
    urls.push(result.url);
  }
  return { urls };
}

export type ProductFormState = { error?: string } | undefined;

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("category_id") || "") || null;
  const description = String(formData.get("description") || "").trim() || null;
  const unit = String(formData.get("unit") || "pcs").trim();
  const price = Number(formData.get("price") || 0);
  const discountRaw = String(formData.get("discount_price") || "").trim();
  const discountPrice = discountRaw ? Number(discountRaw) : null;
  const stock = Number(formData.get("stock") || 0);
  const isActive = formData.get("is_active") === "on";
  const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name || price <= 0) {
    return { error: "Nama produk dan harga wajib diisi dengan benar." };
  }

  const { urls, error: uploadError } = await uploadManyImages(supabase, imageFiles, name);
  if (uploadError) return { error: "Gagal upload gambar: " + uploadError };

  const slug = `${slugify(name)}-${Date.now().toString(36)}`;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      category_id: categoryId,
      description,
      unit,
      price,
      discount_price: discountPrice,
      stock,
      is_active: isActive,
      image_url: urls[0] ?? null,
    })
    .select("id")
    .single();

  if (error || !product) return { error: "Gagal menyimpan produk: " + error?.message };

  if (urls.length > 0) {
    await supabase.from("product_images").insert(
      urls.map((url, idx) => ({ product_id: product.id, image_url: url, sort_order: idx }))
    );
  }

  revalidatePath("/admin/produk");
  revalidatePath("/");
  redirect("/admin/produk");
}

export async function updateProduct(
  productId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("category_id") || "") || null;
  const description = String(formData.get("description") || "").trim() || null;
  const unit = String(formData.get("unit") || "pcs").trim();
  const price = Number(formData.get("price") || 0);
  const discountRaw = String(formData.get("discount_price") || "").trim();
  const discountPrice = discountRaw ? Number(discountRaw) : null;
  const stock = Number(formData.get("stock") || 0);
  const isActive = formData.get("is_active") === "on";
  const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name || price <= 0) {
    return { error: "Nama produk dan harga wajib diisi dengan benar." };
  }

  const updates: Record<string, unknown> = {
    name,
    category_id: categoryId,
    description,
    unit,
    price,
    discount_price: discountPrice,
    stock,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };

  const { urls, error: uploadError } = await uploadManyImages(supabase, imageFiles, name);
  if (uploadError) return { error: "Gagal upload gambar: " + uploadError };

  if (urls.length > 0) {
    const { data: existing } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const startOrder = (existing?.[0]?.sort_order ?? -1) + 1;

    await supabase.from("product_images").insert(
      urls.map((url, idx) => ({ product_id: productId, image_url: url, sort_order: startOrder + idx }))
    );

    const { data: currentProduct } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", productId)
      .single();

    if (!currentProduct?.image_url) {
      updates.image_url = urls[0];
    }
  }

  const { error } = await supabase.from("products").update(updates).eq("id", productId);
  if (error) return { error: "Gagal update produk: " + error.message };

  revalidatePath("/admin/produk");
  revalidatePath(`/admin/produk/${productId}`);
  revalidatePath("/");
  redirect("/admin/produk");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/admin/produk");
  revalidatePath("/");
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: isActive }).eq("id", productId);
  revalidatePath("/admin/produk");
  revalidatePath("/");
}

/** Hapus satu gambar dari galeri. Kalau itu cover, cover dipindah ke gambar berikutnya (atau null). */
export async function deleteProductImage(imageId: string, productId: string) {
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("id", imageId)
    .single();

  await supabase.from("product_images").delete().eq("id", imageId);

  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .single();

  if (product?.image_url === image?.image_url) {
    const { data: next } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .limit(1);

    await supabase
      .from("products")
      .update({ image_url: next?.[0]?.image_url ?? null })
      .eq("id", productId);
  }

  revalidatePath(`/admin/produk/${productId}`);
  revalidatePath("/admin/produk");
  revalidatePath("/");
}

/** Jadiin salah satu gambar galeri sebagai cover/thumbnail produk. */
export async function setCoverImage(productId: string, imageUrl: string) {
  const supabase = await createClient();
  await supabase.from("products").update({ image_url: imageUrl }).eq("id", productId);
  revalidatePath(`/admin/produk/${productId}`);
  revalidatePath("/admin/produk");
  revalidatePath("/");
}
