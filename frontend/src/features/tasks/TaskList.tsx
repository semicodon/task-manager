import { useState } from 'react'

import { Spinner } from '../../components/Spinner'
import { ErrorBanner } from '../../components/ErrorBanner'
import { EmptyState } from '../../components/EmptyState'
import { Modal } from '../../components/Modal'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { useTasks, useTask, useMarkTaskDone, useDeleteTask } from './hooks'
import type { TaskListParams } from '../../api/tasks'
import type { TaskStatus } from '../../types'

const STATUS_TABS: Array<{ label: string; value?: TaskStatus }> = [
  { label: 'All' }, // undefined → no filter
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

export interface TaskListProps {
  categoryFilter?: number | null
}

export function TaskList({ categoryFilter }: TaskListProps = {}) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)

  const filters: TaskListParams = {
    ...(statusFilter && { status: statusFilter }),
    ...(categoryFilter && { category: categoryFilter }),
  }

  const { data, isLoading, isError, error, refetch, isFetching } = useTasks(filters)
  const markDone = useMarkTaskDone()
  const deleteTask = useDeleteTask()
  const editingTaskQuery = useTask(editingTaskId ?? 0)
  const handleNewTask = () => {
    setEditingTaskId(null) // null → create mode
    setFormOpen(true)
  }
  const handleEditTask = (id: number) => {
    setEditingTaskId(id) // number → edit mode
    setFormOpen(true)
  }
  const handleCloseForm = () => {
    setFormOpen(false)
  }

  // Status filter buttons
  const statusButtons = STATUS_TABS.map((tab) => {
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
          (active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')
        }
      >
        {tab.label}
      </button>
    )
  })

  // Loading state
  const loadingSpinner = isLoading && (
    <div className="flex justify-center p-8">
      <Spinner label="Loading tasks…" />
    </div>
  )

  // Error state
  const errorMessage = isError && (
    <ErrorBanner error={error} onRetry={() => void refetch()} />
  )

  // Empty state
  const emptyState = !isLoading && !isError && data && data.results.length === 0 && (
    <EmptyState
      title="No tasks yet"
      description={
        statusFilter
          ? `No tasks with status "${statusFilter}". Try a different filter.`
          : 'Click "+ New Task" above to create your first one.'
      }
      action={
        !statusFilter && (
          <button
            type="button"
            onClick={handleNewTask}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            + New Task
          </button>
        )
      }
    />
  )

  // Task list
  const taskList = !isLoading && !isError && data && data.results.length > 0 && (
    <ul className="space-y-3">
      {data.results.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            onMarkDone={(id) => markDone.mutate(id)}
            onEdit={handleEditTask}
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
  )

  const newTaskButton = (
    <button
      type="button"
      onClick={handleNewTask}
      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
    >
      + New Task
    </button>
  )

  const modalContent = (() => {
    if (editingTaskId === null) {
      return <TaskForm onSuccess={handleCloseForm} onCancel={handleCloseForm} />
    }
    if (editingTaskQuery.isLoading || !editingTaskQuery.data) {
      return (
        <div className="flex justify-center p-6">
          <Spinner label="Loading task…" />
        </div>
      )
    }
    return (
      <TaskForm
        task={editingTaskQuery.data}
        onSuccess={handleCloseForm}
        onCancel={handleCloseForm}
      />
    )
  })()

  const formModal = (
    <Modal
      open={formOpen}
      onClose={handleCloseForm}
      title={editingTaskId === null ? 'New task' : 'Edit task'}
    >
      {modalContent}
    </Modal>
  )

  const refreshingIndicator = isFetching && !isLoading && (
    <p className="text-xs text-slate-400">Refreshing…</p>
  )

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tasks</h2>
          <p className="text-sm text-slate-500">Connected to Django API · live data</p>
        </div>

        <div className="flex items-center gap-2">
          <nav
            className="flex rounded-md border border-slate-200 bg-white p-0.5 text-sm shadow-sm"
            role="tablist"
            aria-label="Filter by status"
          >
            {statusButtons}
          </nav>
          {newTaskButton}
        </div>
      </header>

      {loadingSpinner}
      {errorMessage}
      {emptyState}
      {taskList}
      {refreshingIndicator}
      {formModal}
    </section>
  )
}
