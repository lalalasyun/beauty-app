-- ============================================================
-- record_media テーブル再構築 + treatment_records に代表メディアID追加
-- ============================================================
-- category カラムを削除し、代わりに treatment_records 側で
-- before_media_id / after_media_id として代表写真を管理する。

-- 1. record_media テーブル作成（category なし）
CREATE TABLE IF NOT EXISTS record_media (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK(media_type IN ('photo', 'video')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  storage_key TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (record_id) REFERENCES treatment_records(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_media_record ON record_media(record_id, sort_order);

-- 2. treatment_records に代表メディアID カラムを追加
ALTER TABLE treatment_records ADD COLUMN before_media_id TEXT DEFAULT '';
ALTER TABLE treatment_records ADD COLUMN after_media_id TEXT DEFAULT '';

-- 3. 既存 before_image_key を record_media に移行
INSERT OR IGNORE INTO record_media (id, record_id, media_type, sort_order, storage_key, mime_type)
SELECT
  lower(hex(randomblob(16))),
  id,
  'photo',
  0,
  before_image_key,
  'image/webp'
FROM treatment_records
WHERE before_image_key IS NOT NULL AND before_image_key != '';

-- 4. 既存 after_image_key を record_media に移行
INSERT OR IGNORE INTO record_media (id, record_id, media_type, sort_order, storage_key, mime_type)
SELECT
  lower(hex(randomblob(16))),
  id,
  'photo',
  1,
  after_image_key,
  'image/webp'
FROM treatment_records
WHERE after_image_key IS NOT NULL AND after_image_key != '';
