import { Hono } from 'hono'
import type { HonoEnv } from '../index.ts'
import {
  listRecords,
  getRecord,
  insertRecord,
  updateRecord,
  deleteRecord,
  listMediaByRecord,
  deleteMediaByRecord,
} from '../db/schema.ts'

export const recordsRoute = new Hono<HonoEnv>()

// ============================================================
// GET /api/records?customer_id=xxx
// ============================================================
recordsRoute.get('/', async (c) => {
  const customerId = c.req.query('customer_id')
  if (!customerId) {
    return c.json({ success: false, error: 'customer_id is required' }, 400)
  }
  try {
    const { results } = await listRecords(c.env.DB, customerId).all()
    return c.json({ success: true, data: results })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// GET /api/records/:id
// ============================================================
recordsRoute.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const result = await getRecord(c.env.DB, id).first()
    if (!result) {
      return c.json({ success: false, error: 'Record not found' }, 404)
    }
    return c.json({ success: true, data: result })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// POST /api/records
// ============================================================
recordsRoute.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      customer_id: string
      treatment_date: string
      memo?: string
      before_image_key?: string
      after_image_key?: string
    }>()

    if (!body.customer_id) {
      return c.json({ success: false, error: 'customer_id is required' }, 400)
    }
    if (!body.treatment_date) {
      return c.json(
        { success: false, error: 'treatment_date is required' },
        400
      )
    }

    const id = crypto.randomUUID()
    await insertRecord(
      c.env.DB,
      id,
      body.customer_id,
      body.treatment_date,
      body.memo?.trim() ?? '',
      body.before_image_key ?? '',
      body.after_image_key ?? ''
    ).run()

    const record = await getRecord(c.env.DB, id).first()
    return c.json({ success: true, data: record }, 201)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// PUT /api/records/:id
// ============================================================
recordsRoute.put('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const existing = await getRecord(c.env.DB, id).first()
    if (!existing) {
      return c.json({ success: false, error: 'Record not found' }, 404)
    }

    const body = await c.req.json<{
      treatment_date?: string
      memo?: string
    }>()

    const rec = existing as Record<string, unknown>
    const treatmentDate = body.treatment_date ?? (rec.treatment_date as string)
    const memo = body.memo?.trim() ?? (rec.memo as string)

    await updateRecord(c.env.DB, id, treatmentDate, memo).run()

    const updated = await getRecord(c.env.DB, id).first()
    return c.json({ success: true, data: updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// DELETE /api/records/:id
// ============================================================
recordsRoute.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const existing = await getRecord(c.env.DB, id).first() as Record<string, unknown> | null
    if (!existing) {
      return c.json({ success: false, error: 'Record not found' }, 404)
    }

    // R2 からレガシー画像を削除
    const beforeKey = existing.before_image_key as string
    const afterKey = existing.after_image_key as string
    const deletePromises: Promise<void>[] = []
    if (beforeKey) deletePromises.push(c.env.BUCKET.delete(beforeKey))
    if (afterKey) deletePromises.push(c.env.BUCKET.delete(afterKey))

    // R2 から新メディアファイルも削除
    const { results: mediaItems } = await listMediaByRecord(c.env.DB, id).all()
    for (const item of mediaItems) {
      const key = (item as Record<string, unknown>).storage_key as string
      if (key) deletePromises.push(c.env.BUCKET.delete(key))
    }
    await Promise.all(deletePromises)

    // DB から新メディアレコードを削除（CASCADE で消えるが明示的に）
    await deleteMediaByRecord(c.env.DB, id).run()
    await deleteRecord(c.env.DB, id).run()
    return c.json({ success: true, data: { id } })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})
