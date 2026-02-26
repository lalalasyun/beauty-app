import { cn } from '@/lib/utils'

interface BeforeAfterViewProps {
  beforeUrl: string
  afterUrl: string
  className?: string
}

export function BeforeAfterView({
  beforeUrl,
  afterUrl,
  className,
}: BeforeAfterViewProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {/* Before */}
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        {beforeUrl ? (
          <img
            src={beforeUrl}
            alt="Before"
            className="aspect-[3/4] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">
              写真なし
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-2.5 pt-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/90">
            Before
          </span>
        </div>
      </div>

      {/* After */}
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        {afterUrl ? (
          <img
            src={afterUrl}
            alt="After"
            className="aspect-[3/4] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">
              写真なし
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-2.5 pt-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/90">
            After
          </span>
        </div>
      </div>
    </div>
  )
}
