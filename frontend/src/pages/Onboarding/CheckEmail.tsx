import React, { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSearch } from 'wouter'
import { toast } from 'sonner'
import AuthLayout from '@/components/AuthLayout'
import { OpenInboxLink, PrimaryLink } from '@/components/AuthControls'
import { api } from '@/lib/api/services'
import { errorMessage } from '@/lib/format'

const RESEND_COOLDOWN_SECONDS = 60

/** Shown after sign-up: the account is verified by clicking the link in the email. */
const CheckEmail: React.FC = () => {
  const email = new URLSearchParams(useSearch()).get('email') ?? ''
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const resend = useMutation({
    mutationFn: () => api.auth.resendVerification(email),
    onSuccess: () => {
      toast.success('If your account still needs verifying, a new link is on its way.')
      setCountdown(RESEND_COOLDOWN_SECONDS)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  return (
    <AuthLayout
      title="Verify your email address"
      subtitle={`We’ve sent a verification link to ${email || 'your email address'}. Click it to activate your account, then log in.`}
      illustration="signup"
    >
      <div className="w-full max-w-[540px] space-y-8">
        <OpenInboxLink email={email} />

        <p className="text-[14px] text-[#374151]">
          Didn’t get the email? Check your spam folder, or{' '}
          <button
            type="button"
            className="font-medium text-[#1050ff] disabled:cursor-not-allowed disabled:text-[#9ca3af]"
            disabled={!email || countdown > 0 || resend.isPending}
            onClick={() => resend.mutate()}
          >
            resend the link
          </button>
          {countdown > 0 ? (
            <span aria-live="polite" className="font-medium text-[#9ca3af]">
              {' '}in 0:{countdown.toString().padStart(2, '0')}
            </span>
          ) : null}
        </p>

        <PrimaryLink href="/login">Go to login</PrimaryLink>
      </div>
    </AuthLayout>
  )
}

export default CheckEmail
