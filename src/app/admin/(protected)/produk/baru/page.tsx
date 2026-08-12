import { createClient } from "@/lib/supabase/server";
import { createProduct } from "@/app/actions/admin-products";
import ProductForm from "../ProductForm";
import type { Category } from "@/lib/types";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Tambah Produk</h1>
      <ProductForm categories={(data ?? []) as Category[]} action={createProduct} />
    </div>
  );
}
