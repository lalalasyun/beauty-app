import { useParams, useNavigate } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import { Trash2, Camera, ImagePlus, Film } from 'lucide-react'
import { Header, PageContainer } from '@/components/layout'
import { BeforeAfterView, MediaGallery } from '@/components/record'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { useTreatmentRecord } from '@/hooks/useTreatmentRecords'
import { useRecordMedia } from '@/hooks/useRecordMedia'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import { getImageUrl, getMediaUrl } from '@/lib/api'
import { cn } from '@/lib/utils'
import * as api from '@/lib/api'
import { useState, useCallback } from 'react'

export function RecordDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { record, loading, reload: reloadRecord } = useTreatmentRecord(id)
  const { media, reload: reloadMedia } = useRecordMedia(id)
  const { uploading, uploadPhoto, uploadVideo } = useMediaUpload()
  const [deleting, setDeleting] = useState(false)
  const [treatmentDate, setTreatmentDate] = useState('')
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (record) {
      setTreatmentDate(record.treatment_date)
      setMemo(record.memo ?? '')
    }
  }, [record])

  const hasChanges =
    !!record &&
    (treatmentDate !== record.treatment_date || memo !== (record.memo ?? ''))

  const handleSave = async () => {
    if (!id || !hasChanges) return
    setSaving(true)
    try {
      await api.updateRecord(id, { treatment_date: treatmentDate, memo })
      reloadRecord()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !record) return
    if (!confirm('この施術記録を削除しますか？\n写真・動画も一緒に削除されます。')) return
    setDeleting(true)
    try {
      await api.deleteRecord(id)
      navigate(`/customers/${record.customer_id}`, { replace: true })
    } catch {
      setDeleting(false)
    }
  }

  const handleSetRepresentative = useCallback(
    async (field: 'before_media_id' | 'after_media_id', mediaId: string) => {
      if (!id) return
      try {
        await api.setRepresentative(id, field, mediaId)
        reloadRecord()
      } catch {
        // エラーハンドリング（将来Toast追加）
      }
    },
    [id, reloadRecord]
  )

  const handleUploadPhoto = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !id) return
      e.target.value = ''
      try {
        await uploadPhoto(id, file)
        reloadMedia()
      } catch {
        // エラーハンドリング（将来Toast追加）
      }
    },
    [id, uploadPhoto, reloadMedia]
  )

  const handleUploadVideo = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !id) return
      e.target.value = ''
      try {
        await uploadVideo(id, file)
        reloadMedia()
      } catch {
        // エラーハンドリング（将来Toast追加）
      }
    },
    [id, uploadVideo, reloadMedia]
  )

  const handleDeleteMedia = useCallback(
    async (mediaId: string) => {
      if (!confirm('このメディアを削除しますか？')) return
      try {
        await api.deleteMedia(mediaId)
        reloadMedia()
        reloadRecord()
      } catch {
        // エラーハンドリング（将来Toast追加）
      }
    },
    [reloadMedia, reloadRecord]
  )

  if (loading) {
    return (
      <>
        <Header title="" showBack />
        <LoadingSpinner />
      </>
    )
  }

  if (!record) {
    return (
      <>
        <Header title="" showBack />
        <PageContainer>
          <EmptyState
            icon={Camera}
            title="施術記録が見つかりません"
            action={
              <Button variant="outline" onClick={() => navigate('/')}>
                ホームに戻る
              </Button>
            }
          />
        </PageContainer>
      </>
    )
  }

  // Resolve before/after representative URLs
  // Priority: before_media_id → legacy before_image_key
  const beforeMediaItem = record.before_media_id
    ? media.find((m) => m.id === record.before_media_id)
    : null
  const afterMediaItem = record.after_media_id
    ? media.find((m) => m.id === record.after_media_id)
    : null

  const beforeUrl = beforeMediaItem
    ? getMediaUrl(beforeMediaItem.storage_key)
    : getImageUrl(record.before_image_key)
  const afterUrl = afterMediaItem
    ? getMediaUrl(afterMediaItem.storage_key)
    : getImageUrl(record.after_image_key)

  return (
    <>
      <Header
        title="施術記録"
        showBack
        right={
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />
      <PageContainer className="pt-5">
        {/* Before/After representative photos */}
        <BeforeAfterView beforeUrl={beforeUrl} afterUrl={afterUrl} />

        {/* Flat media gallery */}
        {media.length > 0 && (
          <MediaGallery
            media={media}
            beforeMediaId={record.before_media_id}
            afterMediaId={record.after_media_id}
            onSetRepresentative={handleSetRepresentative}
            onDelete={handleDeleteMedia}
            className="mt-4"
          />
        )}

        {/* Upload buttons */}
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => photoInputRef.current?.click()}
            disabled={uploading}
            className="gap-1.5 text-xs"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            写真追加
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
            className="gap-1.5 text-xs"
          >
            <Film className="h-3.5 w-3.5" />
            動画追加
          </Button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadPhoto}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleUploadVideo}
            className="hidden"
          />
        </div>

        {/* Meta (editable) */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-muted-foreground">
              施術日
            </label>
            <input
              type="date"
              value={treatmentDate}
              onChange={(e) => setTreatmentDate(e.target.value)}
              className={cn(
                'h-13 w-full rounded-xl border bg-background px-4',
                'text-[16px]',
                'outline-none transition-all',
                'focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20'
              )}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-muted-foreground">
              メモ（薬剤配合・施術内容など）
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
              className={cn(
                'w-full rounded-xl border bg-background px-4 py-3',
                'text-[15px] leading-relaxed placeholder:text-muted-foreground/40',
                'outline-none transition-all resize-none',
                'focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20'
              )}
              placeholder="施術内容や薬剤配合などを記録..."
            />
          </div>

          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-13 w-full rounded-xl text-[15px] font-semibold"
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          )}
        </div>
      </PageContainer>
    </>
  )
}
