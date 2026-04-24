/**
 * Shared TypeScript types for the Task Manager app.
 * choices (display) & types
 * serializer & interface
 */


// ─── Category ────────────────────────────────────────────────────────────────

/**
 * CategorySerializer
 * - interface Category
 */
export interface Category {
    id: number
    name: string
    description: string
    color: string
    task_count: number
    created_at: string
}

/**
 * Category Payloads
 * - type CategoryCreatePayload
* - type    `!
 */
export type CategoryCreatePayload = Pick<Category, 'name' | 'description' | 'color'>
export type CategoryUpdatePayload = Partial<CategoryCreatePayload>

// ─── Task ────────────────────────────────────────────────────────────────

/**
 * Enums from Django's Task.Status, Task.Priority
 * - type TaskStatus
 * - type TaskPriority
 */
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

/**
 * TaskSerializer
 * - interface Task
 */
export interface Task {
    id: number
    title: string
    description: string
    status: TaskStatus
    status_display: string
    priority: TaskPriority
    priority_display: string
    due_date: string
    is_overdue: boolean
    category: number | null
    category_detail: Category | null
    created_at: string
    updated_at: string
}

/**
 * TaskListSerializer
 * - interface TaskListItem
 */
export interface TaskListItem {
    id: number
    title: string
    status: TaskStatus
    priority: TaskPriority
    due_date: string | null
    category: number | null
    category_color: string | null
    created_at: string
}

/**
 * Task Payloads
 * - interface TaskCreatePayload
 * - type TaskUpdatePayload
 */
export interface TaskCreatePayload {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    due_date?: string | null
    category?: number | null
}
export type TaskUpdatePayload = Partial<TaskCreatePayload>



// ─── Paginated Responses ────────────────────────────────────────────────────────────────
/**
 * interface Paginated
 */
export interface Paginated<T>{
    count: number
    next: string | null
    previous: string | null
    results: T[]
}
