import { useState } from 'react'

import { Spinner } from '../../components/Spinner'
import { ErrorBanner } from '../../components/ErrorBanner'
import { EmptyState } from '../../components/EmptyState'
import { Modal } from '../../components/Modal'
import { CategoryItem } from './CategoryItem'
import { CategoryForm } from './CategoryForm'
import { useCategories, useCategory, useDeleteCategory } from './hooks'

export interface CategorySidebarProps {
  selectedId: number | null
  onSelectChange: (id: number | null) => void
}

export function CategorySidebar({ selectedId, onSelectChange }: CategorySidebarProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)

  const categoriesQuery = useCategories()
  const editingCategoryQuery = useCategory(editingCategoryId ?? 0)
  const deleteMutation = useDeleteCategory()

  const handleNewCategory = () => {
    setEditingCategoryId(null)
    setFormOpen(true)
  }
  const handleEditCategory = (id: number) => {
    setEditingCategoryId(id)
    setFormOpen(true)
  }
  const handleDeleteCategory = (id: number) => {
    const confirmed = confirm(
      'Delete this category? Tasks in it will become uncategorised.',
    )
    if (!confirmed) return
    deleteMutation.mutate(id)
    if (selectedId === id) onSelectChange(null)
  }
  const handleCloseForm = () => setFormOpen(false)
  const handleRowClick = (id: number) => {
    onSelectChange(selectedId === id ? null : id)
  }

  const newCategoryButton = (
    <button
      type="button"
      onClick={handleNewCategory}
      className="w-full rounded-md border border-dashed border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
    >
      + New Category
    </button>
  )

  const allRow = (
    <button
      type="button"
      onClick={() => onSelectChange(null)}
      className={
        'w-full rounded-md px-2 py-1.5 text-left text-sm transition ' +
        (selectedId === null
          ? 'bg-indigo-50 font-semibold text-indigo-900 ring-1 ring-indigo-200'
          : 'text-slate-700 hover:bg-slate-100')
      }
    >
      All tasks
    </button>
  )

  const loadingSpinner = categoriesQuery.isLoading && (
    <div className="flex justify-center p-4">
      <Spinner label="Loading…" />
    </div>
  )

  const errorMessage = categoriesQuery.isError && (
    <ErrorBanner
      error={categoriesQuery.error}
      onRetry={() => void categoriesQuery.refetch()}
    />
  )

  const emptyState = categoriesQuery.isSuccess &&
    categoriesQuery.data.results.length === 0 && (
      <EmptyState
        title="No categories"
        description="Create one to organise your tasks."
      />
    )

  const categoryList = categoriesQuery.isSuccess &&
    categoriesQuery.data.results.length > 0 && (
      <div className="space-y-0.5">
        {categoriesQuery.data.results.map((cat) => (
          <CategoryItem
            key={cat.id}
            category={cat}
            selected={selectedId === cat.id}
            onSelect={handleRowClick}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            isBusy={deleteMutation.isPending}
          />
        ))}
      </div>
    )

  const modalContent = (() => {
    if (editingCategoryId === null) {
      return <CategoryForm onSuccess={handleCloseForm} onCancel={handleCloseForm} />
    }
    if (editingCategoryQuery.isLoading || !editingCategoryQuery.data) {
      return (
        <div className="flex justify-center p-6">
          <Spinner label="Loading category…" />
        </div>
      )
    }
    return (
      <CategoryForm
        category={editingCategoryQuery.data}
        onSuccess={handleCloseForm}
        onCancel={handleCloseForm}
      />
    )
  })()

  const formModal = (
    <Modal
      open={formOpen}
      onClose={handleCloseForm}
      title={editingCategoryId === null ? 'New category' : 'Edit category'}
    >
      {modalContent}
    </Modal>
  )

  return (
    <aside className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Categories
        </h2>
      </header>

      {/* "All tasks" */}
      {allRow}

      {/* State-based UI branches for the dynamic list */}
      {loadingSpinner}
      {errorMessage}
      {emptyState}
      {categoryList}

      {newCategoryButton}

      {formModal}
    </aside>
  )
}
