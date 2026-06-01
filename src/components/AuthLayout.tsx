import React from 'react'
import platformLogo from '@/assets/image.png'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  sideImageSrc?: string
  illustration?: 'image' | 'signup'
}

const SignUpIllustration: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f5f2eb]">
      <div className="absolute inset-x-0 bottom-0 h-[135px] bg-[#0b4d7e]" />
      <div className="absolute inset-x-0 bottom-[135px] h-[138px] bg-[#5d86b4]" />
      <div className="absolute inset-x-0 bottom-[182px] h-1 bg-[#104f82]" />

      <div
        className="absolute right-[-80px] top-[56px] h-[430px] w-[430px] bg-[#c5d3ea] opacity-55"
        style={{ clipPath: 'polygon(60% 0, 100% 23%, 100% 77%, 84% 100%, 28% 75%, 0 52%, 24% 18%)', transform: 'rotate(18deg)' }}
      />

      <div
        className="absolute right-[-4px] top-[48px] h-[132px] w-[120px] bg-[#9d6000]"
        style={{ clipPath: 'polygon(42% 0, 100% 28%, 100% 72%, 62% 100%, 0 76%, 6% 20%)' }}
      />

      <div
        className="absolute right-[8px] top-[72px] h-[104px] w-[78px] bg-[#7e4a00]"
        style={{ clipPath: 'polygon(36% 0, 100% 22%, 100% 76%, 54% 100%, 0 72%, 7% 18%)' }}
      />

      <div
        className="absolute right-[6px] top-[214px] h-[60px] w-[60px] rounded-full bg-[#c9928d]"
        style={{ boxShadow: '0 0 0 5px #8b5100' }}
      />
    </div>
  )
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, footer, sideImageSrc, illustration = 'image' }) => {
  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#111528] lg:grid lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
      <section className="flex min-h-screen items-center justify-center px-6 py-8 sm:px-10 lg:px-16 xl:px-20">
        <div className="w-full max-w-[540px] space-y-7">
          <img src={platformLogo} alt="Save our vote" className="h-11 w-auto max-w-[170px] object-contain" />

          <div className="space-y-3">
            <h1 className="text-[31px] font-normal leading-[1.12] tracking-[-0.03em] text-[#18203a]">{title}</h1>
            {subtitle ? <p className="max-w-[460px] text-[16px] leading-6 text-[#6b7280]">{subtitle}</p> : null}
          </div>

          <div className="space-y-5">{children}</div>

          {footer ? <div className="pt-1">{footer}</div> : null}
        </div>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden lg:block">
        {illustration === 'signup' ? (
          <SignUpIllustration />
        ) : sideImageSrc ? (
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
