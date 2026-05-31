import React from 'react'
import platformLogo from '@/assets/image.png'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  sideImageSrc?: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, footer, sideImageSrc }) => {
  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#111528] lg:flex">
      <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-24">
        <div className="w-full max-w-[520px] space-y-8">
          <img src={platformLogo} alt="Save our vote" className="h-12 w-auto max-w-[220px] object-contain" />

          <div className="space-y-3">
            <h1 className="text-[32px] font-medium leading-10 tracking-[-0.32px] text-[#111528]">{title}</h1>
            {subtitle ? <p className="max-w-[460px] text-[16px] leading-6 text-[#6b7280]">{subtitle}</p> : null}
          </div>

          <div className="space-y-6">{children}</div>

          {footer ? <div className="pt-1">{footer}</div> : null}
        </div>
      </section>

      <aside className="relative hidden min-h-screen flex-[0_0_692px] overflow-hidden bg-[#eeece7] lg:block">
        {sideImageSrc ? (
          <img src={sideImageSrc} alt="Onboarding illustration" className="absolute inset-0 h-full w-full object-cover object-center" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.72),transparent_30%),radial-gradient(circle_at_70%_18%,rgba(55,88,249,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent_28%)]" />
            <div className="absolute left-10 top-10 h-28 w-28 rounded-full border border-white/60 bg-white/20 blur-[1px]" />
            <div className="absolute bottom-16 left-12 right-12 rounded-[28px] border border-white/55 bg-white/35 p-5 shadow-[0_30px_80px_rgba(17,21,40,0.10)] backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.22em] text-[#6b7280]">
                <span>Vote safely</span>
                <span>One person, one vote</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-[24px] bg-white/70 p-4">
                <img
                  src="/assets/figma_onboarding.png"
                  alt="Onboarding illustration"
                  className="h-auto w-full rounded-[20px] object-cover"
                />
              </div>
            </div>
            <div className="absolute right-8 top-16 h-80 w-80 rounded-full bg-[#3758F9]/10 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[#111528]/10 blur-3xl" />
          </>
        )}
      </aside>
    </div>
  )
}

export default AuthLayout
