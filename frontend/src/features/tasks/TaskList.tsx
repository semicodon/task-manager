
import { useState } from 'react'

import { Spinner } from '../../components/Spinner'
import { ErrorBanner } from '../../components/ErrorBanner'
import { EmptyState } from '../../components/EmptyState'
import { TaskCard } from './TaskCard'
import {
  useTasks,
  useMarkTaskDone,
  useDeleteTask,
} from './hooks'
import type { TaskListParams } from '../../api/tasks'
import type { TaskStatus } from '../../types'

const STATUS_TABS: Array<{ label: string; value?: TaskStatus }> = [
  { label: 'All' },                          // undefined → no filter
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

export function TaskList() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>()
  const filters: TaskListParams = statusFilter ? { status: statusFilter } : {}

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTasks(filters)

  const markDone = useMarkTaskDone()
  const deleteTask = useDeleteTask()

  return (
    <section className="space-y-4">
      {/* ── Header with tabs ────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tasks</h2>
          <p className="text-sm text-slate-500">
            Connected to Django API · live data
          </p>
        </div>

        <nav
          className="flex rounded-md border border-slate-200 bg-white p-0.5 text-sm shadow-sm"
          role="tablist"
          aria-label="Filter by status"
        >
          {STATUS_TABS.map((tab) => {
            const active = tab.value === statusFilter
            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(tab.value)}
                className={
                  'rounded-md px-3 py-1 font-medium transition ' +
                  (active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100')
                }
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </header>

      {/* ── Body — four possible states ─────────────────────────────────── */}
      {/* 1. Initial load */}
      {isLoading && (
        <div className="flex justify-center p-8">
          <Spinner label="Loading tasks…" />
        </div>
      )}

      {/* 2. Error */}
      {isError && (
        <ErrorBanner error={error} onRetry={() => void refetch()} />
      )}

      {/* 3. Success, but empty */}
      {!isLoading && !isError && data && data.results.length === 0 && (
        <EmptyState
          title="No tasks yet"
          description={
            statusFilter
              ? `No tasks with status "${statusFilter}". Try a different filter.`
              : 'Create your first task in the Django admin, or come back in Part 2 when we add a form here.'
          }
        />
      )}

      {/* 4. Success with data */}
      {!isLoading && !isError && data && data.results.length > 0 && (
        <ul className="space-y-3">
          {data.results.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                onMarkDone={(id) => markDone.mutate(id)}
                onDelete={(id) => {
                  if (confirm('Delete this task? This cannot be undone.')) {
                    deleteTask.mutate(id)
                  }
                }}
                isBusy={markDone.isPending || deleteTask.isPending}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Subtle "refreshing in the background" indicator. This only shows
          when a refetch happens *while* we're also showing cached data. */}
      {isFetching && !isLoading && (
        <p className="text-xs text-slate-400">Refreshing…</p>
      )}
    </section>
  )
}
