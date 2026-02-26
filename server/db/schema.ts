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
      `SELECT * FROM treatment_records
       WHERE customer_id = ?1
       ORDER BY treatment_date DESC, created_at DESC`
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
