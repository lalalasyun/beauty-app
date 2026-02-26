import { describe, it, expect, beforeEach } from 'vitest'
import app from '../../server/index.ts'
import { MockD1Database } from '../helpers/mock-d1.ts'
import { MockR2Bucket } from '../helpers/mock-r2.ts'

function createEnv() {
  return {
    DB: new MockD1Database() as unknown as D1Database,
    BUCKET: new MockR2Bucket() as unknown as R2Bucket,
  }
}

function req(method: string, path: string, body?: unknown) {
  const init: RequestInit = { method }
  if (body) {
    init.body = JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  return new Request(`http://localhost${path}`, init)
}

describe('Records API', () => {
  let env: ReturnType<typeof createEnv>
  let customerId: string

  beforeEach(async () => {
    env = createEnv()
    // テスト用顧客を作成
    const res = await app.fetch(
      req('POST', '/api/customers', { name: 'テスト顧客' }),
      env
    )
    const json = await res.json() as { data: { id: string } }
    customerId = json.data.id
  })

  // ============================================================
  // POST /api/records
  // ============================================================
  describe('POST /api/records', () => {
    it('施術記録を新規作成できる', async () => {
      const res = await app.fetch(
        req('POST', '/api/records', {
          customer_id: customerId,
          treatment_date: '2025-03-15',
          memo: 'カラー＋トリートメント',
        }),
        env
      )
      expect(res.status).toBe(201)

      const json = await res.json() as { success: boolean; data: { customer_id: string; treatment_date: string; memo: string } }
      expect(json.success).toBe(true)
      expect(json.data.customer_id).toBe(customerId)
      expect(json.data.treatment_date).toBe('2025-03-15')
      expect(json.data.memo).toBe('カラー＋トリートメント')
    })

    it('customer_id が無い場合400エラーを返す', async () => {
      const res = await app.fetch(
        req('POST', '/api/records', {
          treatment_date: '2025-03-15',
        }),
        env
      )
      expect(res.status).toBe(400)
    })

    it('treatment_date が無い場合400エラーを返す', async () => {
      const res = await app.fetch(
        req('POST', '/api/records', {
          customer_id: customerId,
        }),
        env
      )
      expect(res.status).toBe(400)
    })
  })

  // ============================================================
  // GET /api/records?customer_id=xxx
  // ============================================================
  describe('GET /api/records', () => {
    it('customer_id なしは400エラー', async () => {
      const res = await app.fetch(req('GET', '/api/records'), env)
      expect(res.status).toBe(400)
    })

    it('顧客の施術記録一覧を取得できる', async () => {
      await app.fetch(
        req('POST', '/api/records', {
          customer_id: customerId,
          treatment_date: '2025-01-10',
          memo: '1回目',
        }),
        env
      )
      await app.fetch(
        req('POST', '/api/records', {
          customer_id: customerId,
          treatment_date: '2025-02-15',
          memo: '2回目',
        }),
        env
      )

      const res = await app.fetch(
        req('GET', `/api/records?customer_id=${customerId}`),
        env
      )
      const json = await res.json() as { data: { treatment_date: string }[] }
      expect(json.data).toHaveLength(2)
      // 日付降順
      expect(json.data[0].treatment_date).toBe('2025-02-15')
      expect(json.data[1].treatment_date).toBe('2025-01-10')
    })
  })

  // ============================================================
  // GET /api/records/:id
  // ============================================================
  describe('GET /api/records/:id', () => {
    it('施術記録詳細を取得できる', async () => {
      const createRes = await app.fetch(
        req('POST', '/api/records', {
          customer_id: customerId,
          treatment_date: '2025-03-15',
          memo: 'メモ',
        }),
        env
      )
      const created = await createRes.json() as { data: { id: string } }

      const res = await app.fetch(
        req('GET', `/api/records/${created.data.id}`),
        env
      )
      expect(res.status).toBe(200)

      const json = await res.json() as { data: { memo: string } }
      expect(json.data.memo).toBe('メモ')
    })

    it('存在しないIDは404を返す', async () => {
      const res = await app.fetch(
        req('GET', '/api/records/nonexistent'),
        env
      )
      expect(res.status).toBe(404)
    })
  })

  // ============================================================
  // PUT /api/records/:id
  // ============================================================
  describe('PUT /api/records/:id', () => {
    it('施術記録を更新できる', async () => {
      const createRes = await app.fetch(
        req('POST', '/api/records', {
          customer_id: customerId,
          treatment_date: '2025-03-15',
          memo: '元のメモ',
        }),
        env
      )
      const created = await createRes.json() as { data: { id: string } }

      const res = await app.fetch(
        req('PUT', `/api/records/${created.data.id}`, {
          memo: '更新されたメモ',
        }),
        env
      )
      expect(res.status).toBe(200)

      const json = await res.json() as { data: { memo: string } }
      expect(json.data.memo).toBe('更新されたメモ')
    })
  })

  // ============================================================
  // DELETE /api/records/:id
  // ============================================================
  describe('DELETE /api/records/:id', () => {
    it('施術記録を削除できる', async () => {
      const createRes = await app.fetch(
        req('POST', '/api/records', {
          customer_id: customerId,
          treatment_date: '2025-03-15',
          memo: '削除予定',
        }),
        env
      )
      const created = await createRes.json() as { data: { id: string } }

      const res = await app.fetch(
        req('DELETE', `/api/records/${created.data.id}`),
        env
      )
      expect(res.status).toBe(200)

      // 削除後は一覧から消える
      const listRes = await app.fetch(
        req('GET', `/api/records?customer_id=${customerId}`),
        env
      )
      const list = await listRes.json() as { data: unknown[] }
      expect(list.data).toHaveLength(0)
    })
  })
})
