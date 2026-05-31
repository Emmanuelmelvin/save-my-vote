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
import signupSideImage from '@/assets/side.png'

const SignUp: React.FC = () => {
  const [, setLocation] = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<'institution' | 'organisation'>('institution')
  const [organizationName, setOrganizationName] = useState('')
  const setUser = useAuthStore((s) => s.setUser)

  return (
    <AuthLayout
      title="Get Started Now"
      subtitle="Create your account to take part in the voting process and keep your verification flow in one place."
      sideImageSrc={signupSideImage}
      footer={<div className="text-[14px] text-[#6b7280]">Already have an account? <Link href="/login" className="font-medium text-[#3758F9]">Login</Link></div>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SocialButton label="Sign up with Google" icon="google" onClick={() => setLocation('/login')} />
        <SocialButton label="Sign up with Outlook" icon="microsoft" onClick={() => setLocation('/login')} />
      </div>

      <Divider />

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          setUser({ id: 'u_new', name, email, role: 'voter', verified: false })
          setLocation('/login')
        }}
      >
        <TextField id="signup-name" label="Full name" placeholder="Enter your full name" value={name} onChange={setName} autoComplete="name" />
        <TextField id="signup-email" label="Email" type="email" placeholder="Enter your email" value={email} onChange={setEmail} autoComplete="email" />
        <PasswordField id="signup-password" label="Password" value={password} onChange={setPassword} />
        <RadioGroup label="Do you represent an institution or organisation?" value={accountType} onChange={setAccountType} />
        <TextField
          id="signup-organisation"
          label={accountType === 'institution' ? 'Institution name' : 'Organisation name'}
          placeholder={accountType === 'institution' ? 'Enter institution name' : 'Enter organisation name'}
          value={organizationName}
          onChange={setOrganizationName}
        />
        <PrimaryButton type="submit">Sign up</PrimaryButton>
      </form>
    </AuthLayout>
  )
}

export default SignUp
