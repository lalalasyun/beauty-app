import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageLightbox } from './ImageLightbox'

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
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  return (
    <>
      <div className={cn('grid grid-cols-2 gap-2', className)}>
        {/* Before */}
        <div className="relative overflow-hidden rounded-2xl bg-muted">
          {beforeUrl ? (
            <img
              src={beforeUrl}
              alt="Before"
              onClick={() => setLightbox({ src: beforeUrl, alt: 'Before' })}
              className="aspect-[3/4] w-full cursor-zoom-in object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center">
              <span className="text-[13px] text-muted-foreground/40">
                写真なし
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-2.5 pt-6">
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
              onClick={() => setLightbox({ src: afterUrl, alt: 'After' })}
              className="aspect-[3/4] w-full cursor-zoom-in object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center">
              <span className="text-[13px] text-muted-foreground/40">
                写真なし
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-2.5 pt-6">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/90">
              After
            </span>
          </div>
        </div>
      </div>

      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          open={true}
          onOpenChange={(open) => { if (!open) setLightbox(null) }}
        />
      )}
    </>
  )
}
