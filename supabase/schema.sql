-- ============================================================
-- SCHEMA: Toko App (single-store grocery/retail)
-- Jalankan file ini di Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- CATEGORIES ----------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text,               -- emoji, contoh: '🥦'
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS ----------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  unit text not null default 'pcs',        -- contoh: '350ML / PCS'
  price numeric(12,2) not null,
  discount_price numeric(12,2),            -- null kalau tidak diskon
  stock int not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active on products(is_active);

-- ---------- PRODUCT IMAGES (galeri, banyak gambar per produk) ----------
-- products.image_url tetap dipakai sebagai cover/thumbnail (buat card & list admin).
-- Tabel ini nyimpen SEMUA gambar (termasuk cover) buat galeri di halaman detail.
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on product_images(product_id);

-- ---------- ORDERS ----------
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  notes text,
  status text not null default 'pending',  -- pending | diproses | dikirim | selesai | dibatalkan
  subtotal numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- ---------- ORDER ITEMS ----------
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null,
  quantity int not null,
  line_total numeric(12,2) not null
);

-- ---------- STOCK HELPER ----------
create or replace function decrement_stock(p_product_id uuid, p_qty int)
returns void as $$
begin
  update products set stock = greatest(stock - p_qty, 0), updated_at = now()
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY
-- Publik: boleh baca kategori & produk aktif, boleh insert order (checkout)
-- Admin (login lewat Supabase Auth): full akses
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "public read categories" on categories
  for select using (true);

create policy "public read active products" on products
  for select using (is_active = true);

create policy "public read product images" on product_images
  for select using (
    exists (select 1 from products p where p.id = product_id and p.is_active = true)
  );

create policy "admin all product images" on product_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public insert orders" on orders
  for insert with check (true);

create policy "public insert order items" on order_items
  for insert with check (true);

create policy "admin all categories" on categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin all products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin read orders" on orders
  for select using (auth.role() = 'authenticated');

create policy "admin update orders" on orders
  for update using (auth.role() = 'authenticated');

create policy "admin read order items" on order_items
  for select using (auth.role() = 'authenticated');

-- ---------- STORAGE (gambar produk) ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "admin upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "admin update product images" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "admin delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ---------- SEED DATA (contoh, boleh dihapus) ----------
insert into categories (name, slug, icon, sort_order) values
  ('Produk Segar', 'produk-segar', '🥦', 1),
  ('Makanan', 'makanan', '🍜', 2),
  ('Minuman', 'minuman', '🥤', 3),
  ('Perawatan Pribadi', 'perawatan-pribadi', '🧴', 4),
  ('Pet Food', 'pet-food', '🐾', 5)
on conflict (slug) do nothing;
