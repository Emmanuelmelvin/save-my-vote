import React, { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link } from 'wouter'
import AuthLayout from '@/components/AuthLayout'
import { PrimaryButton, TextField } from '@/components/AuthControls'
import forgotSideImage from '@/assets/side.png'
import { api } from '@/lib/api/services'
import { errorMessage } from '@/lib/format'

type ForgotStep = 'request' | 'sent'

const RESEND_COOLDOWN_SECONDS = 45

/**
 * Step 1 of a password reset: request a link. The link in the email opens
 * /reset-password, where the new password is set.
 */
const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<ForgotStep>('request')
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (step !== 'sent' || countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, step])

  const request = useMutation({
    mutationFn: () => api.auth.forgotPassword(email.trim()),
    onSuccess: () => {
      setCountdown(RESEND_COOLDOWN_SECONDS)
      setStep('sent')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  return (
    <AuthLayout
      title={step === 'request' ? 'Forgot Password' : 'Check your email'}
      subtitle={
        step === 'request'
          ? 'Enter the email address linked to your account and we’ll send you a link to reset your password.'
          : `If an account exists for ${email}, we’ve sent it a password reset link. It expires in 15 minutes.`
      }
      sideImageSrc={forgotSideImage}
    >
      <div className="w-full max-w-[520px] space-y-8">
        {step === 'request' ? (
          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault()
              request.mutate()
            }}
          >
            <TextField id="reset-email" label="Email" required type="email" placeholder="Enter your Email" value={email} onChange={setEmail} autoComplete="email" />
            <PrimaryButton type="submit" disabled={request.isPending}>
              {request.isPending ? 'Sending…' : 'Send reset link'}
            </PrimaryButton>
          </form>
        ) : (
          <div className="space-y-6">
            <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="inline-flex text-[14px] font-medium text-[#1050ff]">
              Open Gmail
            </a>
            <p className="text-[14px] text-[#374151]">
              Didn’t get the email?{' '}
              <button
                type="button"
                className="font-medium text-[#1050ff] disabled:cursor-not-allowed disabled:text-[#9ca3af]"
                disabled={countdown > 0 || request.isPending}
                onClick={() => request.mutate()}
              >
                Resend link
              </button>{' '}
              {countdown > 0 ? (
                <span aria-live="polite" className="font-medium text-[#9ca3af]">
                  0:{countdown.toString().padStart(2, '0')}
                </span>
              ) : null}
            </p>
            <Link href="/login">
              <PrimaryButton type="button">Back to login</PrimaryButton>
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
