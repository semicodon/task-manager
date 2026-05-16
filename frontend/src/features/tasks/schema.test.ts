import { describe, it, expect } from 'vitest'

import { TaskFormSchema } from './schema'

// Test payload
const validInput = {
  title: 'Write tests',
  description: '',
  status: 'todo' as const,
  priority: 'medium' as const,
  due_date: '',
  category: 0,
}

describe('TaskFormSchema — happy path', () => {
  it('accepts a complete, valid payload', () => {
    const result = TaskFormSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('fills defaults when optional fields are omitted', () => {
    const result = TaskFormSchema.safeParse({ title: 'A new task' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.status).toBe('todo')
    expect(result.data.priority).toBe('medium')
    expect(result.data.description).toBe('')
    expect(result.data.due_date).toBe('')
    expect(result.data.category).toBe(0)
  })

  it('trims whitespace from the title', () => {
    const result = TaskFormSchema.safeParse({
      ...validInput,
      title: '  trimmed title   ',
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.title).toBe('trimmed title')
  })
})

describe('TaskFormSchema — rejection cases', () => {
  it('rejects titles shorter than 3 characters', () => {
    const result = TaskFormSchema.safeParse({ ...validInput, title: 'ab' })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0].path).toEqual(['title'])
  })

  it('rejects priority values outside the enum', () => {
    const result = TaskFormSchema.safeParse({
      ...validInput,
      priority: 'urgent',
    })
    expect(result.success).toBe(false)
  })

  it('rejects malformed dates', () => {
    const result = TaskFormSchema.safeParse({
      ...validInput,
      due_date: 'not-a-date',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0].path).toEqual(['due_date'])
  })

  it('accepts empty string for due_date (meaning "no due date")', () => {
    const result = TaskFormSchema.safeParse({ ...validInput, due_date: '' })
    expect(result.success).toBe(true)
  })

  it('accepts a valid YYYY-MM-DD date', () => {
    const result = TaskFormSchema.safeParse({
      ...validInput,
      due_date: '2026-12-31',
    })
    expect(result.success).toBe(true)
  })
})
