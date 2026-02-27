-- ============================================================
-- record_media テーブル作成 + 既存データ移行
-- ============================================================
-- 既存の before_image_key / after_image_key を record_media に移行する。
-- 元カラムはそのまま残して後方互換性を維持。

-- 1. テーブル作成
CREATE TABLE IF NOT EXISTS record_media (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK(media_type IN ('photo', 'video')),
  category TEXT NOT NULL DEFAULT 'before' CHECK(category IN ('before', 'after')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  storage_key TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (record_id) REFERENCES treatment_records(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_media_record ON record_media(record_id, sort_order);

-- 2. 既存 before_image_key を移行
INSERT OR IGNORE INTO record_media (id, record_id, media_type, category, sort_order, storage_key, mime_type)
SELECT
  lower(hex(randomblob(16))),
  id,
  'photo',
  'before',
  0,
  before_image_key,
  'image/webp'
FROM treatment_records
WHERE before_image_key IS NOT NULL AND before_image_key != '';

-- 3. 既存 after_image_key を移行
INSERT OR IGNORE INTO record_media (id, record_id, media_type, category, sort_order, storage_key, mime_type)
SELECT
  lower(hex(randomblob(16))),
  id,
  'photo',
  'after',
  0,
  after_image_key,
  'image/webp'
FROM treatment_records
WHERE after_image_key IS NOT NULL AND after_image_key != '';
