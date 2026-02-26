import { useNavigate } from 'react-router-dom'
import type { TreatmentRecord } from '@/types'
import { getImageUrl } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RecordCardProps {
  record: TreatmentRecord
  className?: string
}

export function RecordCard({ record, className }: RecordCardProps) {
  const navigate = useNavigate()
  const beforeUrl = getImageUrl(record.before_image_key)
  const afterUrl = getImageUrl(record.after_image_key)
  const hasImages = record.before_image_key || record.after_image_key

  return (
    <button
      onClick={() => navigate(`/records/${record.id}`)}
      className={cn(
        'w-full overflow-hidden rounded-2xl bg-background text-left',
        'border border-border/40 transition-all',
        'hover:border-border hover:shadow-sm active:scale-[0.99]',
        className
      )}
    >
      {/* Photos */}
      {hasImages && (
        <div className="grid grid-cols-2">
          <div className="relative aspect-square overflow-hidden bg-muted">
            {beforeUrl ? (
              <img
                src={beforeUrl}
                alt="Before"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground/30">
                No photo
              </div>
            )}
            <span className="absolute bottom-1.5 left-2 text-[9px] font-bold uppercase tracking-widest text-white/80 drop-shadow-md">
              Before
            </span>
          </div>
          <div className="relative aspect-square overflow-hidden bg-muted">
            {afterUrl ? (
              <img
                src={afterUrl}
                alt="After"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground/30">
                No photo
              </div>
            )}
            <span className="absolute bottom-1.5 left-2 text-[9px] font-bold uppercase tracking-widest text-white/80 drop-shadow-md">
              After
            </span>
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="px-4 py-3">
        <p className="text-[13px] font-medium">
          {formatDate(record.treatment_date)}
        </p>
        {record.memo && (
          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
            {record.memo}
          </p>
        )}
      </div>
    </button>
  )
}
