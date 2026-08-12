# Toko App

Aplikasi toko single-store (kayak Suzuya Store): browse produk + kategori + search,
cart & checkout, dan admin panel buat kelola produk/stok/pesanan.

Stack: **Next.js 14 (App Router) + Supabase (Postgres, Auth, Storage) + Tailwind**.

## 1. Setup Supabase

1. Buat project baru di https://supabase.com
2. Buka **SQL Editor** -> jalankan seluruh isi file `supabase/schema.sql`
   (bikin tabel `categories`, `products`, `orders`, `order_items`, storage bucket
   `product-images`, RLS policies, dan seed 5 kategori contoh).
3. Buka **Authentication -> Users** -> tambah 1 user manual (email + password)
   buat akun admin lu. Ini yang dipakai buat login ke `/admin`.
4. Ambil kredensial di **Project Settings -> API**:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY` (JANGAN di-expose ke client!)

## 2. Setup Local

```bash
cp .env.local.example .env.local
# isi 3 variable di atas
npm install
npm run dev
```

Buka `http://localhost:3000` buat toko, `http://localhost:3000/admin/login` buat admin.

## 3. Deploy ke Vercel

1. Push project ini ke GitHub repo.
2. Import ke Vercel, tambahin 3 environment variable yang sama di Project Settings.
3. Deploy.

## Struktur Fitur

**Customer-facing:**
- `/` -- home: kategori + promo diskon + produk terbaru
- `/kategori/[slug]` -- listing produk per kategori
- `/produk/[id]` -- detail produk + tambah ke keranjang
- `/cari` -- search produk
- `/keranjang` -- cart (disimpan di localStorage browser)
- `/checkout` -- form data pengiriman -> submit order ke Supabase
- `/pesanan` -- cek status pesanan pakai nomor HP

**Admin (`/admin`, wajib login):**
- Dashboard -- ringkasan produk, stok menipis, pesanan pending
- Produk -- CRUD lengkap + upload foto + toggle aktif/nonaktif
- Kategori -- tambah/hapus kategori
- Pesanan -- lihat semua pesanan masuk + update status (pending -> diproses -> dikirim -> selesai)

## Catatan

- Belum ada payment gateway -- checkout saat ini model "pesan dulu, bayar manual/COD/transfer
  dikonfirmasi lewat WhatsApp". Kalau mau nambah Midtrans/Xendit nanti gampang, tinggal
  sisipkan step pembayaran sebelum `placeOrder()` di `src/app/actions/checkout.ts`.
- Cart pakai localStorage (bukan tabel DB) biar ringan -- customer gak perlu akun buat belanja.
- Stok otomatis berkurang begitu order dibuat (lewat fungsi `decrement_stock` di Postgres).
