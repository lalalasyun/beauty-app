import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { MediaUploader } from './MediaUploader'
import type { MediaFile } from './MediaUploader'
import { todayString } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface RecordFormData {
  treatment_date: string
  memo: string
  photos: MediaFile[]
  videos: MediaFile[]
  beforePhotoId: string | null
  afterPhotoId: string | null
}

interface RecordFormProps {
  initialDate?: string
  initialMemo?: string
  onSubmit: (data: RecordFormData) => Promise<void>
  submitLabel?: string
  loading?: boolean
}

let nextId = 0
function genId() {
  return `local-${++nextId}-${Date.now()}`
}

export function RecordForm({
  initialDate,
  initialMemo = '',
  onSubmit,
  submitLabel = '記録を保存',
  loading = false,
}: RecordFormProps) {
  const [treatmentDate, setTreatmentDate] = useState(
    initialDate ?? todayString()
  )
  const [memo, setMemo] = useState(initialMemo)
  const [photos, setPhotos] = useState<MediaFile[]>([])
  const [videos, setVideos] = useState<MediaFile[]>([])
  const [beforePhotoId, setBeforePhotoId] = useState<string | null>(null)
  const [afterPhotoId, setAfterPhotoId] = useState<string | null>(null)

  const handleAddPhoto = useCallback((file: File) => {
    const item: MediaFile = {
      id: genId(),
      file,
      mediaType: 'photo',
      previewUrl: URL.createObjectURL(file),
    }
    setPhotos((prev) => [...prev, item])
  }, [])

  const handleAddVideo = useCallback((file: File) => {
    const item: MediaFile = {
      id: genId(),
      file,
      mediaType: 'video',
      previewUrl: URL.createObjectURL(file),
    }
    setVideos((prev) => [...prev, item])
  }, [])

  const handleRemove = useCallback((id: string) => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
    setVideos((prev) => {
      const item = prev.find((v) => v.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((v) => v.id !== id)
    })
    setBeforePhotoId((prev) => (prev === id ? null : prev))
    setAfterPhotoId((prev) => (prev === id ? null : prev))
  }, [])

  const handleSetRepresentative = useCallback((field: 'before' | 'after', photoId: string) => {
    if (field === 'before') setBeforePhotoId((prev) => (prev === photoId ? null : photoId))
    else setAfterPhotoId((prev) => (prev === photoId ? null : photoId))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ treatment_date: treatmentDate, memo, photos, videos, beforePhotoId, afterPhotoId })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Media */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[13px] font-medium text-muted-foreground">写真・動画</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground/60">任意</span>
        </div>
        <MediaUploader
          photos={photos}
          videos={videos}
          onAddPhoto={handleAddPhoto}
          onAddVideo={handleAddVideo}
          onRemove={handleRemove}
          beforePhotoId={beforePhotoId}
          afterPhotoId={afterPhotoId}
          onSetRepresentative={handleSetRepresentative}
        />
      </div>

      {/* Treatment date */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-muted-foreground">
          施術日
        </label>
        <input
          type="date"
          value={treatmentDate}
          onChange={(e) => setTreatmentDate(e.target.value)}
          className={cn(
            'h-13 w-full rounded-xl border bg-background px-4',
            'text-[16px] text-foreground',
            'outline-none transition-all',
            'focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20'
          )}
        />
      </div>

      {/* Memo */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-muted-foreground">
          メモ（薬剤配合・施術内容など）
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          placeholder="例: アルカリカラー 6G + オキシ3% / 酸熱トリートメント"
          className={cn(
            'w-full rounded-xl border bg-background px-4 py-3',
            'text-[15px] leading-relaxed placeholder:text-muted-foreground/40',
            'outline-none transition-all resize-none',
            'focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20'
          )}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="h-13 w-full rounded-xl text-[15px] font-semibold"
        size="lg"
      >
        {loading ? '保存中...' : submitLabel}
      </Button>
    </form>
  )
}
