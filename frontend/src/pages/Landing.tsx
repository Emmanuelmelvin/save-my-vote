import React, { useEffect } from 'react'
import type { IconType } from 'react-icons'
import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiClock,
  FiEye,
  FiFileText,
  FiImage,
  FiList,
  FiLock,
  FiMail,
  FiSend,
  FiSettings,
  FiShield,
  FiUpload,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi'
import { Link } from 'wouter'
import ballotArt from '@/assets/side.png'
import { SiteFooter, SiteHeader } from '@/components/site'

/* Colours match the onboarding screens and their ballot illustration. */
const CTA_PRIMARY =
  'inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#1050ff] px-6 text-[15px] font-medium text-white transition hover:bg-[#0b45e4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1050ff]/40 focus-visible:ring-offset-2'
const CTA_SECONDARY =
  'inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[#e5e7eb] bg-white px-6 text-[15px] font-medium text-[#18203a] transition hover:border-[#cbd5e1] hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1050ff]/30'

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#1050ff]">{children}</p>
)

const SectionHeading: React.FC<{ eyebrow: string; title: string; intro?: string; center?: boolean }> = ({
  eyebrow,
  title,
  intro,
  center,
}) => (
  <div className={center ? 'mx-auto max-w-[640px] text-center' : 'max-w-[640px]'}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className="mt-3 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#18203a] sm:text-[36px]">{title}</h2>
    {intro ? <p className="mt-4 text-[17px] leading-7 text-[#6b7280]">{intro}</p> : null}
  </div>
)


/* ---------- Hero ---------- */

