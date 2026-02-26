/**
 * D1 モック
 *
 * Vitest で Hono API をテストするためのインメモリ D1 モック。
 * better-sqlite3 は不要。SQL パース不要のシンプルなモック。
 * ステートメントの bind/run/all/first をシミュレートする。
 */

type Row = Record<string, unknown>

interface MockStatement {
  bind(...values: unknown[]): MockStatement
  run(): Promise<{ success: boolean; meta: Record<string, unknown> }>
  all(): Promise<{ results: Row[]; success: boolean }>
  first(): Promise<Row | null>
}

export class MockD1Database {
  private tables: Map<string, Row[]> = new Map()
  private lastSql = ''
  private lastBindings: unknown[] = []

  constructor() {
    this.tables.set('customers', [])
    this.tables.set('treatment_records', [])
  }

  // テスト用ヘルパー: データを直接挿入
  seed(table: string, rows: Row[]) {
    this.tables.set(table, [...rows])
  }

  // テスト用ヘルパー: テーブルの内容を取得
  getAll(table: string): Row[] {
    return this.tables.get(table) || []
  }

  // テスト用ヘルパー: リセット
  reset() {
    this.tables.set('customers', [])
    this.tables.set('treatment_records', [])
  }

  prepare(sql: string): MockStatement {
    this.lastSql = sql
    this.lastBindings = []

    const db = this

    const stmt: MockStatement = {
      bind(...values: unknown[]) {
        db.lastBindings = values
        return stmt
      },

      async run() {
        db.executeSql(db.lastSql, db.lastBindings)
        return { success: true, meta: {} }
      },

      async all() {
        const results = db.executeSqlQuery(db.lastSql, db.lastBindings)
        return { results, success: true }
      },

      async first() {
        const results = db.executeSqlQuery(db.lastSql, db.lastBindings)
        return results[0] || null
      },
    }

    return stmt
  }

  private executeSql(sql: string, bindings: unknown[]) {
    const sqlUpper = sql.trim().toUpperCase()

    if (sqlUpper.startsWith('INSERT INTO CUSTOMERS')) {
      const customers = this.tables.get('customers')!
      customers.push({
        id: bindings[0] as string,
        name: bindings[1] as string,
        name_kana: bindings[2] as string,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } else if (sqlUpper.startsWith('INSERT INTO TREATMENT_RECORDS')) {
      const records = this.tables.get('treatment_records')!
      records.push({
        id: bindings[0] as string,
        customer_id: bindings[1] as string,
        treatment_date: bindings[2] as string,
        memo: bindings[3] as string,
        before_image_key: bindings[4] as string,
        after_image_key: bindings[5] as string,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } else if (sqlUpper.startsWith('UPDATE CUSTOMERS')) {
      const customers = this.tables.get('customers')!
      const idx = customers.findIndex((c) => c.id === bindings[0])
      if (idx >= 0) {
        customers[idx] = {
          ...customers[idx],
          name: bindings[1] as string,
          name_kana: bindings[2] as string,
          updated_at: new Date().toISOString(),
        }
      }
    } else if (sqlUpper.startsWith('UPDATE TREATMENT_RECORDS') && sqlUpper.includes('TREATMENT_DATE')) {
      const records = this.tables.get('treatment_records')!
      const idx = records.findIndex((r) => r.id === bindings[0])
      if (idx >= 0) {
        records[idx] = {
          ...records[idx],
          treatment_date: bindings[1] as string,
          memo: bindings[2] as string,
          updated_at: new Date().toISOString(),
        }
      }
    } else if (sqlUpper.startsWith('UPDATE TREATMENT_RECORDS') && sqlUpper.includes('BEFORE_IMAGE_KEY')) {
      const records = this.tables.get('treatment_records')!
      const idx = records.findIndex((r) => r.id === bindings[0])
      if (idx >= 0) {
        records[idx] = {
          ...records[idx],
          before_image_key: bindings[1] as string,
          after_image_key: bindings[2] as string,
          updated_at: new Date().toISOString(),
        }
      }
    } else if (sqlUpper.startsWith('DELETE FROM CUSTOMERS')) {
      const customers = this.tables.get('customers')!
      const idx = customers.findIndex((c) => c.id === bindings[0])
      if (idx >= 0) {
        const customerId = customers[idx].id
        customers.splice(idx, 1)
        // CASCADE: 関連する施術記録も削除
        const records = this.tables.get('treatment_records')!
        const filtered = records.filter((r) => r.customer_id !== customerId)
        this.tables.set('treatment_records', filtered)
      }
    } else if (sqlUpper.startsWith('DELETE FROM TREATMENT_RECORDS')) {
      const records = this.tables.get('treatment_records')!
      const idx = records.findIndex((r) => r.id === bindings[0])
      if (idx >= 0) records.splice(idx, 1)
    }
  }

  private executeSqlQuery(sql: string, bindings: unknown[]): Row[] {
    const sqlUpper = sql.trim().toUpperCase()

    if (sqlUpper.includes('FROM CUSTOMERS') && sqlUpper.includes('WHERE C.ID')) {
      const customer = this.tables
        .get('customers')!
        .find((c) => c.id === bindings[0])
      if (!customer) return []
      const records = this.tables
        .get('treatment_records')!
        .filter((r) => r.customer_id === customer.id)
      const latestDate = records.length
        ? records.sort((a, b) =>
            (b.treatment_date as string).localeCompare(a.treatment_date as string)
          )[0].treatment_date
        : null
      return [
        {
          ...customer,
          record_count: records.length,
          latest_treatment_date: latestDate,
        },
      ]
    }

    if (sqlUpper.includes('FROM CUSTOMERS')) {
      let customers = [...this.tables.get('customers')!]

      // 検索フィルタ
      if (bindings.length > 0 && sqlUpper.includes('LIKE')) {
        const search = (bindings[0] as string).replace(/%/g, '')
        customers = customers.filter(
          (c) =>
            (c.name as string).includes(search) ||
            (c.name_kana as string).includes(search)
        )
      }

      return customers.map((c) => {
        const records = this.tables
          .get('treatment_records')!
          .filter((r) => r.customer_id === c.id)
        const latestDate = records.length
          ? records.sort((a, b) =>
              (b.treatment_date as string).localeCompare(
                a.treatment_date as string
              )
            )[0].treatment_date
          : null
        return {
          ...c,
          record_count: records.length,
          latest_treatment_date: latestDate,
        }
      })
    }

    if (sqlUpper.includes('FROM TREATMENT_RECORDS') && sqlUpper.includes('WHERE ID')) {
      return this.tables
        .get('treatment_records')!
        .filter((r) => r.id === bindings[0])
    }

    if (sqlUpper.includes('FROM TREATMENT_RECORDS')) {
      return this.tables
        .get('treatment_records')!
        .filter((r) => r.customer_id === bindings[0])
        .sort((a, b) =>
          (b.treatment_date as string).localeCompare(a.treatment_date as string)
        )
    }

    return []
  }
}
