import React, { useState } from 'react'
import { Link, useLocation } from 'wouter'
import AuthLayout from '@/components/AuthLayout'
import {
  Divider,
  PasswordField,
  PrimaryButton,
  RadioGroup,
  SocialButton,
  TextField,
} from '@/components/AuthControls'
import useAuthStore from '@/store/auth'

const SignUp: React.FC = () => {
  const [, setLocation] = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<'institution' | 'organisation'>('organisation')
  const [organizationName, setOrganizationName] = useState('')
  const setUser = useAuthStore((s) => s.setUser)
  const [agree, setAgree] = useState(false)

  return (
    <AuthLayout
      title="Get Started Now"
      subtitle="Create your account to take part in the voting process and keep your verification flow in one place."
      illustration="signup"
      footer={<div className="text-[14px] text-[#18203a]">Already have an account? <Link href="/login" className="font-medium text-[#1050ff]">Login</Link></div>}
    >
      <div className="w-full max-w-[550px] space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SocialButton label="Sign up with Google" icon="google" onClick={() => setLocation('/login')} />
          <SocialButton label="Sign up with Outlook" icon="microsoft" onClick={() => setLocation('/login')} />
        </div>

        <Divider />

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!agree) return
            setUser({ id: 'u_new', name, email, role: 'voter', verified: false })
            setLocation('/login')
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            <TextField id="signup-name" label="Full name" required placeholder="Enter your full name" value={name} onChange={setName} autoComplete="name" />
            <TextField id="signup-email" label="Email" required type="email" placeholder="Enter your Email" value={email} onChange={setEmail} autoComplete="email" />
            <PasswordField id="signup-password" label="Password" required value={password} onChange={setPassword} />
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

          <PrimaryButton type="submit" disabled={!agree}>Sign up</PrimaryButton>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp
