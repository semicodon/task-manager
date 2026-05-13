import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { CategoryFormSchema } from './schema'
import type { CategoryFormValues } from './schema'
import { useCreateCategory, useUpdateCategory } from './hooks'
import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from '../../types'
import type { ApiError } from '../../api/client'

export interface CategoryFormProps {
  category?: Category
  onSuccess?: (saved: Category) => void
  onCancel?: () => void
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const form = useForm({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: buildDefaults(category),
    mode: 'onBlur',
  })

  const isEdit = category !== undefined
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const submitting = createMutation.isPending || updateMutation.isPending


  useEffect(() => {
    form.reset(buildDefaults(category))
  }, [category, form])

  const onSubmit = form.handleSubmit(
    async (values) => {
      const payload = toApiPayload(values)
      try {
        let saved: Category
        if (isEdit && category) {
          saved = await updateMutation.mutateAsync({
            id: category.id,
            payload })
        } else {
          saved = await createMutation.mutateAsync(payload)
        }
        form.reset(buildDefaults())
        onSuccess?.(saved)
      } catch (err) {
        const apiError = err as ApiError
        if (apiError.fieldErrors) {
          for (const [field, messages] of Object.entries(apiError.fieldErrors)) {
            form.setError(field as keyof CategoryFormValues, {
              type: 'server',
              message: Array.isArray(messages) ? messages.join(' ') : String(messages),
            })
          }
        } else {
          form.setError('root', { type: 'server', message: apiError.message })
        }
      }
  })


  const errorFor = (field: keyof CategoryFormValues) => {
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

  const nameField = (
    <div>
      <label htmlFor="name" className={labelClass}>
        Name <span className="text-red-500">*</span>
      </label>
      <input
        id="name"
        type="text"
        autoFocus
        placeholder="e.g. Personal, Work, Shopping"
        className={inputClass}
        {...form.register('name')}
      />
      {errorFor('name')}
    </div>
  )

  const descriptionField = (
    <div>
      <label htmlFor="description" className={labelClass}>
        Description
      </label>
      <textarea
        id="description"
        rows={2}
        placeholder="Optional"
        className={inputClass}
        {...form.register('description')}
      />
      {errorFor('description')}
    </div>
  )

  const colorField = (
    <div>
      <label htmlFor="color" className={labelClass}>Color</label>
      <div className="flex items-center gap-3">
        <input
          id="color"
          type="color"
          className="h-10 w-14 cursor-pointer rounded border border-slate-300 bg-white p-1"
          {...form.register('color')}
        />
        <code className="text-xs text-slate-500">
          {form.watch('color')}
        </code>
      </div>
      {errorFor('color')}
    </div>
  )

  const rootError = form.formState.errors.root && (
    <p
      className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      {form.formState.errors.root.message}
    </p>
  )

  const actionButtons = (
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
        {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
      </button>
    </div>
  )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {nameField}
      {descriptionField}
      {colorField}
      {rootError}
      {actionButtons}
    </form>
  )
}

function buildDefaults(category?: Category): CategoryFormValues {
  if (!category) {
    return {
      name: '',
      description: '',
      color: '#6366f1',
    }
  }
  return {
    name: category.name,
    description: category.description ?? '',
    color: category.color,
  }
}

function toApiPayload(
  values: CategoryFormValues
): CategoryCreatePayload & CategoryUpdatePayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    color: values.color,
  }
}
