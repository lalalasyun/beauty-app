import type { MiddlewareHandler } from 'hono'
import type { HonoEnv } from '../index.ts'

/**
 * 認証ミドルウェア
 *
 * 現在はパススルー（認証なし）。
 * Better Auth 導入時にここを差し替えることで認証を追加可能。
 *
 * 将来の実装イメージ:
 * ```ts
 * export const authMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
 *   const session = await auth.api.getSession({ headers: c.req.raw.headers })
 *   if (!session) {
 *     return c.json({ success: false, error: 'Unauthorized' }, 401)
 *   }
 *   c.set('user', { id: session.user.id, email: session.user.email, name: session.user.name })
 *   await next()
 * }
 * ```
 */
export const authMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  // パススルー: 全リクエストを許可、user は null
  c.set('user', null)
  await next()
}
