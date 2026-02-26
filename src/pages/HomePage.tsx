import { UserPlus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { SearchBar, CustomerCard } from '@/components/customer'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { useCustomers } from '@/hooks/useCustomers'

export function HomePage() {
  const { customers, search, setSearch, loading } = useCustomers()
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <PageContainer className="pt-5">
        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Results */}
        <div className="mt-5">
          {loading ? (
            <LoadingSpinner />
          ) : customers.length > 0 ? (
            <div className="space-y-1">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-[12px] font-medium text-muted-foreground">
                  {search ? `「${search}」の検索結果` : '最近のお客様'}
                </span>
                <span className="text-[12px] text-muted-foreground/60">
                  {customers.length}名
                </span>
              </div>
              {customers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          ) : search ? (
            <EmptyState
              icon={Users}
              title="該当するお客様が見つかりません"
              description="別のキーワードで検索してください"
            />
          ) : (
            <EmptyState
              icon={Users}
              title="まだお客様が登録されていません"
              description="最初のお客様を登録して施術記録を始めましょう"
              action={
                <Button
                  onClick={() => navigate('/customers/new')}
                  className="h-12 rounded-xl px-6 text-[14px] font-semibold"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  お客様を登録
                </Button>
              }
            />
          )}
        </div>
      </PageContainer>
    </>
  )
}
