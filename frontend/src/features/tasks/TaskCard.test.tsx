import { describe, it, expect, vi } from 'vitest'

import { TaskCard } from './TaskCard'
import { renderWithProviders, screen, userEvent } from '../../test/test-utils'
import type { TaskListItem } from '../../types'

const fixtureTask: TaskListItem = {
  id: 42,
  title: 'Write the TaskCard test',
  status: 'in_progress',
  priority: 'high',
  due_date: '2026-12-25',
  category: 1,
  category_name: 'Personal',
  category_color: '#6366f1',
  created_at: '2026-04-15T12:00:00Z',
}

describe('TaskCard — display', () => {
  it('renders the task title', () => {
    renderWithProviders(<TaskCard task={fixtureTask} />)
    expect(
      screen.getByRole('heading', {
        name: 'Write the TaskCard test',
      }),
    ).toBeInTheDocument()
  })

  it('shows the human-readable status label', () => {
    renderWithProviders(<TaskCard task={fixtureTask} />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('shows the priority in uppercase', () => {
    renderWithProviders(<TaskCard task={fixtureTask} />)
    expect(screen.getByText('HIGH')).toBeInTheDocument()
  })

  it('shows the category name when one is assigned', () => {
    renderWithProviders(<TaskCard task={fixtureTask} />)
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('omits the category badge entirely when no category', () => {
    const noCategory: TaskListItem = {
      ...fixtureTask,
      category: null,
      category_name: null,
      category_color: null,
    }
    renderWithProviders(<TaskCard task={noCategory} />)
    expect(screen.queryByText('Personal')).toBeNull()
  })
})

describe('TaskCard — interactions', () => {
  it('calls onMarkDone(id) when the Mark done button is clicked', async () => {
    const user = userEvent.setup()
    const onMarkDone = vi.fn() // Record call
    renderWithProviders(<TaskCard task={fixtureTask} onMarkDone={onMarkDone} />)

    await user.click(screen.getByRole('button', { name: /mark done/i }))

    expect(onMarkDone).toHaveBeenCalledWith(42)
  })

  it('calls onDelete(id) when the Delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    renderWithProviders(<TaskCard task={fixtureTask} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(onDelete).toHaveBeenCalledWith(42)
  })

  it('does NOT render the Mark done button for already-done tasks', () => {
    const doneTask: TaskListItem = { ...fixtureTask, status: 'done' }
    renderWithProviders(<TaskCard task={doneTask} onMarkDone={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /mark done/i })).toBeNull()
  })
})
