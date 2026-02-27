import { useMemo, useRef } from 'react'
import { ImagePlus, Film, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MediaFile {
  id: string
  file: File
  category: 'before' | 'after'
  mediaType: 'photo' | 'video'
  previewUrl: string
}

interface MediaUploaderProps {
  category: 'before' | 'after'
  photos: MediaFile[]
  videos: MediaFile[]
  onAddPhoto: (category: 'before' | 'after', file: File) => void
  onAddVideo: (category: 'before' | 'after', file: File) => void
  onRemove: (id: string) => void
  maxPhotos?: number
  maxVideos?: number
  className?: string
}

export function MediaUploader({
  category,
  photos,
  videos,
  onAddPhoto,
  onAddVideo,
  onRemove,
  maxPhotos = 5,
  maxVideos = 5,
  className,
}: MediaUploaderProps) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const categoryPhotos = useMemo(
    () => photos.filter((p) => p.category === category),
    [photos, category]
  )
  const categoryVideos = useMemo(
    () => videos.filter((v) => v.category === category),
    [videos, category]
  )

  const canAddPhoto = categoryPhotos.length < maxPhotos
  const canAddVideo = categoryVideos.length < maxVideos

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onAddPhoto(category, file)
    e.target.value = ''
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onAddVideo(category, file)
    e.target.value = ''
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">
          {category === 'before' ? 'Before' : 'After'}
        </span>
      </div>

      {/* Photo row */}
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/60">
            写真 {categoryPhotos.length}/{maxPhotos}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryPhotos.map((item) => (
            <div key={item.id} className="relative shrink-0">
              <img
                src={item.previewUrl}
                alt=""
                className="h-20 w-20 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="削除"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {canAddPhoto && (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className={cn(
                'flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1',
                'rounded-lg border-2 border-dashed border-border/60 bg-muted/30',
                'transition-all hover:border-foreground/20 hover:bg-muted/50',
                'active:scale-95'
              )}
            >
              <ImagePlus className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
              <span className="text-[9px] text-muted-foreground/50">追加</span>
            </button>
          )}
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      {/* Video row */}
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/60">
            動画 {categoryVideos.length}/{maxVideos}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryVideos.map((item) => (
            <div key={item.id} className="relative shrink-0">
              <video
                src={item.previewUrl}
                className="h-20 w-20 rounded-lg object-cover"
                muted
                playsInline
              />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="削除"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1 py-0.5">
                <Film className="h-3 w-3 text-white" />
              </div>
            </div>
          ))}
          {canAddVideo && (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className={cn(
                'flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1',
                'rounded-lg border-2 border-dashed border-border/60 bg-muted/30',
                'transition-all hover:border-foreground/20 hover:bg-muted/50',
                'active:scale-95'
              )}
            >
              <Film className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
              <span className="text-[9px] text-muted-foreground/50">追加</span>
            </button>
          )}
        </div>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
