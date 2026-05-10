
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'

import * as tasksApi from '../../api/tasks'
import type { TaskListParams } from '../../api/tasks'
import type {
  Task,
  TaskCreatePayload, TaskListItem,
  TaskUpdatePayload,
  Paginated
} from '../../types'
import type { ApiError } from '../../api/client'


type ListSnapshot = Array<[QueryKey, Paginated<TaskListItem> | undefined]>

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
  return useMutation<Task, ApiError, {
    id: number;
    payload: TaskUpdatePayload
  },  { previous: ListSnapshot }
  >({
    mutationFn: ({ id, payload }) => tasksApi.updateTask(id, payload),

    onMutate: async({ id, payload }) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() })
      const previous = qc.getQueriesData({queryKey: taskKeys.lists()}) as ListSnapshot

      qc.setQueriesData<Paginated<TaskListItem>>(
        { queryKey: taskKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.map((task) => {
              if (task.id !== id) return task
              return { ...task, ...payload } as TaskListItem
            }),
          }
        }
      )
      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (!context) return
      for (const [key,value] of context.previous) {
        qc.setQueryData(key, value)
      }
    },

    onSettled: (_data, _error, { id } ) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}

// useDeleteTask - DELETE /api/tasks/{id}/
export function useDeleteTask() {
  const qc = useQueryClient()

  return useMutation<void, ApiError, number, { previous: ListSnapshot }>({
    mutationFn: (id) => tasksApi.deleteTask(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() })
      const previous = qc.getQueriesData({ queryKey: taskKeys.lists() }) as ListSnapshot

      qc.setQueriesData<Paginated<TaskListItem>>(
        { queryKey: taskKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            count: Math.max(0, old.count - 1),
            results: old.results.filter((t) => t.id !== id),
          }
        }
      )

      return { previous }
    },

    onError: (_err, _id, context) => {
      if (!context) return
      for (const [key, value] of context.previous) {
        qc.setQueryData(key, value)
      }
    },

    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
      qc.removeQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}

// useMarkTaskDone - POST /api/tasks/{id}/mark-done/
export function useMarkTaskDone() {
  const qc = useQueryClient()

  return useMutation<Task, ApiError, number, { previous: ListSnapshot }>({
    mutationFn: (id) => tasksApi.markTaskDone(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() })
      const previous = qc.getQueriesData({ queryKey: taskKeys.lists() }) as ListSnapshot

      qc.setQueriesData<Paginated<TaskListItem>>(
        { queryKey: taskKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.map((task) =>
              task.id === id ?
                { ...task, status: 'done' as const }
                : task
            ),
          }
        }
      )
      return { previous }
    },

    onError: (_err, _id, context) => {
      if (!context) return
      for (const [key, value] of context.previous) {
        qc.setQueryData(key, value)
      }
    },

    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}


