-- ============================================================
-- MIGRASI: Kolom ID Member di pesanan
-- Jalankan file ini KALAU database lu udah pernah dibuat sebelumnya.
-- ============================================================

alter table orders add column if not exists member_id text;
