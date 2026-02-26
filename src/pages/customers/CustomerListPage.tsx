import { UserPlus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { SearchBar, CustomerCard } from '@/components/customer'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { useCustomers } from '@/hooks/useCustomers'

export function CustomerListPage() {
  const { customers, search, setSearch, loading } = useCustomers()
  const navigate = useNavigate()

  return (
    <>
      <Header
        title="顧客一覧"
        right={
          <button
            onClick={() => navigate('/customers/new')}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
            aria-label="新規登録"
          >
            <UserPlus className="h-5 w-5" />
          </button>
        }
      />
      <PageContainer className="pt-5">
        <SearchBar value={search} onChange={setSearch} />

        <div className="mt-5">
          {loading ? (
            <LoadingSpinner />
          ) : customers.length > 0 ? (
            <div className="space-y-1">
              <span className="mb-3 block px-1 text-[12px] font-medium text-muted-foreground">
                全{customers.length}名
              </span>
              {customers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="お客様が登録されていません"
              action={
                <Button
                  onClick={() => navigate('/customers/new')}
                  className="h-12 rounded-xl px-6"
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
