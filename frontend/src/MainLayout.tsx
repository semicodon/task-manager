import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TaskList } from './features/tasks/TaskList'
import { CategorySidebar } from './features/categories/CategorySidebar'
import { useAuth } from './features/auth/AuthProvider'

export function MainLayout() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }
  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold text-slate-900">
            Task Manager
            <span className="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 align-middle">
              Episode 3
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Signed in as{' '}
              <span className="font-medium text-slate-900">{user?.username}</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <CategorySidebar
          selectedId={selectedCategoryId}
          onSelectChange={setSelectedCategoryId}
        />
        <TaskList categoryFilter={selectedCategoryId} />
      </main>
    </div>
  )
}
