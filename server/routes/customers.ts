import { Hono } from 'hono'
import type { HonoEnv } from '../index.ts'
import {
  listCustomers,
  getCustomer,
  insertCustomer,
  updateCustomer,
  deleteCustomer,
} from '../db/schema.ts'

export const customersRoute = new Hono<HonoEnv>()

// ============================================================
// GET /api/customers?search=xxx
// ============================================================
customersRoute.get('/', async (c) => {
  const search = c.req.query('search')
  try {
    const stmt = listCustomers(c.env.DB, search)
    const { results } = await stmt.all()
    return c.json({ success: true, data: results })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// GET /api/customers/:id
// ============================================================
customersRoute.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const result = await getCustomer(c.env.DB, id).first()
    if (!result) {
      return c.json({ success: false, error: 'Customer not found' }, 404)
    }
    return c.json({ success: true, data: result })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// POST /api/customers
// ============================================================
customersRoute.post('/', async (c) => {
  try {
    const body = await c.req.json<{ name: string; name_kana?: string }>()

    if (!body.name || !body.name.trim()) {
      return c.json({ success: false, error: 'Name is required' }, 400)
    }

    const id = crypto.randomUUID()
    await insertCustomer(
      c.env.DB,
      id,
      body.name.trim(),
      body.name_kana?.trim() ?? ''
    ).run()

    const customer = await getCustomer(c.env.DB, id).first()
    return c.json({ success: true, data: customer }, 201)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// PUT /api/customers/:id
// ============================================================
customersRoute.put('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const existing = await getCustomer(c.env.DB, id).first()
    if (!existing) {
      return c.json({ success: false, error: 'Customer not found' }, 404)
    }

    const body = await c.req.json<{ name?: string; name_kana?: string }>()
    const name = body.name?.trim() ?? (existing as Record<string, unknown>).name as string
    const nameKana =
      body.name_kana?.trim() ?? (existing as Record<string, unknown>).name_kana as string

    await updateCustomer(c.env.DB, id, name, nameKana).run()

    const updated = await getCustomer(c.env.DB, id).first()
    return c.json({ success: true, data: updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})

// ============================================================
// DELETE /api/customers/:id
// ============================================================
customersRoute.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const existing = await getCustomer(c.env.DB, id).first()
    if (!existing) {
      return c.json({ success: false, error: 'Customer not found' }, 404)
    }

    await deleteCustomer(c.env.DB, id).run()
    return c.json({ success: true, data: { id } })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
})
