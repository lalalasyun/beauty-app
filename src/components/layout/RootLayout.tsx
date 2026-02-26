import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
      <BottomNav />
    </div>
  )
}