const BallotCard: React.FC = () => (
  <div className="w-[260px] rounded-[16px] border border-[#eef0f4] bg-white p-4 shadow-[0_24px_60px_rgba(17,21,40,0.16)] sm:w-[280px]">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">President</span>
      <span className="rounded-full bg-[#e8efff] px-2 py-0.5 text-[11px] font-medium text-[#1050ff]">Choose 1</span>
    </div>
    <ul className="mt-3 space-y-2">
      {[
        { name: 'Amina Bello', initials: 'AB', tint: '#c5d3ea', picked: true },
        { name: 'Daniel Okoro', initials: 'DO', tint: '#f1dcc0', picked: false },
      ].map((c) => (
        <li
          key={c.name}
          className={`flex items-center gap-3 rounded-[10px] border px-3 py-2.5 ${c.picked ? 'border-[#1050ff] bg-[#f5f8ff]' : 'border-[#eef0f4]'}`}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-[#18203a]"
            style={{ background: c.tint }}
            aria-hidden
          >
            {c.initials}
          </span>
          <span className="flex-1 text-[14px] font-medium text-[#18203a]">{c.name}</span>
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${c.picked ? 'border-[#1050ff] bg-[#1050ff] text-white' : 'border-[#d7dbe5]'}`}
            aria-hidden
          >
            {c.picked ? <FiCheck className="h-3 w-3" strokeWidth={3} /> : null}
          </span>
        </li>
      ))}
    </ul>
  </div>
)

const RecordedToast: React.FC = () => (
  <div className="flex items-center gap-3 rounded-[14px] border border-[#eef0f4] bg-white px-4 py-3 shadow-[0_18px_44px_rgba(17,21,40,0.14)]">
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f6ee] text-[#15803d]" aria-hidden>
      <FiCheck className="h-5 w-5" strokeWidth={3} />
    </span>
    <div>
      <p className="text-[14px] font-semibold text-[#18203a]">Your vote has been recorded</p>
      <p className="text-[12px] text-[#6b7280]">Secret, and counted once.</p>
    </div>
  </div>
)

const Hero: React.FC = () => (
  <section id="top" className="relative overflow-hidden">
    <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-20">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe4ff] bg-[#f5f8ff] px-3 py-1 text-[13px] font-medium text-[#1050ff]">
          <FiShield className="h-3.5 w-3.5" aria-hidden />
          Online elections for institutions and organisations
        </span>
        <h1 className="mt-6 text-[40px] font-semibold leading-[1.06] tracking-[-0.035em] text-[#18203a] sm:text-[54px] lg:text-[60px]">
          Elections your members can <span className="text-[#1050ff]">trust</span>.
        </h1>
        <p className="mt-6 max-w-[540px] text-[18px] leading-8 text-[#6b7280]">
          Build your ballot, upload your voter list and launch. Every voter gets a one-time code by email, votes once and in
          secret, and you watch the results come in.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className={CTA_PRIMARY}>
            Create your election <FiArrowRight aria-hidden />
          </Link>
          <a href="#how-it-works" className={CTA_SECONDARY}>
            See how it works
          </a>
        </div>
        <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-[#4b5563]">
          {['One person, one vote', 'Secret ballot', 'Codes sent for you'].map((item) => (
            <li key={item} className="inline-flex items-center gap-2">
              <FiCheck className="h-4 w-4 text-[#1050ff]" strokeWidth={3} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto w-full max-w-[520px]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#edece6] shadow-[0_40px_90px_rgba(11,77,126,0.18)]">
          <img
            src={ballotArt}
            alt="A hand dropping a ballot paper into a ballot box"
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
        </div>
        <div className="absolute left-0 top-[14%] -translate-x-2 sm:-translate-x-8">
          <BallotCard />
        </div>
        <div className="absolute bottom-[8%] right-0 translate-x-2 sm:translate-x-6">
          <RecordedToast />
        </div>
      </div>
    </div>
  </section>
)

/* ---------- How it works ---------- */

const STEPS: Array<{ icon: IconType; title: string; body: string }> = [
  { icon: FiFileText, title: 'Set the details', body: 'Name the election, describe it and pick when voting opens and closes.' },
  { icon: FiUsers, title: 'Add your voters', body: 'Upload a CSV or XLSX with names and emails, or add voters one by one.' },
  { icon: FiList, title: 'Build the ballot', body: 'Add the positions people will vote for and each candidate, with an optional photo.' },
  { icon: FiSend, title: 'Launch', body: 'Invitations with one-time codes go out automatically shortly before voting opens.' },
]

const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="scroll-mt-20 bg-white py-20 sm:py-24">
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="How it works"
        title="From voter list to results in four steps"
        intro="A guided setup walks you through everything voters need, and you can save and come back to a draft at any point."
      />
      <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative rounded-[18px] border border-[#eef0f4] bg-[#fdfdfd] p-6">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#e8efff] text-[#1050ff]" aria-hidden>
                <step.icon className="h-5 w-5" />
              </span>
              <span className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-[#eef0f4]" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="mt-6 text-[18px] font-semibold text-[#18203a]">{step.title}</h3>
            <p className="mt-2 text-[15px] leading-6 text-[#6b7280]">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
)

/* ---------- Features ---------- */

const FEATURES: Array<{ icon: IconType; title: string; body: string }> = [
  { icon: FiUpload, title: 'Import your voter roll', body: 'Bring a spreadsheet with a name and email per row. Duplicate emails are flagged, and voters already on the list are skipped.' },
  { icon: FiMail, title: 'Emails in your words', body: 'Edit the invitation, reminder and confirmation emails, and greet each voter by name with %name%.' },
  { icon: FiImage, title: 'Your branding', body: 'Add your logo and pick a main colour, so the ballot looks like it came from you.' },
  { icon: FiEye, title: 'Preview before launch', body: 'See the ballot exactly as voters will, from a private preview link. Nothing is recorded.' },
  { icon: FiBarChart2, title: 'Live results', body: 'Follow turnout and the count for every position while voting is open, then see the final result.' },
  { icon: FiSettings, title: 'Stay in control', body: 'Extend the end time, close voting early, or add and remove voters who haven’t voted yet.' },
]

const Features: React.FC = () => (
  <section id="features" className="scroll-mt-20 py-20 sm:py-24">
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Features"
        title="Everything an organiser needs, nothing they don’t"
        intro="Run a student union vote, a board election or an association’s AGM without spreadsheets of codes or paper ballots."
        center
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-[#eef0f4] bg-[#eef0f4] sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="bg-white p-7">
            <feature.icon className="h-6 w-6 text-[#1050ff]" aria-hidden />
            <h3 className="mt-5 text-[17px] font-semibold text-[#18203a]">{feature.title}</h3>
            <p className="mt-2 text-[15px] leading-6 text-[#6b7280]">{feature.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ---------- For voters ---------- */

const VOTER_STEPS: Array<{ icon: IconType; title: string; body: string }> = [
  { icon: FiMail, title: 'Get your code', body: 'Your one-time code arrives by email shortly before voting opens.' },
  { icon: FiUserCheck, title: 'Sign in', body: 'Enter your email and the code from your invitation. No account or password needed.' },
  { icon: FiCheck, title: 'Cast your vote', body: 'Make a choice for every position, review it and submit.' },
  { icon: FiLock, title: 'It’s secret and final', body: 'Your vote is secret and can’t be changed once submitted, and it counts exactly once.' },
]

const CodeMock: React.FC = () => (
  <div className="rounded-[22px] border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
    <p className="text-[13px] font-medium text-[#c5d3ea]">Senate Elections 2026</p>
    <p className="mt-1 text-[20px] font-semibold text-white">Enter your one-time code</p>
    <div className="mt-5 flex gap-2" aria-hidden>
      {['K', '7', 'Q', '2', 'M', '9'].map((ch, i) => (
        <span
          key={i}
          className="flex h-12 w-10 items-center justify-center rounded-[10px] border border-white/25 bg-white text-[18px] font-semibold text-[#18203a] sm:w-11"
        >
          {ch}
        </span>
      ))}
    </div>
    <div className="mt-5 flex h-11 items-center justify-center rounded-[8px] bg-[#1050ff] text-[14px] font-medium text-white">Continue to ballot</div>
    <p className="mt-4 flex items-center gap-2 text-[13px] text-[#c5d3ea]">
      <FiClock className="h-4 w-4" aria-hidden /> Voting closes Friday at 6:00 pm
    </p>
  </div>
)

const ForVoters: React.FC = () => (
  <section id="voters" className="scroll-mt-20 bg-[#0b4d7e] py-20 text-white sm:py-24">
    <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c5d3ea]">For voters</p>
        <h2 className="mt-3 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[36px]">Voting takes a minute, from any device</h2>
        <p className="mt-4 max-w-[560px] text-[17px] leading-7 text-[#dbe6f5]">
          Voters don’t download anything or create an account. They follow the link in their invitation, enter their code and vote.
        </p>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2">
          {VOTER_STEPS.map((step) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white" aria-hidden>
                <step.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[16px] font-semibold">{step.title}</h3>
                <p className="mt-1 text-[15px] leading-6 text-[#dbe6f5]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="mx-auto w-full max-w-[400px]">
        <CodeMock />
      </div>
    </div>
  </section>
)

/* ---------- FAQ ---------- */

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'Can someone vote more than once?',
    a: 'No. Each voter on your list gets their own one-time code, and a ballot can be submitted only once per voter.',
  },
  {
    q: 'Is the vote secret?',
    a: 'Yes. You can see who has voted, for turnout, but not how anyone voted. Voters can’t change a vote once it’s submitted.',
  },
  {
    q: 'When do voters get their codes?',
    a: 'Invitations with one-time codes go out automatically shortly before voting opens, so you don’t have to send anything yourself.',
  },
  {
    q: 'What can I change after launching?',
    a: 'You can extend the end time, close voting early, and add or remove voters who haven’t voted yet. To change the ballot itself, cancel and recreate the election.',
  },
  {
    q: 'What format should my voter list be in?',
    a: 'A CSV or XLSX file with a NAME column and an EMAIL column, one voter per row.',
  },
]

const Faq: React.FC = () => (
  <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-24">
    <div className="mx-auto grid max-w-[1200px] gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <SectionHeading eyebrow="FAQ" title="Questions organisers ask" intro="Can’t find what you need? Sign in and use Send Feedback in your dashboard." />
      <div className="divide-y divide-[#eef0f4] border-y border-[#eef0f4]">
        {FAQS.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-[#18203a] [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] text-[18px] text-[#6b7280] transition group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="mt-3 pr-12 text-[15px] leading-7 text-[#6b7280]">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
)

/* ---------- Closing CTA and footer ---------- */

const ClosingCta: React.FC = () => (
  <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
    <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] bg-[#f5f2eb] px-6 py-14 text-center sm:px-12 sm:py-16">
      <div className="absolute inset-x-0 bottom-0 h-3 bg-[#0b4d7e]" aria-hidden />
      <div className="absolute inset-x-0 bottom-3 h-3 bg-[#5d86b4]" aria-hidden />
      <h2 className="mx-auto max-w-[620px] text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#18203a] sm:text-[38px]">
        Ready to run your next election?
      </h2>
      <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-7 text-[#6b7280]">
        Create an organiser account and set up your first ballot today.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/signup" className={CTA_PRIMARY}>
          Create your election <FiArrowRight aria-hidden />
        </Link>
        <Link href="/login" className={CTA_SECONDARY}>
          Log in
        </Link>
      </div>
    </div>
  </section>
)

const Landing: React.FC = () => {
  // Coming from another page (e.g. a footer link to /#faq): jump to that section once it exists,
  // otherwise start at the top.
  useEffect(() => {
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#111528]">
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <ForVoters />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  )
}

export default Landing
