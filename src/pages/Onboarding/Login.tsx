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
      illustration="signup"
      sideImageSrc={loginSideImage}
      footer={<div className="text-[14px] text-[#6b7280]">New here? <Link href="/signup" className="font-medium text-[#1050ff]">Create an account</Link></div>}
    >
      <div className="w-full max-w-[520px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SocialButton label="Login with Google" icon="google" onClick={() => sendOTP(email)} />
          <SocialButton label="Login with Outlook" icon="microsoft" onClick={() => sendOTP(email)} />
        </div>

        <Divider />

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            sendOTP(email)
          }}
        >
          <TextField id="login-email" label="Email" required type="email" placeholder="Enter your Email" value={email} onChange={setEmail} autoComplete="email" />
          <PasswordField id="login-password" label="Password" required value={password} onChange={setPassword} />
          <div className="flex justify-end">
            <HelperLink href="/forgot-password" label="Forget password?" align="right" />
          </div>

          <PrimaryButton type="submit">Login</PrimaryButton>
        </form>

        <div className="mt-6 text-center text-sm text-[#374151]">Don't have an account? <Link href="/signup" className="font-medium text-[#1050ff]">Sign up</Link></div>
      </div>
    </AuthLayout>
  )
}

export default Login
