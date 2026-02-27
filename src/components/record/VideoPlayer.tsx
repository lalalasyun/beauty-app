import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

interface VideoPlayerProps {
  src: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoPlayer({ src, open, onOpenChange }: VideoPlayerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-dvh max-h-dvh w-dvw max-w-dvw rounded-none border-none bg-black/95 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">動画再生</DialogTitle>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex h-full w-full items-center justify-center p-4">
          <video
            src={src}
            controls
            playsInline
            autoPlay
            className="max-h-full max-w-full rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
