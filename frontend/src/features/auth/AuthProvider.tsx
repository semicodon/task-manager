import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import * as authApi from './api'
import { apiClient } from '../../api/client'
import { tokens } from '../../lib/tokens'
import type { LoginPayload, RegisterPayload, User } from '../../types'



interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiClient.setOnAuthFailure(() => {
      tokens.clear()
      setUser(null)
    })
  }, [])

  useEffect(() => {
    if (!tokens.hasAccess()) {
      setIsLoading(false)
      return
    }
    authApi
      .getMe()
      .then(setUser)
      .catch(() => {
        tokens.clear()
      })
      .finally(() => setIsLoading(false))
  }, [])


  const login = useCallback(async (payload: LoginPayload) => {
    const t = await authApi.login(payload)
    tokens.save(t.access, t.refresh)
    const me = await authApi.getMe()
    setUser(me)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authApi.register(payload)
    tokens.save(response.tokens.access, response.tokens.refresh)
    const me = await authApi.getMe()
    setUser(me)
  }, [])

  const logout = useCallback(async () => {
    const refresh = tokens.getRefresh()
    try {
      if (refresh) await authApi.logout(refresh)
    } catch {
    }
    tokens.clear()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return ctx
}
