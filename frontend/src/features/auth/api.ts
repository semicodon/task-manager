
import { apiClient } from '../../api/client'
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  User,
} from '../../types'

// POST /api/auth/login/  →  { access, refresh }
export async function login(payload: LoginPayload): Promise<AuthTokens> {
  return apiClient.post<AuthTokens, LoginPayload>('/auth/login/', payload)
}

// POST /api/auth/register/  →  { username, email, tokens: { access, refresh } }
export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse, RegisterPayload>(
    '/auth/register/',
    payload
  )
}

// POST /api/auth/refresh/  →  { access, refresh }
export async function refresh(refreshToken: string): Promise<AuthTokens> {
  return apiClient.post<AuthTokens, { refresh: string }>('/auth/refresh/', {
    refresh: refreshToken,
  })
}

// POST /api/auth/logout/  →  204 No Content
export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout/', { refresh: refreshToken })
}

// GET /api/auth/me/  →  User
export async function getMe(): Promise<User> {
  return apiClient.get<User>('/auth/me/')
}
