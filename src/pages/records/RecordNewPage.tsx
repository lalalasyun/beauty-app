import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { RecordForm } from '@/components/record'
import type { RecordFormData } from '@/components/record/RecordForm'
import * as api from '@/lib/api'
import { useMediaUpload } from '@/hooks/useMediaUpload'

export function RecordNewPage() {
  const { id: customerId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { uploadPhoto, uploadVideo } = useMediaUpload()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: RecordFormData) => {
    if (!customerId) return
    setLoading(true)
    try {
      // 1. レコード作成
      const record = await api.createRecord({
        customer_id: customerId,
        treatment_date: data.treatment_date,
        memo: data.memo,
      })

      // 2. メディアを並行アップロード
      const uploads: Promise<unknown>[] = []
      for (const photo of data.photos) {
        uploads.push(uploadPhoto(record.id, photo.file))
      }
      for (const video of data.videos) {
        uploads.push(uploadVideo(record.id, video.file))
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
