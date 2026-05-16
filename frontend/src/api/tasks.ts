// tasks.ts - endpoint functions for /api/tasks
// API call centralization for tasks

import { apiClient } from './client.ts'
import type {
  Task,
  TaskListItem,
  TaskStatus,
  TaskPriority,
  TaskCreatePayload,
  TaskUpdatePayload,
  Paginated,
} from '../types'

//  GET /api/tasks/
//  TaskViewSet: DjangoFilterBackend + SearchFilter
export interface TaskListParams {
  status?: TaskStatus
  priority?: TaskPriority
  category?: number
  ordering?: string
  page?: number
}

// GET /api/tasks/
// Light-weight paginated task list
export async function listTasks(
  params: TaskListParams,
): Promise<Paginated<TaskListItem>> {
  return apiClient.get<Paginated<TaskListItem>>('/tasks/', { params })
}

// GET /api/tasks/{id}/
// full task detail for task_id
export async function getTask(id: number): Promise<Task> {
  return apiClient.get<Task>(`/tasks/${id}/`)
}

// POST /api/tasks/
// create task, return detail shape
export async function createTask(payload: TaskCreatePayload): Promise<Task> {
  return apiClient.post<Task, TaskCreatePayload>('/tasks/', payload)
}

// PATCH /api/tasks/{id}/
// update subset of fields for task_id
export async function updateTask(
  id: number,
  payload: TaskUpdatePayload,
): Promise<Task> {
  return apiClient.patch<Task, TaskUpdatePayload>(`/tasks/${id}/`, payload)
}

// DELETE /api/tasks/{id}/
export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}/`)
}

// POST /api/tasks/{id}/mark-done
// DRF @action on TaskViewSet
export async function markTaskDone(id: number): Promise<Task> {
  return apiClient.post<Task>(`/tasks/${id}/mark-done/`)
}

// GET /api/tasks/summary
export interface TaskSummary {
  total: number
  by_status: Record<string, number>
  by_priority: Record<string, number>
  overdue_count: number
}

export async function getTaskSummary(): Promise<TaskSummary> {
  return apiClient.get<TaskSummary>(`/tasks/summary/`)
}
