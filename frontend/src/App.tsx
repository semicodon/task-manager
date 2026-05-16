import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { queryClient } from './lib/queryClient'
import { TaskList } from './features/tasks/TaskList'
import { CategorySidebar } from './features/categories/CategorySidebar'

export default function App() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-full bg-slate-50">
        {/* App header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <h1 className="text-lg font-bold text-slate-900">
              Task Manager
              <span className="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 align-middle">
                Episode 2
              </span>
            </h1>
            <a
              href="http://localhost:8000/api/"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              DRF Browsable API ↗
            </a>
          </div>
        </header>

        {/* Body */}
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <CategorySidebar
            selectedId={selectedCategoryId}
            onSelectChange={setSelectedCategoryId}
          />

          {/* Main content */}
          <TaskList categoryFilter={selectedCategoryId} />
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}
