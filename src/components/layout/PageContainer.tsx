import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** BottomNav分のpadding-bottomを追加するか (default: true) */
  bottomPadding?: boolean
}

export function PageContainer({
  children,
  className,
  bottomPadding = true,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        'mx-auto w-full max-w-lg px-4',
        bottomPadding && 'pb-24',
        className
      )}
    >
      {children}
    </main>
  )
}
