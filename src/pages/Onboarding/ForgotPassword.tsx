import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import AuthLayout from '@/components/AuthLayout'
import { OtpInput, PasswordField, PrimaryButton, TextField } from '@/components/AuthControls'
import useAuthStore from '@/store/auth'
import forgotSideImage from '@/assets/side.png'

type ForgotStep = 'request' | 'verify' | 'reset'

const ForgotPassword: React.FC = () => {
  const [, setLocation] = useLocation()
  const [step, setStep] = useState<ForgotStep>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(45)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const sendReset = useAuthStore((s) => s.requestPasswordReset)
  const verifyOTP = useAuthStore((s) => s.verifyOTP)

  useEffect(() => {
    if (step !== 'verify' || countdown <= 0) return

    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, step])

  const stepTitle = {
    request: 'Forgot Password',
    verify: 'Verify your Email address',
    reset: 'New Password',
  }[step]

  const stepSubtitle = {
    request: 'Enter the email address linked to your account and we’ll send you a one-time verification code.',
    verify: `We’ve sent you a 4-digit verification code to ${email || 'your email address'}.`,
    reset: undefined,
  }[step]

  return (
    <AuthLayout title={stepTitle} subtitle={stepSubtitle} sideImageSrc={forgotSideImage}>
      <div className="w-full max-w-[520px] space-y-8">
        {step === 'request' ? (
          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault()
              sendReset(email)
              setCode('')
              setCountdown(45)
              setStep('verify')
            }}
          >
            <TextField
              id="reset-email"
              label="Email"
              required
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />

            <PrimaryButton type="submit">Send OTP</PrimaryButton>
          </form>
        ) : null}

        {step === 'verify' ? (
          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault()
              verifyOTP(code)
              setNewPassword('')
              setConfirmPassword('')
              setPasswordError('')
              setStep('reset')
            }}
          >
            <div className="space-y-4">
              <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="inline-flex text-[14px] font-medium text-[#1050ff]">
                Open Gmail
              </a>

              <div className="space-y-4">
                <label className="text-[15px] font-medium text-[#18203a]">Enter Code</label>
                <OtpInput value={code} onChange={setCode} />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[14px] text-[#374151]">
                Didn’t get a verification code?{' '}
                <button
                  type="button"
                  className="font-medium text-[#1050ff] disabled:cursor-not-allowed disabled:text-[#9ca3af]"
                  disabled={countdown > 0}
                  onClick={() => {
                    sendReset(email)
                    setCode('')
                    setCountdown(45)
                  }}
                >
                  Resend Code
                </button>{' '}
                <span aria-live="polite" className="font-medium text-[#9ca3af]">
                  0:{countdown.toString().padStart(2, '0')}
                </span>
              </p>

              <PrimaryButton type="submit">Verify Code</PrimaryButton>
            </div>
          </form>
        ) : null}

        {step === 'reset' ? (
          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault()

              if (!newPassword || newPassword !== confirmPassword) {
                setPasswordError('Passwords do not match.')
                return
              }

              setPasswordError('')
              setLocation('/login')
            }}
          >
            <div className="space-y-5">
              <PasswordField id="new-password" label="Password" required value={newPassword} onChange={setNewPassword} error={passwordError} />
              <PasswordField id="confirm-password" label="Confirm Password" required value={confirmPassword} onChange={setConfirmPassword} />
            </div>

            <PrimaryButton type="submit">Update password</PrimaryButton>
          </form>
        ) : null}
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword