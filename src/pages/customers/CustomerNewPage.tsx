import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { CustomerForm } from '@/components/customer'
import * as api from '@/lib/api'

export function CustomerNewPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: { name: string; name_kana: string }) => {
    setLoading(true)
    try {
      const customer = await api.createCustomer(data)
      navigate(`/customers/${customer.id}`, { replace: true })
    } catch {
      // エラーハンドリング（将来Toast追加）
      setLoading(false)
    }
  }

  return (
    <>
      <Header title="新規お客様登録" showBack />
      <PageContainer className="pt-6">
        <CustomerForm onSubmit={handleSubmit} loading={loading} />
      </PageContainer>
    </>
  )
}
