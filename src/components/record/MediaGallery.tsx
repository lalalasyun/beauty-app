import { useState } from 'react'
import { Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMediaUrl } from '@/lib/api'
import type { RecordMedia } from '@/types'
import { ImageLightbox } from './ImageLightbox'
import { VideoPlayer } from './VideoPlayer'

interface MediaGalleryProps {
  media: RecordMedia[]
  className?: string
}

export function MediaGallery({ media, className }: MediaGalleryProps) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)

  const beforeMedia = media.filter((m) => m.category === 'before')
  const afterMedia = media.filter((m) => m.category === 'after')

  if (media.length === 0) return null

  const handleMediaClick = (item: RecordMedia) => {
    const url = getMediaUrl(item.storage_key)
    if (item.media_type === 'photo') {
      setLightbox({ src: url, alt: `${item.category} 写真` })
    } else {
      setVideoSrc(url)
    }
  }

  const renderSection = (items: RecordMedia[], label: string) => {
    if (items.length === 0) return null
    const photos = items.filter((m) => m.media_type === 'photo')
    const videos = items.filter((m) => m.media_type === 'video')

    return (
      <div>
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleMediaClick(item)}
              className="relative aspect-square overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={getMediaUrl(item.storage_key)}
                alt={`${label} 写真`}
                className="h-full w-full cursor-zoom-in object-cover"
              />
            </button>
          ))}
          {videos.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleMediaClick(item)}
              className="relative aspect-square overflow-hidden rounded-lg bg-muted"
            >
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
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {renderSection(beforeMedia, 'Before')}
        {renderSection(afterMedia, 'After')}
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
