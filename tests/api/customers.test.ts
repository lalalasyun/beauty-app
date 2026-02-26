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

describe('Customers API', () => {
  let env: ReturnType<typeof createEnv>

  beforeEach(() => {
    env = createEnv()
  })

  // ============================================================
  // POST /api/customers
  // ============================================================
  describe('POST /api/customers', () => {
    it('顧客を新規作成できる', async () => {
      const res = await app.fetch(
        req('POST', '/api/customers', { name: '山田花子', name_kana: 'やまだはなこ' }),
        env
      )
      expect(res.status).toBe(201)

      const json = await res.json() as { success: boolean; data: { name: string; name_kana: string } }
      expect(json.success).toBe(true)
      expect(json.data.name).toBe('山田花子')
      expect(json.data.name_kana).toBe('やまだはなこ')
    })

    it('名前が空の場合400エラーを返す', async () => {
      const res = await app.fetch(
        req('POST', '/api/customers', { name: '' }),
        env
      )
      expect(res.status).toBe(400)

      const json = await res.json() as { success: boolean; error: string }
      expect(json.success).toBe(false)
      expect(json.error).toContain('Name is required')
    })

    it('name_kana が省略可能', async () => {
      const res = await app.fetch(
        req('POST', '/api/customers', { name: '鈴木太郎' }),
        env
      )
      expect(res.status).toBe(201)

      const json = await res.json() as { success: boolean; data: { name_kana: string } }
      expect(json.data.name_kana).toBe('')
    })
  })

  // ============================================================
  // GET /api/customers
  // ============================================================
  describe('GET /api/customers', () => {
    it('空の顧客一覧を返す', async () => {
      const res = await app.fetch(req('GET', '/api/customers'), env)
      expect(res.status).toBe(200)

      const json = await res.json() as { success: boolean; data: unknown[] }
      expect(json.success).toBe(true)
      expect(json.data).toEqual([])
    })

    it('作成した顧客が一覧に表示される', async () => {
      await app.fetch(
        req('POST', '/api/customers', { name: '山田花子' }),
        env
      )
      await app.fetch(
        req('POST', '/api/customers', { name: '田中一郎' }),
        env
      )

      const res = await app.fetch(req('GET', '/api/customers'), env)
      const json = await res.json() as { data: unknown[] }
      expect(json.data).toHaveLength(2)
    })

    it('名前で検索できる', async () => {
      await app.fetch(
        req('POST', '/api/customers', { name: '山田花子' }),
        env
      )
      await app.fetch(
        req('POST', '/api/customers', { name: '田中一郎' }),
        env
      )

      const res = await app.fetch(
        req('GET', '/api/customers?search=山田'),
        env
      )
      const json = await res.json() as { data: { name: string }[] }
      expect(json.data).toHaveLength(1)
      expect(json.data[0].name).toBe('山田花子')
    })
  })

  // ============================================================
  // GET /api/customers/:id
  // ============================================================
  describe('GET /api/customers/:id', () => {
    it('顧客詳細を取得できる', async () => {
      const createRes = await app.fetch(
        req('POST', '/api/customers', { name: '山田花子' }),
        env
      )
      const created = await createRes.json() as { data: { id: string } }

      const res = await app.fetch(
        req('GET', `/api/customers/${created.data.id}`),
        env
      )
      expect(res.status).toBe(200)

      const json = await res.json() as { data: { name: string; record_count: number } }
      expect(json.data.name).toBe('山田花子')
      expect(json.data.record_count).toBe(0)
    })

    it('存在しないIDは404を返す', async () => {
      const res = await app.fetch(
        req('GET', '/api/customers/nonexistent'),
        env
      )
      expect(res.status).toBe(404)
    })
  })

  // ============================================================
  // PUT /api/customers/:id
  // ============================================================
  describe('PUT /api/customers/:id', () => {
    it('顧客情報を更新できる', async () => {
      const createRes = await app.fetch(
        req('POST', '/api/customers', { name: '山田花子' }),
        env
      )
      const created = await createRes.json() as { data: { id: string } }

      const res = await app.fetch(
        req('PUT', `/api/customers/${created.data.id}`, {
          name: '山田太郎',
          name_kana: 'やまだたろう',
        }),
        env
      )
      expect(res.status).toBe(200)

      const json = await res.json() as { data: { name: string; name_kana: string } }
      expect(json.data.name).toBe('山田太郎')
      expect(json.data.name_kana).toBe('やまだたろう')
    })
  })

  // ============================================================
  // DELETE /api/customers/:id
  // ============================================================
  describe('DELETE /api/customers/:id', () => {
    it('顧客を削除できる', async () => {
      const createRes = await app.fetch(
        req('POST', '/api/customers', { name: '山田花子' }),
        env
      )
      const created = await createRes.json() as { data: { id: string } }

      const res = await app.fetch(
        req('DELETE', `/api/customers/${created.data.id}`),
        env
      )
      expect(res.status).toBe(200)

      // 削除後は一覧から消える
      const listRes = await app.fetch(req('GET', '/api/customers'), env)
      const list = await listRes.json() as { data: unknown[] }
      expect(list.data).toHaveLength(0)
    })

    it('存在しないIDは404を返す', async () => {
      const res = await app.fetch(
        req('DELETE', '/api/customers/nonexistent'),
        env
      )
      expect(res.status).toBe(404)
    })
  })
})
