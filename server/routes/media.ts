import { Hono } from 'hono'
import type { HonoEnv } from '../index.ts'
import {
  listMediaByRecord,
  insertMedia,
  deleteMedia,
  getMedia,
  countMediaByRecord,
  getRecord,
  updateRecordRepresentative,
  clearRepresentativeByMediaId,
} from '../db/schema.ts'

const MAX_PHOTOS = 5
const MAX_VIDEOS = 5
const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

export const mediaRoute = new Hono<HonoEnv>()

// ============================================================
// POST /api/media/upload
// ============================================================
mediaRoute.post('/upload', async (c) => {
  try {
    const body = await c.req.parseBody()
    const recordId = body['record_id']
    const mediaType = body['media_type']
    const file = body['file']

    if (
      typeof recordId !== 'string' || !recordId ||
      typeof mediaType !== 'string' || !mediaType ||
      !file || typeof file === 'string'
    ) {
      return c.json(
        { success: false, error: 'record_id, media_type, and file are required' },
        400
      )
    }

    if (mediaType !== 'photo' && mediaType !== 'video') {
      return c.json({ success: false, error: 'media_type must be "photo" or "video"' }, 400)
    }

    // Size check
    const maxSize = mediaType === 'photo' ? MAX_PHOTO_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      const limitMb = maxSize / (1024 * 1024)
      return c.json(
        { success: false, error: `ファイルサイズは${limitMb}MB以下にしてください` },
        400
      )
    }

    // Count check
    const maxCount = mediaType === 'photo' ? MAX_PHOTOS : MAX_VIDEOS
    const countResult = await countMediaByRecord(c.env.DB, recordId, mediaType).first() as Record<string, unknown> | null
    const currentCount = (countResult?.count as number) ?? 0
    if (currentCount >= maxCount) {
      const label = mediaType === 'photo' ? '写真' : '動画'
      return c.json(
        { success: false, error: `${label}は${maxCount}枚までアップロード可能です` },
        400
      )
    }

    // Upload to R2
    const id = crypto.randomUUID()
    const ext = file.name.split('.').pop() || (mediaType === 'photo' ? 'webp' : 'mp4')
    const storageKey = `records/${recordId}/media/${id}.${ext}`

    await c.env.BUCKET.put(storageKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || (mediaType === 'photo' ? 'image/webp' : 'video/mp4'),
      },
    })

    // Insert DB record
    await insertMedia(
      c.env.DB,
      id,
      recordId,
      mediaType,
      currentCount,
      storageKey,
      file.size,
      file.type || ''
    ).run()

    return c.json({
      success: true,
      data: {
        id,
        record_id: recordId,
        media_type: mediaType,
        sort_order: currentCount,
        storage_key: storageKey,
        file_size: file.size,
        mime_type: file.type || '',
      },
    }, 201)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// GET /api/media/:recordId
// ============================================================
mediaRoute.get('/:recordId', async (c) => {
  const recordId = c.req.param('recordId')
  try {
    const { results } = await listMediaByRecord(c.env.DB, recordId).all()
    return c.json({ success: true, data: results })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// PUT /api/media/:recordId/representative
// ============================================================
mediaRoute.put('/:recordId/representative', async (c) => {
  const recordId = c.req.param('recordId')
  try {
    const body = await c.req.json<{
      field: string
      media_id: string
    }>()

    if (body.field !== 'before_media_id' && body.field !== 'after_media_id') {
      return c.json(
        { success: false, error: 'field must be "before_media_id" or "after_media_id"' },
        400
      )
    }

    const record = await getRecord(c.env.DB, recordId).first()
    if (!record) {
      return c.json({ success: false, error: 'Record not found' }, 404)
    }

    // 空文字で解除
    if (body.media_id === '') {
      await updateRecordRepresentative(c.env.DB, recordId, body.field, '').run()
      return c.json({ success: true, data: { field: body.field, media_id: '' } })
    }

    // メディアの存在確認
    const media = await getMedia(c.env.DB, body.media_id).first() as Record<string, unknown> | null
    if (!media) {
      return c.json({ success: false, error: 'Media not found' }, 404)
    }

    // 写真のみ設定可能
    if (media.media_type !== 'photo') {
      return c.json(
        { success: false, error: '代表写真には写真のみ設定可能です' },
        400
      )
    }

    await updateRecordRepresentative(c.env.DB, recordId, body.field, body.media_id).run()
    return c.json({ success: true, data: { field: body.field, media_id: body.media_id } })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// DELETE /api/media/:id/delete
// ============================================================
mediaRoute.delete('/:id/delete', async (c) => {
  const id = c.req.param('id')
  try {
    const media = await getMedia(c.env.DB, id).first() as Record<string, unknown> | null
    if (!media) {
      return c.json({ success: false, error: 'Media not found' }, 404)
    }

    // Delete from R2
    const storageKey = media.storage_key as string
    if (storageKey) {
      await c.env.BUCKET.delete(storageKey)
    }

    // Clear representative references if this media was set as one
    await clearRepresentativeByMediaId(c.env.DB, id).run()

    // Delete from DB
    await deleteMedia(c.env.DB, id).run()
    return c.json({ success: true, data: { id } })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})
