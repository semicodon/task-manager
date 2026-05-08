
import { useQuery } from '@tanstack/react-query'
import * as categoriesApi from '../../api/categories'

// Cache key factory
export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    detail: (id: number) => [...categoryKeys.all, 'detail', id] as const,
}

// useCategories - load every category for dropdown
export function useCategories() {
    return useQuery ({
        queryKey: categoryKeys.lists(),
        queryFn: () => categoriesApi.listCategories(),
        staleTime: 5 * 60_000,
    })
}