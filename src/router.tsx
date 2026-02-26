import { createBrowserRouter, Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout'
import { HomePage } from '@/pages/HomePage'
import { CustomerListPage } from '@/pages/customers/CustomerListPage'
import { CustomerNewPage } from '@/pages/customers/CustomerNewPage'
import { CustomerDetailPage } from '@/pages/customers/CustomerDetailPage'
import { RecordNewPage } from '@/pages/records/RecordNewPage'
import { RecordDetailPage } from '@/pages/records/RecordDetailPage'

function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
      <BottomNav />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/customers', element: <CustomerListPage /> },
      { path: '/customers/new', element: <CustomerNewPage /> },
      { path: '/customers/:id', element: <CustomerDetailPage /> },
      { path: '/customers/:id/records/new', element: <RecordNewPage /> },
      { path: '/records/:id', element: <RecordDetailPage /> },
    ],
  },
])
