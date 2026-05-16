import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { TaskFormSchema } from './schema'
import type { TaskFormValues } from './schema'
import { useCreateTask, useUpdateTask } from './hooks'
import { useCategories } from '../categories/hooks'
import type { Task, TaskCreatePayload, TaskUpdatePayload, Category } from '../../types'
import type { ApiError } from '../../api/client'
import {zodResolver} from '@hookform/resolvers/zod'

export interface TaskFormProps {
  task?: Task
  onSuccess?: (savedTask: Task) => void
  onCancel?: () => void
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {

  const form = useForm({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: buildDefaults(task),
    mode: 'onBlur',
  })

  const isEdit = task !== undefined
  const categoriesQuery = useCategories()
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const submitting = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    form.reset(buildDefaults(task))
  }, [task, form])

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = toApiPayload(values)

    try {
      let saved: Task
      if (isEdit && task) {
        saved = await updateMutation.mutateAsync({ id: task.id, payload })
      } else {
        saved = await createMutation.mutateAsync(payload)
      }
      form.reset(buildDefaults())
      onSuccess?.(saved)
    } catch (err) {
      const apiError = err as ApiError

      if (apiError.fieldErrors) {
        for (const [field, messages] of Object.entries(apiError.fieldErrors)) {
          form.setError(
            field as keyof TaskFormValues,
            {
              type: 'server',
              message: Array.isArray(messages)
                ? messages.join(' ')
                : String(messages),
            }
          )
        }
      } else {
        form.setError('root', { type: 'server', message: apiError.message })
      }
    }
  })

  const errorFor = (field: keyof TaskFormValues) => {
    const message = form.formState.errors[field]?.message
    return message ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {message}
      </p>
    ) : null
  }
  const inputClass =
    'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ' +
    'text-slate-900 shadow-sm placeholder:text-slate-400 ' +
    'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClass}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type='text'
          id='title'
          autoFocus
          placeholder="What needs doing?"
          className={inputClass}
          {...form.register('title')}
        />
        {errorFor('title')}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Optional details…"
          className={inputClass}
          {...form.register('description')}
        />
        {errorFor('description')}
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className={labelClass}>Status</label>
          <select id="status" className={inputClass} {...form.register('status')}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          {errorFor('status')}
        </div>
        <div>
          <label htmlFor="priority" className={labelClass}>Priority</label>
          <select id="priority" className={inputClass} {...form.register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errorFor('priority')}
        </div>
      </div>

      {/* Due date + Category */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="due_date" className={labelClass}>Due date</label>
          <input
            id="due_date"
            type="date"
            className={inputClass}
            {...form.register('due_date')}
          />
          {errorFor('due_date')}
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>Category</label>
          <select
            id="category"
            className={inputClass}
            disabled={categoriesQuery.isLoading}
            {...form.register('category')}
          >
            <option value="0">— None —</option>
            {categoriesQuery.data?.results.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errorFor('category')}
        </div>
      </div>

      {/* Top-level server errors  */}
      {form.formState.errors.root && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  )
}

export function buildDefaults(task?: Task): TaskFormValues {
  if (!task) {
    return {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      category: 0,
    }
  }
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ?? '',
    category: task.category ?? 0,
  }
}

export function toApiPayload(values: TaskFormValues): TaskCreatePayload & TaskUpdatePayload {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    priority: values.priority,
    due_date: values.due_date ? values.due_date : null,
    category: values.category > 0 ? values.category : null,
  }
}
