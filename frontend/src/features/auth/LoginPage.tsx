import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'

import { useAuth } from './AuthProvider'
import { LoginSchema } from './schema'
import type { LoginValues } from './schema'
import type { ApiError } from '../../api/client'

export function LoginPage() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: '', password: '' },
    mode: 'onBlur',
  })

  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.fieldErrors) {
        for (const [field, messages] of Object.entries(apiError.fieldErrors)) {
          form.setError(field as keyof LoginValues, {
            type: 'server',
            message: Array.isArray(messages) ? messages.join(' ') : String(messages),
          })
        }
      } else {
        form.setError('root', { type: 'server', message: apiError.message })
      }
    } finally {
      setSubmitting(false)
    }
  })
  const errorFor = (field: keyof LoginValues) => {
    const message = form.formState.errors[field]?.message
    return message ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {message}
      </p>
    ) : null
  }

  const inputClass =
    'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ' +
    'text-slate-900 shadow-sm placeholder:text-slate-400 ' +
    'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  const usernameField = (
    <div>
      <label htmlFor="username" className={labelClass}>
        Username
      </label>
      <input
        id="username"
        type="text"
        autoFocus
        autoComplete="username"
        placeholder="alice"
        className={inputClass}
        {...form.register('username')}
      />
      {errorFor('username')}
    </div>
  )

  const passwordField = (
    <div>
      <label htmlFor="password" className={labelClass}>
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        className={inputClass}
        {...form.register('password')}
      />
      {errorFor('password')}
    </div>
  )

  const rootError = form.formState.errors.root && (
    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
      {form.formState.errors.root.message}
    </p>
  )

  const submitButton = (
    <button
      type="submit"
      disabled={submitting}
      className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {submitting ? 'Signing in…' : 'Sign in'}
    </button>
  )

  const registerLink = (
    <p className="text-center text-sm text-slate-500">
      Don&apos;t have an account?{' '}
      <Link
        to="/register"
        className="font-medium text-indigo-600 hover:text-indigo-800"
      >
        Create one
      </Link>
    </p>
  )
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Task Manager · Episode 3</p>
        </header>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {usernameField}
          {passwordField}
          {rootError}
          {submitButton}
        </form>

        {registerLink}
      </div>
    </div>
  )
}
