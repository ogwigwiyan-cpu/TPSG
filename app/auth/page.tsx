'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildProfileRecord, validateRegistrationInput } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const initialRegisterState = {
  firstName: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const initialLoginState = {
  email: '',
  password: '',
}

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [loginValues, setLoginValues] = useState(initialLoginState)
  const [registerValues, setRegisterValues] = useState(initialRegisterState)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      setStatus({ type: 'error', text: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.' })
      return
    }

    setPending(true)
    setStatus(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginValues.email.trim(),
      password: loginValues.password,
    })

    setPending(false)

    if (error) {
      const message = error.message.includes('Invalid login')
        ? 'Incorrect email or password.'
        : error.message.includes('Email not confirmed')
          ? 'Your email has not been confirmed yet.'
          : 'Unable to sign in. Please check your details and try again.'

      setStatus({ type: 'error', text: message })
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handlePasswordReset = async () => {
    const email = loginValues.email.trim()
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      setStatus({ type: 'error', text: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.' })
      return
    }

    if (!email) {
      setStatus({ type: 'error', text: 'Enter your email before requesting a reset link.' })
      return
    }

    setPending(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth`,
    })
    setPending(false)

    if (error) {
      setStatus({ type: 'error', text: 'Unable to send a password reset email. Please confirm the address and try again.' })
      return
    }

    setStatus({ type: 'success', text: 'A password reset email has been sent to your inbox.' })
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      setStatus({ type: 'error', text: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.' })
      return
    }

    const validationResult = validateRegistrationInput(registerValues)
    const nextErrors: Record<string, string> = {}

    Object.entries(validationResult.errors).forEach(([key, value]) => {
      nextErrors[key] = value as string
    })

    setFieldErrors(nextErrors)

    if (!validationResult.isValid) {
      setStatus({ type: 'error', text: 'Please fix the highlighted registration details.' })
      return
    }

    setPending(true)
    setStatus(null)

    const { data, error } = await supabase.auth.signUp({
      email: registerValues.email.trim(),
      password: registerValues.password,
      options: {
        data: {
          first_name: registerValues.firstName.trim(),
          surname: registerValues.surname.trim(),
          full_name: `${registerValues.firstName.trim()} ${registerValues.surname.trim()}`.trim(),
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth`,
      },
    })

    setPending(false)

    if (error) {
      const friendlyError = error.message.includes('already registered')
        ? 'An account already exists for this email address.'
        : 'Registration failed. Please check your details and try again.'

      setStatus({ type: 'error', text: friendlyError })
      return
    }

    if (data.user) {
      const profile = buildProfileRecord(data.user.id, registerValues.firstName, registerValues.surname)
      await supabase.from('profiles').upsert(profile, { onConflict: 'user_id' })
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    setStatus({
      type: 'success',
      text: 'Account created. Check your email to confirm your account before signing in.',
    })
    setMode('login')
    setLoginValues({ email: registerValues.email.trim(), password: '' })
    setRegisterValues(initialRegisterState)
    setFieldErrors({})
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/30">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">Authentication</p>
      <h1 className="mt-3 text-3xl font-bold text-white">Secure access</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        Manage sign-in, registration, and secure access to your private TPSG profile.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === 'login' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === 'register' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
          }`}
        >
          Create account
        </button>
      </div>

      {status ? (
        <div
          className={`mt-6 rounded-xl border p-4 text-sm ${
            status.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              : status.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-sky-500/40 bg-sky-500/10 text-sky-200'
          }`}
        >
          {status.text}
        </div>
      ) : null}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={loginValues.email}
              onChange={(event) => setLoginValues((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none ring-0 transition focus:border-amber-400"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={loginValues.password}
              onChange={(event) => setLoginValues((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none ring-0 transition focus:border-amber-400"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={handlePasswordReset}
              className="text-sm font-medium text-amber-300 hover:text-amber-200"
            >
              Forgot password
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first-name" className="mb-2 block text-sm font-medium text-slate-200">
                First name
              </label>
              <input
                id="first-name"
                type="text"
                value={registerValues.firstName}
                onChange={(event) => setRegisterValues((current) => ({ ...current, firstName: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition focus:border-amber-400"
                placeholder="First name"
              />
              {fieldErrors.firstName ? <p className="mt-2 text-xs text-red-300">{fieldErrors.firstName}</p> : null}
            </div>

            <div>
              <label htmlFor="surname" className="mb-2 block text-sm font-medium text-slate-200">
                Surname
              </label>
              <input
                id="surname"
                type="text"
                value={registerValues.surname}
                onChange={(event) => setRegisterValues((current) => ({ ...current, surname: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition focus:border-amber-400"
                placeholder="Surname"
              />
              {fieldErrors.surname ? <p className="mt-2 text-xs text-red-300">{fieldErrors.surname}</p> : null}
            </div>
          </div>

          <div>
            <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={registerValues.email}
              onChange={(event) => setRegisterValues((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition focus:border-amber-400"
              placeholder="name@example.com"
            />
            {fieldErrors.email ? <p className="mt-2 text-xs text-red-300">{fieldErrors.email}</p> : null}
          </div>

          <div>
            <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              value={registerValues.password}
              onChange={(event) => setRegisterValues((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition focus:border-amber-400"
              placeholder="Create a secure password"
            />
            {fieldErrors.password ? <p className="mt-2 text-xs text-red-300">{fieldErrors.password}</p> : null}
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-200">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={registerValues.confirmPassword}
              onChange={(event) => setRegisterValues((current) => ({ ...current, confirmPassword: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition focus:border-amber-400"
              placeholder="Re-enter the password"
            />
            {fieldErrors.confirmPassword ? <p className="mt-2 text-xs text-red-300">{fieldErrors.confirmPassword}</p> : null}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}
    </div>
  )
}
