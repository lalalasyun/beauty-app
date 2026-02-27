import { useState, useRef, useEffect } from 'react'
import { ImagePlus, Film, X, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MediaFile {
  id: string
  file: File
  mediaType: 'photo' | 'video'
  previewUrl: string
}

interface MediaUploaderProps {
  photos: MediaFile[]
  videos: MediaFile[]
  onAddPhoto: (file: File) => void
  onAddVideo: (file: File) => void
  onRemove: (id: string) => void
  beforePhotoId?: string | null
  afterPhotoId?: string | null
  onSetRepresentative?: (field: 'before' | 'after', photoId: string) => void
  maxPhotos?: number
  maxVideos?: number
  className?: string
}

export function MediaUploader({
  photos,
  videos,
  onAddPhoto,
  onAddVideo,
  onRemove,
  beforePhotoId,
  afterPhotoId,
  onSetRepresentative,
  maxPhotos = 5,
  maxVideos = 5,
  className,
}: MediaUploaderProps) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const canAddPhoto = photos.length < maxPhotos
  const canAddVideo = videos.length < maxVideos

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onAddPhoto(file)
    e.target.value = ''
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onAddVideo(file)
    e.target.value = ''
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Media grid (photos + videos) */}
      {(photos.length > 0 || videos.length > 0) && (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((item) => {
            const isBefore = item.id === beforePhotoId
            const isAfter = item.id === afterPhotoId

            return (
              <div key={item.id} className="relative aspect-square rounded-lg">
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-full w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(item.id)
                  }}
                  className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  aria-label="削除"
                >
                  <X className="h-3 w-3" />
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

                {/* Menu button */}
                {onSetRepresentative && (
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
                        className="absolute bottom-8 right-0 z-20 min-w-[140px] rounded-lg border bg-background py-1 shadow-lg"
                      >
                        {isBefore ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onSetRepresentative('before', item.id); setMenuId(null) }}
                            className="w-full px-3 py-1.5 text-left text-[12px] hover:bg-muted"
                          >
                            Before を解除
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onSetRepresentative('before', item.id); setMenuId(null) }}
                            className="w-full px-3 py-1.5 text-left text-[12px] hover:bg-muted"
                          >
                            Before に設定
                          </button>
                        )}
                        {isAfter ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onSetRepresentative('after', item.id); setMenuId(null) }}
                            className="w-full px-3 py-1.5 text-left text-[12px] hover:bg-muted"
                          >
                            After を解除
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onSetRepresentative('after', item.id); setMenuId(null) }}
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
          {videos.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-lg">
              <video
                src={item.previewUrl}
                className="h-full w-full rounded-lg object-cover"
                muted
                playsInline
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(item.id)
                }}
                className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                aria-label="削除"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                <div className="rounded-full bg-black/50 p-2">
                  <Film className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => photoInputRef.current?.click()}
          disabled={!canAddPhoto}
          className="gap-1.5 text-xs"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          写真追加
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          disabled={!canAddVideo}
          className="gap-1.5 text-xs"
        >
          <Film className="h-3.5 w-3.5" />
          動画追加
        </Button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
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
