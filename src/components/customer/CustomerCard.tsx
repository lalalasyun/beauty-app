import { useNavigate } from 'react-router-dom'
import { ChevronRight, Camera } from 'lucide-react'
import type { CustomerWithStats } from '@/types'
import { formatDateShort } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CustomerCardProps {
  customer: CustomerWithStats
  className?: string
}

export function CustomerCard({ customer, className }: CustomerCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/customers/${customer.id}`)}
      className={cn(
        'flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5',
        'text-left transition-all active:scale-[0.98]',
        'hover:bg-muted/40',
        className
      )}
    >
      {/* Avatar */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted/60">
        <span className="text-lg font-semibold text-foreground/70">
          {customer.name.charAt(0)}
        </span>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] font-medium">
          {customer.name}
        </span>
        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
          {customer.record_count > 0 ? (
            <>
              <span className="flex items-center gap-1">
                <Camera className="h-3 w-3" />
                {customer.record_count}件
              </span>
              {customer.latest_treatment_date && (
                <>
                  <span className="text-border">·</span>
                  <span>最終 {formatDateShort(customer.latest_treatment_date)}</span>
                </>
              )}
            </>
          ) : (
            <span>施術記録なし</span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30" />
    </button>
  )
}
