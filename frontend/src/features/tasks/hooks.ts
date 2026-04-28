
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import * as tasksApi from '../../api/tasks'
import type { TaskListParams } from '../../api/tasks'
import type {
  Task,
  TaskCreatePayload,
  TaskUpdatePayload
} from '../../types'
import type { ApiError } from '../../api/client'


// Cache key Factory
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskListParams)=> [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
  summary: () => [...taskKeys.all, 'summary'] as const
}

// useTasks - fetch paginated list of tasks.
export function useTasks(filters: TaskListParams = {}) {
  const query = useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => tasksApi.listTasks(filters),
    placeholderData: (previous) => previous,
  });
  console.log("React Query State:", query);
  return query;
}

// useTask - fetch single task by id.
export function useTask(id: number) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: Number.isFinite(id) && id > 0
  })
}

//useCreateTask - POST /api/tasks/
export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation<Task, ApiError, TaskCreatePayload>({
    mutationFn: (payload) => tasksApi.createTask(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
      qc.invalidateQueries({ queryKey: taskKeys.summary() })
    },
  })
}

// useUpdateTask - PATCH /api/tasks/{id}/
export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation<Task, ApiError, {id: number; payload: TaskUpdatePayload }
  >({
    mutationFn: ({ id, payload  }) => tasksApi.updateTask(id, payload),
    onSuccess: (updated) => {
      qc.invalidateQueries( {queryKey: taskKeys.lists() })
      qc.setQueryData(taskKeys.detail(updated.id), updated)
    }
  })
}

// useDeleteTask - DELETE /api/tasks/{id}/
export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => tasksApi.deleteTask(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
      qc.removeQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}

// useMarkTaskDone - POST /api/tasks/{id}/mark-done/
export function useMarkTaskDone() {
  const qc = useQueryClient()
  return useMutation<Task, ApiError, number>({
    mutationFn: (id) => tasksApi.markTaskDone(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
      qc.setQueryData(taskKeys.detail(updated.id), updated)
    },
  })
}

