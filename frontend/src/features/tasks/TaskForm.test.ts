import { describe, it, expect } from 'vitest'

import { buildDefaults, toApiPayload } from './TaskForm'
import type { Task } from '../../types'

const fixtureTask: Task = {
  id: 7,
  title: 'Existing task',
  description: 'Some details',
  status: 'in_progress',
  status_display: 'In Progress',
  priority: 'high',
  priority_display: 'High',
  due_date: '2026-06-01',
  is_overdue: false,
  category: 2,
  category_detail: null,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-15T00:00:00Z',
}

describe('buildDefaults', () => {
  it('returns empty defaults when no task is passed (create mode)', () => {
    expect(buildDefaults()).toEqual({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      category: 0,
    })
  })

  it('pre-fills form fields from a task (edit mode)', () => {
    expect(buildDefaults(fixtureTask)).toEqual({
      title: 'Existing task',
      description: 'Some details',
      status: 'in_progress',
      priority: 'high',
      due_date: '2026-06-01',
      category: 2,
    })
  })

  it('maps null fields to the form sentinels', () => {
    const nullable: Task = {
      ...fixtureTask,
      description: '',
      due_date: null,
      category: null,
    }
    const result = buildDefaults(nullable)
    expect(result.due_date).toBe('')
    expect(result.category).toBe(0)
  })
})

describe('toApiPayload', () => {
  it('converts the form sentinels back to nulls for the API', () => {
    const formValues = {
      title: 'New task',
      description: '',
      status: 'todo' as const,
      priority: 'medium' as const,
      due_date: '',
      category: 0,
    }
    expect(toApiPayload(formValues)).toEqual({
      title: 'New task',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: null, // "" → null
      category: null, // 0 → null
    })
  })

  it('passes valid date strings through unchanged', () => {
    const out = toApiPayload({
      title: 'X',
      description: '',
      status: 'todo' as const,
      priority: 'low' as const,
      due_date: '2026-12-25',
      category: 3,
    })
    expect(out.due_date).toBe('2026-12-25')
    expect(out.category).toBe(3)
  })

  it('trims leading/trailing whitespace from title and description', () => {
    const out = toApiPayload({
      title: '  My task  ',
      description: '\nWith details\n',
      status: 'todo' as const,
      priority: 'low' as const,
      due_date: '',
      category: 0,
    })
    expect(out.title).toBe('My task')
    expect(out.description).toBe('With details')
  })
})
