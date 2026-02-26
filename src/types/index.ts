// ============================================================
// 顧客
// ============================================================
export interface Customer {
  id: string
  name: string
  name_kana: string
  created_at: string
  updated_at: string
}

export interface CustomerWithStats extends Customer {
  record_count: number
  latest_treatment_date: string | null
}

export type CustomerCreate = Pick<Customer, 'name' | 'name_kana'>
export type CustomerUpdate = Partial<CustomerCreate>

// ============================================================
// 施術記録
// ============================================================
export interface TreatmentRecord {
  id: string
  customer_id: string
  treatment_date: string
  memo: string
  before_image_key: string
  after_image_key: string
  created_at: string
  updated_at: string
}

export type RecordCreate = Pick<
  TreatmentRecord,
  'customer_id' | 'treatment_date' | 'memo'
>

export type RecordUpdate = Partial<
  Pick<TreatmentRecord, 'treatment_date' | 'memo'>
>

// ============================================================
// API レスポンス
// ============================================================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

// ============================================================
// 認証（将来用）
// ============================================================
export interface AuthUser {
  id: string
  email: string
  name: string
}
