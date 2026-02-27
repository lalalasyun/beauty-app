import { useMemo, useRef, useCallback } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoUploaderProps {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  existingUrl?: string
  className?: string
}

export function PhotoUploader({
  label,
  file,
  onChange,
  existingUrl,
  className,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  const displayUrl = previewUrl || existingUrl || null

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (selected) onChange(selected)
      // reset input so same file can be re-selected
      e.target.value = ''
    },
    [onChange]
  )

  const handleRemove = useCallback(() => {
    onChange(null)
  }, [onChange])

  return (
    <div className={cn('flex flex-col', className)}>
      <span className="mb-2 text-[13px] font-medium text-muted-foreground">
        {label}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {displayUrl ? (
        /* Photo preview */
        <div className="group relative">
          <div className="overflow-hidden rounded-2xl bg-muted">
            <img
              src={displayUrl}
              alt={label}
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          {/* Remove / Replace buttons */}
          <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label="写真を変更"
            >
              <Camera className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label="写真を削除"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Always-visible replace button on mobile */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 flex h-8 items-center gap-1.5 rounded-full bg-black/50 px-3 text-[12px] text-white backdrop-blur-sm transition-colors hover:bg-black/70 md:hidden"
          >
            <Camera className="h-3.5 w-3.5" />
            変更
          </button>
        </div>
      ) : (
        /* Upload placeholder */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex aspect-[3/4] w-full flex-col items-center justify-center gap-3',
            'rounded-2xl border-2 border-dashed border-border/60',
            'bg-muted/30 transition-all',
            'hover:border-foreground/20 hover:bg-muted/50',
            'active:scale-[0.98]'
          )}
        >
          <div className="rounded-2xl bg-muted/60 p-3">
            <ImagePlus className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-medium text-muted-foreground/70">
              写真を追加
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/40">
              撮影またはギャラリーから選択
            </p>
          </div>
        </button>
      )}
    </div>
  )
}
