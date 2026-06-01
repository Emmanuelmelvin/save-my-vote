import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import AuthLayout from '@/components/AuthLayout'
import { OtpInput, PrimaryButton } from '@/components/AuthControls'
import useAuthStore from '@/store/auth'
import mock from '@/data/mock'

const OTP: React.FC = () => {
  const [, setLocation] = useLocation()
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(45)
  const verify = useAuthStore((s) => s.verifyOTP)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  return (
    <AuthLayout
      title="Verify your Email address"
      subtitle={`We’ve sent you a 4-digit verification code to ${mock.users[1].email}`}
      illustration="signup"
    >
      <div className="w-full max-w-[540px] space-y-10">
        <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="inline-flex text-[14px] font-medium text-[#1050ff]">
          Open Gmail
        </a>

        <form
          className="space-y-8"
          onSubmit={(event) => {
            event.preventDefault()
            verify(code)
            setLocation('/login')
          }}
        >
          <div className="space-y-4">
            <label className="text-[15px] font-medium text-[#18203a]">Enter Code</label>
            <OtpInput value={code} onChange={setCode} />
          </div>

          <div className="space-y-4">
            <p className="text-[14px] text-[#374151]">
              Didn’t get a verification code?{' '}
              <button type="button" className="font-medium text-[#1050ff]">
                Resend Code
              </button>{' '}
              <span aria-live="polite" className="font-medium text-[#9ca3af]">
                0:{countdown.toString().padStart(2, '0')}
              </span>
            </p>
            <PrimaryButton type="submit">Verify Code</PrimaryButton>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

export default OTP
