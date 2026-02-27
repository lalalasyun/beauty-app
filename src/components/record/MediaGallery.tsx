import { useState, useRef, useEffect } from 'react'
import { Film, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMediaUrl } from '@/lib/api'
import type { RecordMedia } from '@/types'
import { ImageLightbox } from './ImageLightbox'
import { VideoPlayer } from './VideoPlayer'

interface MediaGalleryProps {
  media: RecordMedia[]
  beforeMediaId?: string
  afterMediaId?: string
  onSetRepresentative?: (field: 'before_media_id' | 'after_media_id', mediaId: string) => void
  className?: string
}

export function MediaGallery({
  media,
  beforeMediaId,
  afterMediaId,
  onSetRepresentative,
  className,
}: MediaGalleryProps) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuId) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuId])

  if (media.length === 0) return null

  const handleMediaClick = (item: RecordMedia) => {
    const url = getMediaUrl(item.storage_key)
    if (item.media_type === 'photo') {
      setLightbox({ src: url, alt: '写真' })
    } else {
      setVideoSrc(url)
    }
  }

  const handleMenuAction = (
    field: 'before_media_id' | 'after_media_id',
    mediaId: string
  ) => {
    onSetRepresentative?.(field, mediaId)
    setMenuId(null)
  }

  const handleClear = (field: 'before_media_id' | 'after_media_id') => {
    onSetRepresentative?.(field, '')
    setMenuId(null)
  }

  return (
    <>
      <div className={cn('grid grid-cols-3 gap-1.5', className)}>
        {media.map((item) => {
          const isBefore = item.id === beforeMediaId
          const isAfter = item.id === afterMediaId
          const isPhoto = item.media_type === 'photo'

          return (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {/* Media content */}
              <button
                type="button"
                onClick={() => handleMediaClick(item)}
                className="h-full w-full"
              >
                {isPhoto ? (
                  <img
                    src={getMediaUrl(item.storage_key)}
                    alt="写真"
                    className="h-full w-full cursor-zoom-in object-cover"
                  />
                ) : (
                  <>
                    <video
                      src={getMediaUrl(item.storage_key)}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="rounded-full bg-black/50 p-2">
                        <Film className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </>
                )}
              </button>

              {/* Representative badges */}
              {isBefore && (
                <span className="absolute left-1 top-1 rounded bg-blue-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  B
                </span>
              )}
              {isAfter && (
                <span className={cn(
                  'absolute top-1 rounded bg-green-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white',
                  isBefore ? 'left-8' : 'left-1'
                )}>
                  A
                </span>
              )}

              {/* Menu button (photos only) */}
              {isPhoto && onSetRepresentative && (
                <div className="absolute bottom-1 right-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuId(menuId === item.id ? null : item.id)
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>

                  {/* Popover menu */}
                  {menuId === item.id && (
                    <div
                      ref={menuRef}
                      className="absolute bottom-8 right-0 z-10 min-w-[140px] rounded-lg border bg-background py-1 shadow-lg"
                    >
                      {isBefore ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleClear('before_media_id') }}
                          className="w-full px-3 py-1.5 text-left text-[12px] hover:bg-muted"
                        >
                          Before を解除
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMenuAction('before_media_id', item.id) }}
                          className="w-full px-3 py-1.5 text-left text-[12px] hover:bg-muted"
                        >
                          Before に設定
                        </button>
                      )}
                      {isAfter ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleClear('after_media_id') }}
                          className="w-full px-3 py-1.5 text-left text-[12px] hover:bg-muted"
                        >
                          After を解除
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMenuAction('after_media_id', item.id) }}
                          className="w-full px-3 py-1.5 text-left text-[12px] hover:bg-muted"
                        >
                          After に設定
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          open={true}
          onOpenChange={(open) => { if (!open) setLightbox(null) }}
        />
      )}

      {videoSrc && (
        <VideoPlayer
          src={videoSrc}
          open={true}
          onOpenChange={(open) => { if (!open) setVideoSrc(null) }}
        />
      )}
    </>
  )
}
