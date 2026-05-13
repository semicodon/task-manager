
import {type QueryKey, useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import * as categoriesApi from '../../api/categories'
import type {Category, CategoryCreatePayload, Paginated} from "../../types";
import type {ApiError} from "../../api/client.ts";

// Cache key factory
export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    detail: (id: number) => [...categoryKeys.all, 'detail', id] as const,
}

const TASKS_KEY_PREFIX = ['tasks'] as const

type CategoryListSnapshot = Array<[QueryKey, Paginated<Category> | undefined]>

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoriesApi.listCategories(),
    staleTime: 5 * 60_000,
  })
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getCategory(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()

  return useMutation<
    Category,
    ApiError,
    CategoryCreatePayload>({
      mutationFn: (payload) => categoriesApi.createCategory(payload),
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: categoryKeys.lists() })
  })

}

export function useUpdateCategory() {
  const qc = useQueryClient()

  return useMutation<
    Category,
    ApiError,
    { id: number;
      payload: CategoryCreatePayload },
    { previous: CategoryListSnapshot }
    > ({
    mutationFn: ({ id, payload }) => categoriesApi.updateCategory(id, payload),

    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: categoryKeys.lists() })
      const previous = qc.getQueriesData({
        queryKey: categoryKeys.lists(),
      }) as CategoryListSnapshot

      qc.setQueriesData<Paginated<Category>>(
        { queryKey: categoryKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.map((c) =>
              c.id === id ?
                { ...c, ...payload }
                : c
            ),
          }
        }
      )
      return { previous }
    },

    onError: (
      _err,
      _vars, context
    ) => {
      if (!context) return
      for (const [key, value] of context.previous) {
        qc.setQueryData(key, value)
      }
    },

    onSettled:(
      _data,
      _err,
      { id }
    ) => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() })
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) })
      qc.invalidateQueries({ queryKey: TASKS_KEY_PREFIX })
    }
  })
}
export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation<
    void,
    ApiError,
    number,
    { previous: CategoryListSnapshot }
  >({
    mutationFn: (id) => categoriesApi.deleteCategory(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: categoryKeys.lists() })
      const previous = qc.getQueriesData({
        queryKey: categoryKeys.lists(),
      }) as CategoryListSnapshot

      qc.setQueriesData<Paginated<Category>>(
        { queryKey: categoryKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            count: Math.max(0, old.count - 1),
            results: old.results.filter((c) => c.id !== id),
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
      qc.invalidateQueries({ queryKey: categoryKeys.lists() })
      qc.removeQueries({ queryKey: categoryKeys.detail(id) })
      qc.invalidateQueries({ queryKey: TASKS_KEY_PREFIX })
    },
  })
}
