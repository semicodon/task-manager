// categories.ts -> endpoint functions for /api/categories/
// API call centralization for categories

import { apiClient } from './client'
import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  Paginated,
} from '../types'

// GET api/categories/
export async function listCategories(): Promise<Paginated<Category>> {
  return apiClient.get<Paginated<Category>>('/categories/')
}

// GET api/categories/{id}
export async function getCategory(id: number): Promise<Category> {
  return apiClient.get<Category>(`/categories/${id}/`)
}

// POST api/categories/
export async function createCategory(
  payload: CategoryCreatePayload,
): Promise<Category> {
  return apiClient.post<Category, CategoryCreatePayload>('/categories/', payload)
}

// PATCH api/categories/{id}/
export async function updateCategory(
  id: number,
  payload: CategoryUpdatePayload,
): Promise<Category> {
  return apiClient.patch<Category, CategoryUpdatePayload>(`/categories/${id}/`, payload)
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}/`)
}
