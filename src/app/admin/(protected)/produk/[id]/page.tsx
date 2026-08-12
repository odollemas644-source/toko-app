import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/actions/admin-products";
import ProductForm from "../ProductForm";
import type { Category, Product } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", id)
      .order("sort_order", { foreignTable: "product_images" })
      .single(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  if (!product) notFound();

  const boundAction = updateProduct.bind(null, id);

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Edit Produk</h1>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        product={product as Product}
        action={boundAction}
      />
    </div>
  );
}
