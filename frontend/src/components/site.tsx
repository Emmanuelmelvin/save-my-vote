import React, { useEffect } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'wouter'
import logo from '@/assets/image.png'
import { SITE } from '@/lib/site'

/* Shared chrome for the public pages: landing, About, Terms and Privacy. */

const NAV = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#voters', label: 'For voters' },
  { href: '/#faq', label: 'FAQ' },
]

export const SiteHeader: React.FC = () => (
  <header className="sticky top-0 z-40 border-b border-[#eef0f4] bg-white/85 backdrop-blur-md">
    <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="shrink-0" aria-label={`${SITE.name} home`}>
        <img src={logo} alt="Save our votes" className="h-9 w-auto sm:h-10" />
      </Link>
      <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="text-[15px] font-medium text-[#4b5563] transition hover:text-[#18203a]">
            {item.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/login" className="rounded-[8px] px-3 py-2 text-[15px] font-medium text-[#18203a] transition hover:bg-[#f3f4f6]">
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#1050ff] px-4 text-[14px] font-medium text-white transition hover:bg-[#0b45e4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1050ff]/40 focus-visible:ring-offset-2 sm:px-5"
        >
          Get started
        </Link>
      </div>
    </div>
  </header>
)

const FooterColumn: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#18203a]">{title}</h2>
    <ul className="mt-4 space-y-3 text-[15px]">{children}</ul>
  </div>
)

const FooterLink: React.FC<{ href: string; children: React.ReactNode; external?: boolean }> = ({ href, children, external }) => {
  const className = 'text-[#6b7280] transition hover:text-[#18203a]'
  return (
    <li>
      {href.startsWith('/') && !href.includes('#') && !external ? (
        <Link href={href} className={className}>{children}</Link>
      ) : (
        <a href={href} className={className}>{children}</a>
      )}
    </li>
  )
}

export const SiteFooter: React.FC = () => (
  <footer className="border-t border-[#eef0f4] bg-white">
    <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 max-w-[320px] lg:col-span-1">
          <Link href="/" aria-label={`${SITE.name} home`}>
            <img src={logo} alt="Save our votes" className="h-9 w-auto" />
          </Link>
          <p className="mt-4 text-[15px] leading-6 text-[#6b7280]">
            Online elections for institutions and organisations. One person, one vote, and every ballot secret.
          </p>
          <Link href="/signup" className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1050ff] hover:underline">
            Create your election <FiArrowRight aria-hidden />
          </Link>
        </div>

        <FooterColumn title="Product">
          <FooterLink href="/#how-it-works">How it works</FooterLink>
          <FooterLink href="/#features">Features</FooterLink>
          <FooterLink href="/#voters">For voters</FooterLink>
          <FooterLink href="/#faq">FAQ</FooterLink>
        </FooterColumn>

        <FooterColumn title="Company">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/about#security">Security</FooterLink>
          {SITE.contactEmail ? (
            <FooterLink href={`mailto:${SITE.contactEmail}`} external>Contact</FooterLink>
          ) : (
            <FooterLink href="/about#contact">Contact</FooterLink>
          )}
        </FooterColumn>

        <FooterColumn title="Account & legal">
          <FooterLink href="/login">Log in</FooterLink>
          <FooterLink href="/signup">Sign up</FooterLink>
          <FooterLink href="/terms">Terms of Service</FooterLink>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
        </FooterColumn>
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#eef0f4] pt-6 text-[14px] text-[#6b7280] sm:flex-row">
        <p>© {new Date().getFullYear()} {SITE.name}. {SITE.tagline}.</p>
        <p className="flex gap-5">
          <Link href="/terms" className="hover:text-[#18203a]">Terms</Link>
          <Link href="/privacy" className="hover:text-[#18203a]">Privacy</Link>
        </p>
      </div>
    </div>
  </footer>
)

/** Layout for text pages (About, Terms, Privacy): header, a title block, readable content, footer. */
export const ContentPage: React.FC<{
  eyebrow: string
  title: string
  intro?: React.ReactNode
  updated?: string
  toc?: Array<{ id: string; label: string }>
  /** The browser tab title, when the page heading is too long for it. */
  documentTitle?: string
  children: React.ReactNode
}> = ({ eyebrow, title, intro, updated, toc, documentTitle, children }) => {
  // Arriving from a footer link at the bottom of another page: start at the top,
  // unless the URL points at a section.
  useEffect(() => {
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const previous = document.title
    document.title = `${documentTitle ?? title} | ${SITE.name}`
    return () => {
      document.title = previous
    }
  }, [documentTitle, title])

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#111528]">
      <SiteHeader />
      <main>
        <section className="border-b border-[#eef0f4] bg-[#f5f2eb]">
          <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#1050ff]">{eyebrow}</p>
            <h1 className="mt-3 max-w-[760px] text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#18203a] sm:text-[46px]">{title}</h1>
            {intro ? <div className="mt-5 max-w-[680px] text-[18px] leading-8 text-[#4b5563]">{intro}</div> : null}
            {updated ? <p className="mt-5 text-[14px] text-[#6b7280]">Last updated {updated}</p> : null}
          </div>
        </section>

        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
          {toc?.length ? (
            <nav aria-label="On this page" className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#18203a]">On this page</p>
                <ol className="mt-4 space-y-2.5 text-[14px]">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="text-[#6b7280] transition hover:text-[#1050ff]">{item.label}</a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          ) : (
            <div className="hidden lg:block" />
          )}
          <article className="max-w-[720px] space-y-12">{children}</article>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

/** One titled section of a text page; its id is the anchor the table of contents links to. */
export const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#18203a]">{title}</h2>
    <div className="mt-4 space-y-4 text-[16px] leading-7 text-[#4b5563] [&_a]:font-medium [&_a]:text-[#1050ff] [&_a:hover]:underline [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-[#18203a] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  </section>
)

/** How to reach us: the contact email when configured, otherwise the in-app feedback. */
export const ContactLine: React.FC = () =>
  SITE.contactEmail ? (
    <>email us at <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></>
  ) : (
    <>sign in and use <strong>Send Feedback</strong> in your dashboard</>
  )
