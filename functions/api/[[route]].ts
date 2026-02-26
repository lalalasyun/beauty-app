import app from '../../server/index.ts'

// Cloudflare Pages Functions の onRequest ハンドラ
// 全ての /api/* リクエストを Hono アプリにルーティング
export const onRequest = app.fetch
