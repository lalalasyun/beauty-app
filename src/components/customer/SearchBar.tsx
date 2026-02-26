import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'お客様の名前で検索...',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground/50" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-12 w-full rounded-xl border-0 bg-muted/50 pl-10 pr-10',
          'text-[15px] placeholder:text-muted-foreground/40',
          'outline-none ring-1 ring-transparent transition-all',
          'focus:bg-background focus:ring-border focus:shadow-sm'
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground"
          aria-label="クリア"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
