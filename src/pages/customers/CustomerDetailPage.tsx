import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Camera, Trash2 } from 'lucide-react'
import { Header, PageContainer } from '@/components/layout'
import { RecordCard } from '@/components/record'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { useCustomer } from '@/hooks/useCustomers'
import { useTreatmentRecords } from '@/hooks/useTreatmentRecords'
import { formatDate, cn } from '@/lib/utils'
import * as api from '@/lib/api'
import { useState } from 'react'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { customer, loading: customerLoading } = useCustomer(id)
  const { records, loading: recordsLoading } = useTreatmentRecords(id)
  const [deleting, setDeleting] = useState(false)

  const loading = customerLoading || recordsLoading

  const handleDelete = async () => {
    if (!id || !confirm('このお客様と全ての施術記録を削除しますか？\nこの操作は取り消せません。')) return
    setDeleting(true)
    try {
      await api.deleteCustomer(id)
      navigate('/', { replace: true })
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

  if (!customer) {
    return (
      <>
        <Header title="" showBack />
        <PageContainer>
          <EmptyState
            icon={Camera}
            title="お客様が見つかりません"
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

  return (
    <>
      <Header
        title={customer.name}
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
        {/* Customer info */}
        <div className="rounded-2xl bg-muted/30 px-5 py-4">
          <h2 className="text-xl font-semibold tracking-tight">{customer.name}</h2>
          {customer.name_kana && (
            <p className="mt-0.5 text-[13px] text-muted-foreground">{customer.name_kana}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-[13px] text-muted-foreground">
            <span>施術 {customer.record_count}回</span>
            {customer.latest_treatment_date && (
              <span>最終 {formatDate(customer.latest_treatment_date)}</span>
            )}
          </div>
        </div>

        {/* New record button */}
        <Button
          onClick={() => navigate(`/customers/${id}/records/new`)}
          className={cn(
            'mt-5 h-13 w-full rounded-xl text-[15px] font-semibold'
          )}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          施術記録を追加
        </Button>

        {/* Records timeline */}
        <div className="mt-6">
          {records.length > 0 ? (
            <div className="space-y-3">
              <span className="block px-1 text-[12px] font-medium text-muted-foreground">
                施術履歴
              </span>
              {records.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Camera}
              title="まだ施術記録がありません"
              description="最初の施術記録を追加しましょう"
            />
          )}
        </div>
      </PageContainer>
    </>
  )
}
