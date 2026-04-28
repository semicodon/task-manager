import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { queryClient } from './lib/queryClient'
import { TaskList } from './features/tasks/TaskList'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-full bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
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

        <main className="mx-auto max-w-4xl px-6 py-8">
          <TaskList />
        </main>
      </div>

      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}
