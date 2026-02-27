import type { ApiResponse, Customer, CustomerWithStats, TreatmentRecord, RecordMedia } from '@/types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!json.success) {
    throw new Error(json.error ?? 'Unknown API error')
  }
  return json.data as T
}

// ============================================================
// Customers
// ============================================================

export async function fetchCustomers(search?: string): Promise<CustomerWithStats[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<CustomerWithStats[]>(`/customers${params}`)
}

export async function fetchCustomer(id: string): Promise<CustomerWithStats> {
  return request<CustomerWithStats>(`/customers/${id}`)
}

export async function createCustomer(data: {
  name: string
  name_kana?: string
}): Promise<Customer> {
  return request<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCustomer(
  id: string,
  data: { name?: string; name_kana?: string }
): Promise<Customer> {
  return request<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCustomer(id: string): Promise<void> {
  await request(`/customers/${id}`, { method: 'DELETE' })
}

// ============================================================
// Records
// ============================================================

export async function fetchRecords(customerId: string): Promise<TreatmentRecord[]> {
  return request<TreatmentRecord[]>(`/records?customer_id=${customerId}`)
}

export async function fetchRecord(id: string): Promise<TreatmentRecord> {
  return request<TreatmentRecord>(`/records/${id}`)
}

export async function createRecord(data: {
  customer_id: string
  treatment_date: string
  memo?: string
}): Promise<TreatmentRecord> {
  return request<TreatmentRecord>('/records', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateRecord(
  id: string,
  data: { treatment_date?: string; memo?: string }
): Promise<TreatmentRecord> {
  return request<TreatmentRecord>(`/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteRecord(id: string): Promise<void> {
  await request(`/records/${id}`, { method: 'DELETE' })
}

// ============================================================
// Images
// ============================================================

export async function uploadImage(
  recordId: string,
  type: 'before' | 'after',
  file: File
): Promise<{ key: string }> {
  const formData = new FormData()
  formData.append('record_id', recordId)
  formData.append('type', type)
  formData.append('file', file)

  const res = await fetch(`${BASE}/images/upload`, {
    method: 'POST',
    body: formData,
  })
  const json = (await res.json()) as ApiResponse<{ key: string }>
  if (!json.success) throw new Error(json.error ?? 'Upload failed')
  return json.data as { key: string }
}

export function getImageUrl(key: string): string {
  if (!key) return ''
  return `${BASE}/images/${key}`
}

// ============================================================
// Media (multi-photo/video)
// ============================================================

export async function fetchRecordMedia(recordId: string): Promise<RecordMedia[]> {
  return request<RecordMedia[]>(`/media/${recordId}`)
}

export async function uploadMedia(
  recordId: string,
  mediaType: 'photo' | 'video',
  category: 'before' | 'after',
  file: File
): Promise<RecordMedia> {
  const formData = new FormData()
  formData.append('record_id', recordId)
  formData.append('media_type', mediaType)
  formData.append('category', category)
  formData.append('file', file)

  const res = await fetch(`${BASE}/media/upload`, {
    method: 'POST',
    body: formData,
  })
  const json = (await res.json()) as ApiResponse<RecordMedia>
  if (!json.success) throw new Error(json.error ?? 'Upload failed')
  return json.data as RecordMedia
}

export async function deleteMedia(id: string): Promise<void> {
  await request(`/media/${id}/delete`, { method: 'DELETE' })
}

export function getMediaUrl(storageKey: string): string {
  if (!storageKey) return ''
  return `${BASE}/images/${storageKey}`
}
