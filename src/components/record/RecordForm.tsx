import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PhotoUploader } from './PhotoUploader'
import { todayString } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RecordFormProps {
  initialDate?: string
  initialMemo?: string
  onSubmit: (data: {
    treatment_date: string
    memo: string
    beforeFile: File | null
    afterFile: File | null
  }) => Promise<void>
  submitLabel?: string
  loading?: boolean
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
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ treatment_date: treatmentDate, memo, beforeFile, afterFile })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photos */}
      <div className="grid grid-cols-2 gap-3">
        <PhotoUploader
          label="Before"
          file={beforeFile}
          onChange={setBeforeFile}
        />
        <PhotoUploader
          label="After"
          file={afterFile}
          onChange={setAfterFile}
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
