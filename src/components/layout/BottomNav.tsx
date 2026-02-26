import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'ホーム' },
  { path: '/customers', icon: Users, label: '顧客' },
  { path: '/customers/new', icon: Plus, label: '新規登録' },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border/60',
        'bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60',
        'pb-[env(safe-area-inset-bottom)]'
      )}
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path)

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/70'
              )}
              aria-label={label}
            >
              <Icon
                className={cn(
                  'h-[22px] w-[22px] transition-all',
                  isActive && 'stroke-[2.5]'
                )}
              />
              <span
                className={cn(
                  'text-[10px] tracking-wide',
                  isActive ? 'font-semibold' : 'font-normal'
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
