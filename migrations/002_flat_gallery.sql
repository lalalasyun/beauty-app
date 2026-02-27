-- ============================================================
-- フラットギャラリー + Before/After代表選択への移行
-- ============================================================
-- record_media.category は NOT NULL DEFAULT 'before' のため残置。
-- 新コードはこのカラムを無視し、代わりに treatment_records 側の
-- before_media_id / after_media_id で代表写真を管理する。

-- 1. treatment_records に代表メディアID カラムを追加
ALTER TABLE treatment_records ADD COLUMN before_media_id TEXT DEFAULT '';
ALTER TABLE treatment_records ADD COLUMN after_media_id TEXT DEFAULT '';
