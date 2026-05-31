import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'wouter'
import AuthLayout from '@/components/AuthLayout'
import { Card } from '@/components/ui/card'
import { Divider, InlineLabel, OtpInput, PrimaryButton } from '@/components/AuthControls'
import { Button } from '@/components/ui/button'
import useAuthStore from '@/store/auth'
import mock from '@/data/mock'
import otpSideImage from '@/assets/side.png'

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
      subtitle={`We’ve sent you a 4-digit verification code to ${mock.users[1].email}. Open Gmail to retrieve it.`}
      sideImageSrc={otpSideImage}
      footer={<div className="text-[14px] text-[#6b7280]">Need a different account? <Link href="/signup" className="font-medium text-[#3758F9]">Create one here</Link></div>}
    >
      <div>
        <div className="max-w-md">
          <Card className="bg-white rounded-xl p-6 border border-[#E3E3E3] shadow-sm">
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault()
                verify(code)
                setLocation('/login')
              }}
            >
              <div className="space-y-3">
                <InlineLabel>Enter the 4-digit code below</InlineLabel>
                <OtpInput value={code} onChange={setCode} />
              </div>

              <div className="space-y-3">
                <p className="text-[14px] text-[#6b7280]">
                  Didn’t get a verification code? <Button variant="link" asChild>
                    <button type="button" className="font-medium text-[#3758F9]">Resend Code</button>
                  </Button>{' '}
                  <span aria-live="polite" className="font-medium text-[#111528]">0:{countdown.toString().padStart(2, '0')}</span>
                </p>
                <PrimaryButton type="submit">Verify Code</PrimaryButton>
              </div>
            </form>
          </Card>
        </div>
      </div>
      <Divider label="" />
    </AuthLayout>
  )
}

export default OTP
