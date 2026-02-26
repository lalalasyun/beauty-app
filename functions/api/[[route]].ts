import { handle } from 'hono/cloudflare-pages'
import app from '../../server/index.ts'

// Cloudflare Pages Functions の onRequest ハンドラ
// handle() が EventContext から request/env を正しく抽出して Hono に渡す
export const onRequest = handle(app)
