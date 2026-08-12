export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  unit: string;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string } | null;
  product_images?: ProductImage[];
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
};

export type CartItem = {
  product_id: string;
  name: string;
  price: number; // harga efektif (diskon kalau ada)
  unit: string;
  image_url: string | null;
  quantity: number;
  stock: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes: string | null;
  status: "pending" | "diproses" | "dikirim" | "selesai" | "dibatalkan";
  status_updated_at: string;
  subtotal: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};
