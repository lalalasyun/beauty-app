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

      // 2. 写真アップロード（local ID → server ID を追跡）
      const photoResults = await Promise.all(
        data.photos.map(async (photo) => {
          const media = await uploadPhoto(record.id, photo.file)
          return { localId: photo.id, serverId: media.id }
        })
      )

      // 3. 動画を並行アップロード
      await Promise.all(
        data.videos.map((video) => uploadVideo(record.id, video.file))
      )

      // 4. Before/After 代表画像を設定
      if (data.beforePhotoId) {
        const match = photoResults.find((r) => r.localId === data.beforePhotoId)
        if (match) await api.setRepresentative(record.id, 'before_media_id', match.serverId)
      }
      if (data.afterPhotoId) {
        const match = photoResults.find((r) => r.localId === data.afterPhotoId)
        if (match) await api.setRepresentative(record.id, 'after_media_id', match.serverId)
      }

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
