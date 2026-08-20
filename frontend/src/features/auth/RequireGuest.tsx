import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from './AuthProvider'

export function RequireGuest({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500" role="status">Loading…</p>
      </div>
    )
  }
  if (user) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
