import { Hono } from 'hono'
import type { HonoEnv } from '../index.ts'
import { updateRecordImages, getRecord } from '../db/schema.ts'

export const imagesRoute = new Hono<HonoEnv>()

// ============================================================
// POST /api/images/upload
// ============================================================
// FormData: record_id, type (before|after), file
imagesRoute.post('/upload', async (c) => {
  try {
    const body = await c.req.parseBody()
    const recordId = body['record_id']
    const type = body['type']
    const file = body['file']

    if (
      typeof recordId !== 'string' ||
      typeof type !== 'string' ||
      !recordId ||
      !type ||
      !file ||
      typeof file === 'string'
    ) {
      return c.json(
        { success: false, error: 'record_id, type, and file are required' },
        400
      )
    }

    if (type !== 'before' && type !== 'after') {
      return c.json(
        { success: false, error: 'type must be "before" or "after"' },
        400
      )
    }

    // ファイルサイズチェック (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return c.json(
        { success: false, error: 'File size must be under 10MB' },
        400
      )
    }

    // R2 にアップロード
    const ext = file.name.split('.').pop() || 'webp'
    const key = `records/${recordId}/${type}.${ext}`

    await c.env.BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'image/webp',
      },
    })

    // D1 の画像キーを更新
    const record = (await getRecord(c.env.DB, recordId).first()) as Record<
      string,
      unknown
    > | null
    if (record) {
      const beforeKey =
        type === 'before' ? key : (record.before_image_key as string)
      const afterKey =
        type === 'after' ? key : (record.after_image_key as string)
      await updateRecordImages(c.env.DB, recordId, beforeKey, afterKey).run()
    }

    return c.json({ success: true, data: { key } }, 201)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// GET /api/images/:key+
// ============================================================
// R2 から画像を取得して返す
imagesRoute.get('/*', async (c) => {
  try {
    // /api/images/ より後のパス全体をキーとして使用
    const key = c.req.path.replace('/api/images/', '')
    if (!key) {
      return c.json({ success: false, error: 'Image key is required' }, 400)
    }

    const object = await c.env.BUCKET.get(key)
    if (!object) {
      return c.json({ success: false, error: 'Image not found' }, 404)
    }

    const headers = new Headers()
    headers.set(
      'Content-Type',
      object.httpMetadata?.contentType || 'image/webp'
    )
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new Response(object.body, { headers })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})
