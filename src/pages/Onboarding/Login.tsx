import React, { useState } from 'react'
import { Link } from 'wouter'
import useAuthStore from '@/store/auth'
import AuthLayout from '@/components/AuthLayout'
import { 
  Divider, 
  HelperLink, 
  PasswordField, 
  PrimaryButton, 
  SocialButton, 
  TextField
 } from '@/components/AuthControls'
import loginSideImage from '@/assets/side.png'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const sendOTP = useAuthStore((s) => s.sendOTP)

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Sign in to continue managing your registration and verify your details securely."
      sideImageSrc={loginSideImage}
      footer={<div className="text-[14px] text-[#6b7280]">New here? <Link href="/signup" className="font-medium text-[#3758F9]">Create an account</Link></div>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SocialButton label="Continue with Google" icon="google" onClick={() => sendOTP(email)} />
        <SocialButton label="Continue with Outlook" icon="microsoft" onClick={() => sendOTP(email)} />
      </div>

      <Divider />

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          sendOTP(email)
        }}
      >
        <TextField id="login-email" label="Email" type="email" placeholder="Enter your email" value={email} onChange={setEmail} autoComplete="email" />
        <PasswordField id="login-password" label="Password" value={password} onChange={setPassword} />
        <HelperLink href="/forgot-password" label="Forgot password?" align="right" />
        <PrimaryButton type="submit">Login</PrimaryButton>
      </form>
    </AuthLayout>
  )
}

export default Login
