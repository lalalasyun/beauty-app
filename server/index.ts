import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authMiddleware } from './middleware/auth.ts'

// Cloudflare Bindings (server-side only)
export interface Env {
  DB: D1Database
  BUCKET: R2Bucket
}
import { customersRoute } from './routes/customers.ts'
import { recordsRoute } from './routes/records.ts'
import { imagesRoute } from './routes/images.ts'

// ============================================================
// Hono App
// ============================================================
export type HonoEnv = {
  Bindings: Env
  Variables: {
    user: { id: string; email: string; name: string } | null
  }
}

const app = new Hono<HonoEnv>().basePath('/api')

// ============================================================
// Middleware
// ============================================================
app.use('*', logger())
app.use('*', cors())
app.use('*', authMiddleware)

// ============================================================
// Health check
// ============================================================
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ============================================================
// Routes
// ============================================================
app.route('/customers', customersRoute)
app.route('/records', recordsRoute)
app.route('/images', imagesRoute)

export default app
