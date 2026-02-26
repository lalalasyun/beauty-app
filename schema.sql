-- ============================================================
-- Beauty App - D1 Database Schema
-- ============================================================
-- 実行方法:
--   ローカル:     npm run db:migrate:local
--   ステージング: npm run db:migrate:staging
--   本番:         npm run db:migrate:production
-- ============================================================

-- 顧客テーブル
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kana TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 施術記録テーブル
CREATE TABLE IF NOT EXISTS treatment_records (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  treatment_date TEXT NOT NULL DEFAULT (date('now')),
  memo TEXT DEFAULT '',
  before_image_key TEXT DEFAULT '',
  after_image_key TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_records_customer ON treatment_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON treatment_records(treatment_date DESC);
