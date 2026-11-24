import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation } from 'wouter'
import { toast } from 'sonner'
import AuthLayout from '@/components/AuthLayout'
import {
  Divider,
  PasswordField,
  PrimaryButton,
  RadioGroup,
  SocialButton,
  TextField,
} from '@/components/AuthControls'
import { ApiError } from '@/lib/api/client'
import { api } from '@/lib/api/services'
import { errorMessage } from '@/lib/format'

const SignUp: React.FC = () => {
  const [, setLocation] = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<'institution' | 'organisation'>('organisation')
  const [organizationName, setOrganizationName] = useState('')
  const [agree, setAgree] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const signUp = useMutation({
    mutationFn: () =>
      api.auth.signUp({
        fullName: name.trim(),
        email: email.trim(),
        password,
        organizationType: accountType,
        organizationName: organizationName.trim() || undefined,
      }),
    onSuccess: () => setLocation(`/check-email?email=${encodeURIComponent(email.trim())}`),
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setFieldErrors({ email: 'An account with this email already exists. Try logging in.' })
        return
      }
      toast.error(errorMessage(error))
    },
  })

  return (
    <AuthLayout
      title="Get Started Now"
      subtitle="Create an organiser account to set up and run your elections. Voters don’t need an account."
      illustration="signup"
      footer={<div className="text-[14px] text-[#18203a]">Already have an account? <Link href="/login" className="font-medium text-[#1050ff]">Login</Link></div>}
    >
      <div className="w-full max-w-[550px] space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SocialButton label="Sign up with Google" icon="google" onClick={() => window.location.assign(api.auth.googleSignInUrl())} />
          <SocialButton label="Sign up with Outlook" icon="microsoft" onClick={() => toast.info('Outlook sign-in is coming soon. Use Google or email for now.')} />
        </div>

        <Divider />

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!agree || signUp.isPending) return
            if (password.length < 8) {
              setFieldErrors({ password: 'Use at least 8 characters.' })
              return
            }
            setFieldErrors({})
            signUp.mutate()
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            <TextField id="signup-name" label="Full name" required placeholder="Enter your full name" value={name} onChange={setName} autoComplete="name" />
            <TextField id="signup-email" label="Email" required type="email" placeholder="Enter your Email" value={email} onChange={setEmail} autoComplete="email" error={fieldErrors.email} />
            <PasswordField id="signup-password" label="Password" required value={password} onChange={setPassword} error={fieldErrors.password} />
            <RadioGroup label="Do you represent an institution or organisation?" value={accountType} onChange={setAccountType} />
            <TextField
              id="signup-organisation"
              label={accountType === 'institution' ? 'Institution name' : 'Organisation name'}
              required
              placeholder={accountType === 'institution' ? 'Enter your institution name' : "Enter your organisation's name"}
              value={organizationName}
              onChange={setOrganizationName}
            />
          </div>

          <div className="flex items-start gap-3 pt-1">
            <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#d1d5db] text-[#1050ff] focus:ring-[#1050ff]" />
            <label htmlFor="agree" className="text-[14px] leading-6 text-[#6b7280]">By creating an account you agree to our <a href="/terms" className="font-medium text-[#1050ff]">Terms</a> and <a href="/privacy" className="font-medium text-[#1050ff]">Privacy Policy</a>.</label>
          </div>

          <PrimaryButton type="submit" disabled={!agree || signUp.isPending}>
            {signUp.isPending ? 'Creating your account…' : 'Sign up'}
          </PrimaryButton>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp
