import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CustomerFormProps {
  initialName?: string
  initialNameKana?: string
  onSubmit: (data: { name: string; name_kana: string }) => Promise<void>
  submitLabel?: string
  loading?: boolean
}

export function CustomerForm({
  initialName = '',
  initialNameKana = '',
  onSubmit,
  submitLabel = '登録する',
  loading = false,
}: CustomerFormProps) {
  const [name, setName] = useState(initialName)
  const [nameKana, setNameKana] = useState(initialNameKana)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('お名前を入力してください')
      return
    }
    setError(null)
    await onSubmit({ name: name.trim(), name_kana: nameKana.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-muted-foreground">
          お名前 <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 山田 花子"
          className={cn(
            'h-13 w-full rounded-xl border bg-background px-4',
            'text-[16px] placeholder:text-muted-foreground/40',
            'outline-none transition-all',
            'focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20',
            error && !name.trim() && 'border-destructive'
          )}
          autoFocus
        />
        {error && !name.trim() && (
          <p className="mt-1.5 text-[12px] text-destructive">{error}</p>
        )}
      </div>

      {/* Name Kana */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-muted-foreground">
          フリガナ
        </label>
        <input
          type="text"
          value={nameKana}
          onChange={(e) => setNameKana(e.target.value)}
          placeholder="例: ヤマダ ハナコ"
          className={cn(
            'h-13 w-full rounded-xl border bg-background px-4',
            'text-[16px] placeholder:text-muted-foreground/40',
            'outline-none transition-all',
            'focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20'
          )}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="h-13 w-full rounded-xl text-[15px] font-semibold"
        size="lg"
      >
        {loading ? '処理中...' : submitLabel}
      </Button>
    </form>
  )
}
