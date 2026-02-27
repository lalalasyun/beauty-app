/**
 * D1 クエリヘルパー
 *
 * D1 は Cloudflare の SQLite ベースサーバーレスDB。
 * Prepared statements でSQLインジェクションを防ぐ。
 */

// ============================================================
// Customers
// ============================================================

export function listCustomers(db: D1Database, search?: string) {
  if (search && search.trim()) {
    return db
      .prepare(
        `SELECT c.*,
           COUNT(r.id) as record_count,
           MAX(r.treatment_date) as latest_treatment_date
         FROM customers c
         LEFT JOIN treatment_records r ON r.customer_id = c.id
         WHERE c.name LIKE ?1 OR c.name_kana LIKE ?1
         GROUP BY c.id
         ORDER BY c.updated_at DESC`
      )
      .bind(`%${search.trim()}%`)
  }
  return db.prepare(
    `SELECT c.*,
       COUNT(r.id) as record_count,
       MAX(r.treatment_date) as latest_treatment_date
     FROM customers c
     LEFT JOIN treatment_records r ON r.customer_id = c.id
     GROUP BY c.id
     ORDER BY c.updated_at DESC`
  )
}

export function getCustomer(db: D1Database, id: string) {
  return db
    .prepare(
      `SELECT c.*,
         COUNT(r.id) as record_count,
         MAX(r.treatment_date) as latest_treatment_date
       FROM customers c
       LEFT JOIN treatment_records r ON r.customer_id = c.id
       WHERE c.id = ?1
       GROUP BY c.id`
    )
    .bind(id)
}

export function insertCustomer(
  db: D1Database,
  id: string,
  name: string,
  nameKana: string
) {
  return db
    .prepare(
      `INSERT INTO customers (id, name, name_kana) VALUES (?1, ?2, ?3)`
    )
    .bind(id, name, nameKana)
}

export function updateCustomer(
  db: D1Database,
  id: string,
  name: string,
  nameKana: string
) {
  return db
    .prepare(
      `UPDATE customers SET name = ?2, name_kana = ?3, updated_at = datetime('now') WHERE id = ?1`
    )
    .bind(id, name, nameKana)
}

export function deleteCustomer(db: D1Database, id: string) {
  return db.prepare(`DELETE FROM customers WHERE id = ?1`).bind(id)
}

// ============================================================
// Treatment Records
// ============================================================

export function listRecords(db: D1Database, customerId: string) {
  return db
    .prepare(
      `SELECT tr.*,
         COALESCE(bm.storage_key, '') as before_media_storage_key,
         COALESCE(am.storage_key, '') as after_media_storage_key
       FROM treatment_records tr
       LEFT JOIN record_media bm ON bm.id = tr.before_media_id
       LEFT JOIN record_media am ON am.id = tr.after_media_id
       WHERE tr.customer_id = ?1
       ORDER BY tr.treatment_date DESC, tr.created_at DESC`
    )
    .bind(customerId)
}

export function getRecord(db: D1Database, id: string) {
  return db
    .prepare(`SELECT * FROM treatment_records WHERE id = ?1`)
    .bind(id)
}

export function insertRecord(
  db: D1Database,
  id: string,
  customerId: string,
  treatmentDate: string,
  memo: string,
  beforeImageKey: string,
  afterImageKey: string
) {
  return db
    .prepare(
      `INSERT INTO treatment_records (id, customer_id, treatment_date, memo, before_image_key, after_image_key)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
    .bind(id, customerId, treatmentDate, memo, beforeImageKey, afterImageKey)
}

export function updateRecord(
  db: D1Database,
  id: string,
  treatmentDate: string,
  memo: string
) {
  return db
    .prepare(
      `UPDATE treatment_records
       SET treatment_date = ?2, memo = ?3, updated_at = datetime('now')
       WHERE id = ?1`
    )
    .bind(id, treatmentDate, memo)
}

export function updateRecordImages(
  db: D1Database,
  id: string,
  beforeImageKey: string,
  afterImageKey: string
) {
  return db
    .prepare(
      `UPDATE treatment_records
       SET before_image_key = ?2, after_image_key = ?3, updated_at = datetime('now')
       WHERE id = ?1`
    )
    .bind(id, beforeImageKey, afterImageKey)
}

export function deleteRecord(db: D1Database, id: string) {
  return db
    .prepare(`DELETE FROM treatment_records WHERE id = ?1`)
    .bind(id)
}

export function updateRecordRepresentative(
  db: D1Database,
  id: string,
  field: 'before_media_id' | 'after_media_id',
  mediaId: string
) {
  const sql =
    field === 'before_media_id'
      ? `UPDATE treatment_records SET before_media_id = ?2, updated_at = datetime('now') WHERE id = ?1`
      : `UPDATE treatment_records SET after_media_id = ?2, updated_at = datetime('now') WHERE id = ?1`
  return db.prepare(sql).bind(id, mediaId)
}

export function clearRepresentativeByMediaId(
  db: D1Database,
  mediaId: string
) {
  return db
    .prepare(
      `UPDATE treatment_records
       SET before_media_id = CASE WHEN before_media_id = ?1 THEN '' ELSE before_media_id END,
           after_media_id = CASE WHEN after_media_id = ?1 THEN '' ELSE after_media_id END,
           updated_at = datetime('now')
       WHERE before_media_id = ?1 OR after_media_id = ?1`
    )
    .bind(mediaId)
}

// ============================================================
// Record Media
// ============================================================

export function listMediaByRecord(db: D1Database, recordId: string) {
  return db
    .prepare(
      `SELECT * FROM record_media
       WHERE record_id = ?1
       ORDER BY sort_order, created_at`
    )
    .bind(recordId)
}

export function insertMedia(
  db: D1Database,
  id: string,
  recordId: string,
  mediaType: string,
  sortOrder: number,
  storageKey: string,
  fileSize: number,
  mimeType: string
) {
  return db
    .prepare(
      `INSERT INTO record_media (id, record_id, media_type, sort_order, storage_key, file_size, mime_type)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
    )
    .bind(id, recordId, mediaType, sortOrder, storageKey, fileSize, mimeType)
}

export function deleteMedia(db: D1Database, id: string) {
  return db.prepare(`DELETE FROM record_media WHERE id = ?1`).bind(id)
}

export function getMedia(db: D1Database, id: string) {
  return db.prepare(`SELECT * FROM record_media WHERE id = ?1`).bind(id)
}

export function countMediaByRecord(
  db: D1Database,
  recordId: string,
  mediaType: string
) {
  return db
    .prepare(
      `SELECT COUNT(*) as count FROM record_media
       WHERE record_id = ?1 AND media_type = ?2`
    )
    .bind(recordId, mediaType)
}

export function deleteMediaByRecord(db: D1Database, recordId: string) {
  return db
    .prepare(`DELETE FROM record_media WHERE record_id = ?1`)
    .bind(recordId)
}
