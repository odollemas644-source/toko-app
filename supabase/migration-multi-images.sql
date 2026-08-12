-- ============================================================
-- MIGRASI: Multi-gambar per produk
-- Jalankan file ini KALAU lu udah pernah run schema.sql sebelumnya.
-- Kalau ini project Supabase baru, cukup run schema.sql aja (udah termasuk ini).
-- ============================================================

create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on product_images(product_id);

alter table product_images enable row level security;

drop policy if exists "public read product images" on product_images;
create policy "public read product images" on product_images
  for select using (
    exists (select 1 from products p where p.id = product_id and p.is_active = true)
  );

drop policy if exists "admin all product images" on product_images;
create policy "admin all product images" on product_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Backfill: masukin cover image yang udah ada ke tabel galeri baru
insert into product_images (product_id, image_url, sort_order)
select id, image_url, 0 from products
where image_url is not null
on conflict do nothing;
