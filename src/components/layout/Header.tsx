import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  showBack?: boolean
  right?: React.ReactNode
}

export function Header({ title, showBack, right }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border/60',
        'bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center px-4">
        {/* Left: Back button or brand */}
        <div className="flex w-12 items-center">
          {showBack && !isHome ? (
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent active:bg-accent/80"
              aria-label="戻る"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {/* Center: Title */}
        <div className="flex flex-1 items-center justify-center">
          {title ? (
            <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
          ) : isHome ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-bold tracking-[0.08em] uppercase">
                Beauty
              </span>
              <span className="text-[15px] font-light tracking-[0.08em] text-muted-foreground uppercase">
                Record
              </span>
            </div>
          ) : null}
        </div>

        {/* Right: Actions */}
        <div className="flex w-12 items-center justify-end">
          {right}
        </div>
      </div>
    </header>
  )
}
