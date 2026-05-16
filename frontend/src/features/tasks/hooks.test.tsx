import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

import { useTasks } from './hooks'
import { server } from '../../test/mocks/server'
import { mockTaskList } from '../../test/mocks/handlers'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useTasks', () => {
  it('returns isLoading initially, then resolves to a paginated list', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper() })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.count).toBe(mockTaskList.length)
    expect(result.current.data?.results).toHaveLength(mockTaskList.length)
    expect(result.current.data?.results[0].title).toBe('Buy groceries')
  })

  it('passes filters as query params (server-side filtering)', async () => {
    const { result } = renderHook(() => useTasks({ status: 'todo' }), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].status).toBe('todo')
  })

  it('returns isError when the server returns a 500', async () => {
    server.use(http.get('*/api/tasks/', () => new HttpResponse(null, { status: 500 })))

    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.status).toBe(500)
  })
})
