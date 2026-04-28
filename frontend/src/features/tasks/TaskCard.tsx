
import type { TaskListItem, TaskStatus, TaskPriority } from '../../types'
import { cn } from '../../lib/cn'

export interface TaskCardProps {
  task: TaskListItem
  onMarkDone?: (id: number) => void
  onDelete?: (id: number) => void
  isBusy?: boolean
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-800',
  done: 'bg-emerald-100 text-emerald-800',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'text-slate-500',
  medium: 'text-sky-600',
  high: 'text-rose-600 font-semibold',
}

export function TaskCard({ task, onMarkDone, onDelete, isBusy }: TaskCardProps) {
  const isDone = task.status === 'done'

  return (
    <article
      className={cn(
        'flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm',
        isDone && 'opacity-60'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'truncate text-base font-semibold text-slate-900',
              isDone && 'line-through'
            )}
          >
            {task.title}
          </h3>
          <span
            className={cn(
              'inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_STYLES[task.status]
            )}
          >
            {STATUS_LABELS[task.status]}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className={PRIORITY_STYLES[task.priority]}>
            {task.priority.toUpperCase()}
          </span>

          {task.category_name && (
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
              style={{
                backgroundColor: `${task.category_color ?? '#6366f1'}20`,
                color: task.category_color ?? '#6366f1',
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: task.category_color ?? '#6366f1' }}
              />
              {task.category_name}
            </span>
          )}

          {task.due_date && (
            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        {!isDone && onMarkDone && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onMarkDone(task.id)}
            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark done
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onDelete(task.id)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  )
}
