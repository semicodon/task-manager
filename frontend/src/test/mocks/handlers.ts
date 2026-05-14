
import { http, HttpResponse } from 'msw'
import type { Category, Paginated, Task, TaskListItem } from '../../types'

// Fixtures
export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Personal',
    description: '',
    color: '#6366f1',
    task_count: 2,
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Work',
    description: 'Things from the day job',
    color: '#10b981',
    task_count: 1,
    created_at: '2026-04-02T00:00:00Z',
  },
]

export const mockTaskList: TaskListItem[] = [
  {
    id: 1,
    title: 'Buy groceries',
    status: 'todo',
    priority: 'high',
    due_date: '2026-04-30',
    category: 1,
    category_name: 'Personal',
    category_color: '#6366f1',
    created_at: '2026-04-15T12:00:00Z',
  },
  {
    id: 2,
    title: 'Review PR #123',
    status: 'in_progress',
    priority: 'medium',
    due_date: null,
    category: 2,
    category_name: 'Work',
    category_color: '#10b981',
    created_at: '2026-04-16T09:00:00Z',
  },
  {
    id: 3,
    title: 'Take out the trash',
    status: 'done',
    priority: 'low',
    due_date: null,
    category: 1,
    category_name: 'Personal',
    category_color: '#6366f1',
    created_at: '2026-04-14T20:00:00Z',
  },
]

function paginate<T>(items: T[]): Paginated<T> {
  return {
    count: items.length,
    next: null,
    previous: null,
    results: items }
}

export const handlers = [
  http.get('*/api/tasks/', ({ request }) => {

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')

    let results = mockTaskList
    if (status) results = results.filter(
      (t) => t.status === status
    )
    if (category) results = results.filter(
      (t) => t.category === Number(category)
    )

    return HttpResponse.json(paginate(results))
  }),


  http.get('*/api/tasks/:id/', (
    { params }) => {
    const task = mockTaskList.find(
      (t) => t.id === Number(params.id)
    )
    if (!task) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(task)
  }),

  // POST /api/tasks/ — create
  http.post('*/api/tasks/', async (
    { request }) => {
    const body = (await request.json()) as Partial<Task>
    const created = { ...body, id: 999, created_at: new Date().toISOString() }
    return HttpResponse.json(created, { status: 201 })
  }),

  // PATCH /api/tasks/{id}/ — update
  http.patch('*/api/tasks/:id/', async (
    { request, params }) => {
    const body = (await request.json()) as Partial<Task>
    const updated = { ...body, id: Number(params.id) }
    return HttpResponse.json(updated)
  }),

  // DELETE /api/tasks/{id}/
  http.delete('*/api/tasks/:id/', () => new HttpResponse(null, { status: 204 })),

  // POST /api/tasks/{id}/mark-done/
  http.post('*/api/tasks/:id/mark-done/', (
    { params }) => {
    const task = mockTaskList.find((t) => t.id === Number(params.id))
    if (!task) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ ...task, status: 'done' })
  }),

  // GET /api/categories/
  http.get('*/api/categories/', () => HttpResponse.json(paginate(mockCategories))),

  // GET /api/categories/{id}/
  http.get('*/api/categories/:id/', (
    { params }) => {
    const cat = mockCategories.find((c) => c.id === Number(params.id))
    if (!cat) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(cat)
  }),
]
