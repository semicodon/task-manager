const ACCESS_KEY = 'auth.access'
const REFRESH_KEY = 'auth.refresh'

export const tokens = {
  /** Read the stored access token, or null if not set. */
  getAccess(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(ACCESS_KEY)
  },

  /** Read the stored refresh token, or null if not set. */
  getRefresh(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(REFRESH_KEY)
  },

  /** Convenience check: do we have any access token at all */
  hasAccess(): boolean {
    return this.getAccess() !== null
  },

  /** Save both tokens. Called after login, register, and successful refresh. */
  save(access: string, refresh: string): void {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ACCESS_KEY, access)
    window.localStorage.setItem(REFRESH_KEY, refresh)
  },

  /** Wipe both tokens. Called on logout or when the refresh token is rejected. */
  clear(): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(ACCESS_KEY)
    window.localStorage.removeItem(REFRESH_KEY)
  },
}
