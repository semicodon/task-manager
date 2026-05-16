import type { Category } from '../../types'
import { cn } from '../../lib/cn'

export interface CategoryItemProps {
  category: Category
  selected?: boolean
  onSelect?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  isBusy?: boolean
}

const buttonSelectCategory = (
  onSelect: ((id: number) => void) | undefined,
  category: Category,
  selected: boolean | undefined,
) => {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(category.id)}
      className="flex flex-1 items-center gap-2 truncate text-left text-sm"
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      <span
        className={cn(
          'truncate',
          selected ? 'font-semibold text-indigo-900' : 'text-slate-700',
        )}
      >
        {category.name}
      </span>
      <span className="ml-auto text-xs text-slate-400">{category.task_count}</span>
    </button>
  )
}

const buttonEditCategory = (
  isBusy: boolean | undefined,
  onEdit: ((id: number) => void) | undefined,
  category: Category,
) => {
  return (
    <button
      type="button"
      disabled={isBusy}
      onClick={() => onEdit?.(category.id)}
      aria-label={`Edit ${category.name}`}
      className="rounded p-1 text-xs text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      ✎
    </button>
  )
}

const buttonDeleteCategory = (
  isBusy: boolean | undefined,
  onDelete: ((id: number) => void) | undefined,
  category: Category,
) => {
  return (
    <button
      type="button"
      disabled={isBusy}
      onClick={() => onDelete?.(category.id)}
      aria-label={`Delete ${category.name}`}
      className="rounded p-1 text-xs text-slate-500 hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      ✕
    </button>
  )
}

export function CategoryItem({
  category,
  selected,
  onSelect,
  onEdit,
  onDelete,
  isBusy,
}: CategoryItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-md px-2 py-1.5 transition',
        selected ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-100',
      )}
    >
      {/* Body button */}
      {buttonSelectCategory(onSelect, category, selected)}

      {/* Edit + Delete  */}
      <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
        {onEdit && buttonEditCategory(isBusy, onEdit, category)}
        {onDelete && buttonDeleteCategory(isBusy, onDelete, category)}
      </div>
    </div>
  )
}
