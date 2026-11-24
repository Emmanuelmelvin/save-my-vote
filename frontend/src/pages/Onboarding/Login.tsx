import React, { useEffect, useState } from 'react'
import { Link, useLocation, useSearch } from 'wouter'
import { toast } from 'sonner'
import AuthLayout from '@/components/AuthLayout'
import {
  Divider,
  HelperLink,
  PasswordField,
  PrimaryButton,
  SocialButton,
  TextField,
} from '@/components/AuthControls'
import { ApiError } from '@/lib/api/client'
import { useLogin } from '@/lib/api/hooks'
import { api } from '@/lib/api/services'
import { errorMessage } from '@/lib/format'

const Login: React.FC = () => {
  const [, setLocation] = useLocation()
  const search = useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const login = useLogin()

  // The verification email links to the API, which redirects here with ?verified=...
  useEffect(() => {
    const verified = new URLSearchParams(search).get('verified')
    if (verified === 'true') toast.success('Email verified. You can log in now.')
    if (verified === 'false') toast.error('That verification link is invalid or has expired. Log in to request a new one.')
  }, [search])

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Log in to set up, run and follow your elections."
      illustration="signup"
      footer={<div className="text-[14px] text-[#6b7280]">New here? <Link href="/signup" className="font-medium text-[#1050ff]">Create an account</Link></div>}
    >
      <div className="w-full max-w-[520px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SocialButton label="Login with Google" icon="google" onClick={() => window.location.assign(api.auth.googleSignInUrl())} />
          <SocialButton label="Login with Outlook" icon="microsoft" onClick={() => toast.info('Outlook sign-in is coming soon. Use Google or email for now.')} />
        </div>

        <Divider />

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            setFormError('')
            login.mutate(
              { email: email.trim(), password },
              {
                onSuccess: () => setLocation('/dashboard'),
                onError: (error) => {
                  if (error instanceof ApiError && error.status === 403) {
                    setLocation(`/check-email?email=${encodeURIComponent(email.trim())}`)
                    toast.info('Please verify your email address first.')
                    return
                  }
                  setFormError(errorMessage(error))
                },
              },
            )
          }}
        >
          <TextField id="login-email" label="Email" required type="email" placeholder="Enter your Email" value={email} onChange={setEmail} autoComplete="email" />
          <PasswordField id="login-password" label="Password" required value={password} onChange={setPassword} error={formError} placeholder="Enter your password" autoComplete="current-password" />
          <div className="flex justify-end">
            <HelperLink href="/forgot-password" label="Forgot password?" align="right" />
          </div>

          <PrimaryButton type="submit" disabled={login.isPending}>
            {login.isPending ? 'Logging in…' : 'Login'}
          </PrimaryButton>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Login
