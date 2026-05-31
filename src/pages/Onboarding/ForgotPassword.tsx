import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'wouter'
import AuthLayout from '@/components/AuthLayout'
import { Card } from '@/components/ui/card'
import { HelperLink, OtpInput, PasswordField, PrimaryButton, TextField } from '@/components/AuthControls'
import { Button } from '@/components/ui/button'
import useAuthStore from '@/store/auth'
import forgotSideImage from '@/assets/side.png'
import loadingLogo from '@/assets/image.png'

type ForgotStep = 'request' | 'verify' | 'reset' | 'done'

type LoadingModalProps = {
  open: boolean
  message: string
}

const LoadingModal: React.FC<LoadingModalProps> = ({ open, message }) => {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] bg-white/70 backdrop-blur-sm">
      <div className="flex w-[280px] flex-col items-center rounded-[24px] border border-white/70 bg-white px-8 py-7 text-center shadow-[0_30px_80px_rgba(17,21,40,0.16)]">
        <img src={loadingLogo} alt="Save our vote" className="h-12 w-auto animate-pulse object-contain" />
        <div className="mt-6 h-11 w-11 rounded-full border-4 border-[#3758F9]/15 border-t-[#3758F9] animate-spin" />
        <p className="mt-4 text-[14px] text-[#6b7280]">{message}</p>
      </div>
    </div>
  )
}

const ForgotPassword: React.FC = () => {
  const [, setLocation] = useLocation()
  const transitionTimer = useRef<number | null>(null)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [countdown, setCountdown] = useState(45)
  const [step, setStep] = useState<ForgotStep>('request')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Please wait')
  const sendReset = useAuthStore((s) => s.requestPasswordReset)
  const verifyOTP = useAuthStore((s) => s.verifyOTP)

  useEffect(() => {
    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current)
      transitionTimer.current = null
    }

    return () => {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (step !== 'verify' || countdown <= 0) return

    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, step])

  const transitionTo = (nextStep: ForgotStep, message: string, delay = 1100) => {
    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current)
    }

    setLoadingMessage(message)
    setLoading(true)
    transitionTimer.current = window.setTimeout(() => {
      setStep(nextStep)
      setLoading(false)
      transitionTimer.current = null

      if (nextStep === 'verify') {
        setCode('')
        setCountdown(45)
      }

      if (nextStep === 'reset') {
        setNewPassword('')
        setConfirmPassword('')
      }

      if (nextStep === 'done') {
        setNewPassword('')
        setConfirmPassword('')
      }
    }, delay)
  }

  const stepTitle = {
    request: 'Forgot Password',
    verify: 'Verify your Email address',
    reset: 'Set a new password',
    done: 'Password updated',
  }[step]

  const stepSubtitle = {
    request: 'Enter the email address linked to your account and we’ll send you a one-time verification code.',
    verify: `We’ve sent you a 4-digit verification code to ${email || 'your email address'}. Open Gmail to retrieve it.`,
    reset: 'Create a new password and confirm it to finish updating your account.',
    done: 'Your password has been updated. You can now log in with the new credentials.',
  }[step]

  const footer = (
    <div className="text-[14px] text-[#6b7280]">
      {step === 'done' ? 'Ready to log in? ' : 'Remembered your password? '}
      <Link href="/login" className="font-medium text-[#3758F9]">
        Back to login
      </Link>
    </div>
  )

  return (
    <AuthLayout
      title={stepTitle}
      subtitle={stepSubtitle}
      sideImageSrc={forgotSideImage}
      footer={footer}
    >
      <div className="relative">
        <LoadingModal open={loading} message={loadingMessage} />

        <div className="max-w-md">
          <Card className="bg-white rounded-xl p-6 border border-[#E3E3E3] shadow-sm">
            {step === 'request' ? (
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault()
                  sendReset(email)
                  transitionTo('verify', 'Sending verification code...')
                }}
              >
                <TextField id="reset-email" label="Email" type="email" placeholder="Enter your email" value={email} onChange={setEmail} autoComplete="email" />
                <PrimaryButton type="submit">Send OTP</PrimaryButton>
              </form>
            ) : null}

            {step === 'verify' ? (
              <form
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault()
                  verifyOTP(code)
                  transitionTo('reset', 'Verifying code...')
                }}
              >
                <div className="space-y-3">
                  <p className="text-[14px] text-[#6b7280]">Enter the 4-digit code below.</p>
                  <OtpInput value={code} onChange={setCode} />
                </div>

                <div className="space-y-3">
                  <p className="text-[14px] text-[#6b7280]">
                    Didn’t get a verification code?{' '}
                    <Button variant="link" asChild>
                      <button
                        type="button"
                        disabled={countdown > 0}
                        onClick={() => {
                          sendReset(email)
                          transitionTo('verify', 'Resending verification code...')
                        }}
                        className="font-medium text-[#3758F9] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
                      >
                        Resend Code
                      </button>
                    </Button>{' '}
                    <span aria-live="polite" className="font-medium text-[#111528]">
                      0:{countdown.toString().padStart(2, '0')}
                    </span>
                  </p>
                  <PrimaryButton type="submit">Verify Code</PrimaryButton>
                </div>
              </form>
            ) : null}

            {step === 'reset' ? (
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault()
                  transitionTo('done', 'Updating password...')
                }}
              >
                <PasswordField id="new-password" label="New password" value={newPassword} onChange={setNewPassword} />
                <PasswordField id="confirm-password" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} />
                <PrimaryButton type="submit">Update Password</PrimaryButton>
              </form>
            ) : null}

            {step === 'done' ? (
              <div className="space-y-5">
                <div className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
                  <p className="text-[16px] font-medium text-[#111528]">Your password has been updated successfully.</p>
                  <p className="mt-2 text-[14px] text-[#6b7280]">Use your new password the next time you sign in.</p>
                </div>
                <PrimaryButton type="button" onClick={() => setLocation('/login')}>
                  Back to Login
                </PrimaryButton>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
      <HelperLink href="/login" label="Back to login" align="center" />
    </AuthLayout>
  )
}

export default ForgotPassword
