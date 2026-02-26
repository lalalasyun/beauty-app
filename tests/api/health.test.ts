import { describe, it, expect } from 'vitest'
import app from '../../server/index.ts'
import { MockD1Database } from '../helpers/mock-d1.ts'
import { MockR2Bucket } from '../helpers/mock-r2.ts'

describe('Health Check', () => {
  it('GET /api/health が正常応答を返す', async () => {
    const env = {
      DB: new MockD1Database() as unknown as D1Database,
      BUCKET: new MockR2Bucket() as unknown as R2Bucket,
    }

    const res = await app.fetch(
      new Request('http://localhost/api/health'),
      env
    )
    expect(res.status).toBe(200)

    const json = await res.json() as { status: string; timestamp: string }
    expect(json.status).toBe('ok')
    expect(json.timestamp).toBeDefined()
  })
})
