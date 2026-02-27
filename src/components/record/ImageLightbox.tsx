import { useCallback, useRef, useState } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

interface ImageLightboxProps {
  src: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageLightbox({ src, alt, open, onOpenChange }: ImageLightboxProps) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const lastTapRef = useRef(0)
  const pointerCache = useRef<Map<number, PointerEvent>>(new Map())
  const prevDistRef = useRef<number | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const resetTransform = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
    prevDistRef.current = null
  }, [])

  const handleOpenChange = useCallback((value: boolean) => {
    if (!value) resetTransform()
    onOpenChange(value)
  }, [onOpenChange, resetTransform])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerCache.current.set(e.pointerId, e.nativeEvent)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

    if (pointerCache.current.size === 1) {
      dragStartRef.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y }
    }
  }, [translate])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    pointerCache.current.set(e.pointerId, e.nativeEvent)

    // Pinch zoom with 2 fingers
    if (pointerCache.current.size === 2) {
      const pts = Array.from(pointerCache.current.values())
      const dist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY)
      if (prevDistRef.current !== null) {
        const delta = dist / prevDistRef.current
        setScale((s) => Math.min(Math.max(s * delta, 1), 5))
      }
      prevDistRef.current = dist
      dragStartRef.current = null
      return
    }

    // Pan when zoomed
    if (pointerCache.current.size === 1 && scale > 1 && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setTranslate({ x: dragStartRef.current.tx + dx, y: dragStartRef.current.ty + dy })
    }
  }, [scale])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    pointerCache.current.delete(e.pointerId)
    if (pointerCache.current.size < 2) {
      prevDistRef.current = null
    }
    dragStartRef.current = null
  }, [])

  // Double-tap to toggle zoom
  const handleTap = useCallback((e: React.MouseEvent) => {
    if (pointerCache.current.size > 1) return
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      e.preventDefault()
      if (scale > 1) {
        resetTransform()
      } else {
        setScale(2.5)
        setTranslate({ x: 0, y: 0 })
      }
    }
    lastTapRef.current = now
  }, [scale, resetTransform])

  // Desktop wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((s) => {
      const next = Math.min(Math.max(s * delta, 1), 5)
      if (next <= 1) setTranslate({ x: 0, y: 0 })
      return next
    })
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-dvh max-h-dvh w-dvw max-w-dvw rounded-none border-none bg-black/95 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {/* Close button */}
        <button
          onClick={() => handleOpenChange(false)}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image container */}
        <div
          ref={containerRef}
          className="flex h-full w-full items-center justify-center overflow-hidden touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          onClick={handleTap}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="max-h-full max-w-full select-none object-contain"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transition: scale === 1 ? 'transform 0.2s ease-out' : undefined,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
