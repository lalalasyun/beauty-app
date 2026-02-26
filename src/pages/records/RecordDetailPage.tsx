import { useParams, useNavigate } from 'react-router-dom'
import { Trash2, Camera } from 'lucide-react'
import { Header, PageContainer } from '@/components/layout'
import { BeforeAfterView } from '@/components/record'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { useTreatmentRecord } from '@/hooks/useTreatmentRecords'
import { getImageUrl } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import * as api from '@/lib/api'
import { useState } from 'react'

export function RecordDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { record, loading } = useTreatmentRecord(id)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!id || !record) return
    if (!confirm('この施術記録を削除しますか？\n写真も一緒に削除されます。')) return
    setDeleting(true)
    try {
      await api.deleteRecord(id)
      navigate(`/customers/${record.customer_id}`, { replace: true })
    } catch {
      setDeleting(false)
    }
  }

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

  const beforeUrl = getImageUrl(record.before_image_key)
  const afterUrl = getImageUrl(record.after_image_key)

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
        {/* Before/After Photos */}
        <BeforeAfterView beforeUrl={beforeUrl} afterUrl={afterUrl} />

        {/* Meta */}
        <div className="mt-5 space-y-4 rounded-2xl bg-muted/30 px-5 py-4">
          <div>
            <span className="text-[12px] font-medium text-muted-foreground">
              施術日
            </span>
            <p className="mt-0.5 text-[15px] font-medium">
              {formatDate(record.treatment_date)}
            </p>
          </div>

          {record.memo && (
            <div>
              <span className="text-[12px] font-medium text-muted-foreground">
                メモ
              </span>
              <p className="mt-0.5 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/80">
                {record.memo}
              </p>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  )
}
