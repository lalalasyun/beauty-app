import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { RecordForm } from '@/components/record'
import * as api from '@/lib/api'
import { useImageUpload } from '@/hooks/useImageUpload'

export function RecordNewPage() {
  const { id: customerId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { upload } = useImageUpload()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: {
    treatment_date: string
    memo: string
    beforeFile: File | null
    afterFile: File | null
  }) => {
    if (!customerId) return
    setLoading(true)
    try {
      // 1. レコード作成
      const record = await api.createRecord({
        customer_id: customerId,
        treatment_date: data.treatment_date,
        memo: data.memo,
      })

      // 2. 画像アップロード（並行実行）
      const uploads: Promise<string>[] = []
      if (data.beforeFile) {
        uploads.push(upload(record.id, 'before', data.beforeFile))
      }
      if (data.afterFile) {
        uploads.push(upload(record.id, 'after', data.afterFile))
      }
      await Promise.all(uploads)

      navigate(`/customers/${customerId}`, { replace: true })
    } catch {
      // エラーハンドリング（将来Toast追加）
      setLoading(false)
    }
  }

  return (
    <>
      <Header title="施術記録を追加" showBack />
      <PageContainer className="pt-6">
        <RecordForm onSubmit={handleSubmit} loading={loading} />
      </PageContainer>
    </>
  )
}
