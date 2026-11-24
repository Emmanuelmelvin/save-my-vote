import React from 'react'
import type { IconType } from 'react-icons'
import { FiArrowRight, FiEyeOff, FiKey, FiLock, FiShield, FiUserCheck, FiUsers } from 'react-icons/fi'
import { Link } from 'wouter'
import { ContactLine, ContentPage, Section } from '@/components/site'
import { SITE } from '@/lib/site'

const TOC = [
  { id: 'why', label: 'Why we built it' },
  { id: 'who', label: 'Who it’s for' },
  { id: 'principles', label: 'What we stand for' },
  { id: 'security', label: 'Security' },
  { id: 'contact', label: 'Contact' },
]

const PRINCIPLES: Array<{ icon: IconType; title: string; body: string }> = [
  { icon: FiUserCheck, title: 'One person, one vote', body: 'Every voter has their own one-time code, and each code can cast a single ballot.' },
  { icon: FiEyeOff, title: 'Secret ballots', body: 'Votes are stored without who cast them. Organisers see turnout, never choices.' },
  { icon: FiUsers, title: 'Simple for everyone', body: 'No app or account for voters: an email, a code, a ballot, done.' },
]

const SECURITY: Array<{ icon: IconType; title: string; body: string }> = [
  { icon: FiKey, title: 'Codes stored as hashes', body: 'One-time codes and passwords are never stored in readable form.' },
  { icon: FiShield, title: 'Guessing is blocked', body: 'Wrong codes are counted and voters are locked out after too many, alongside rate limits.' },
  { icon: FiLock, title: 'Private by default', body: 'Encrypted connections, and each organiser can only ever see their own elections.' },
]

const Card: React.FC<{ icon: IconType; title: string; body: string }> = ({ icon: Icon, title, body }) => (
  <div className="rounded-[16px] border border-[#eef0f4] bg-white p-5">
    <Icon className="h-5 w-5 text-[#1050ff]" aria-hidden />
    <h3 className="mt-3 text-[16px] font-semibold text-[#18203a]">{title}</h3>
    <p className="mt-1 text-[15px] leading-6 text-[#6b7280]">{body}</p>
  </div>
)

const About: React.FC = () => (
  <ContentPage
    eyebrow="About"
    documentTitle="About"
    title="Elections people can trust, without the paperwork"
    intro={
      <p>
        {SITE.name} helps institutions and organisations run fair, secret online elections, from a student union to a board of trustees, in an
        afternoon instead of weeks.
      </p>
    }
    toc={TOC}
  >
    <Section id="why" title="Why we built it">
      <p>
        Many organisations still run elections on paper, in group chats or with generic survey tools. Paper is slow and expensive to count. Survey
        tools can’t stop people voting twice, and often show organisers exactly who voted for whom. Members lose confidence in the result.
      </p>
      <p>
        {SITE.name} is built for elections specifically: a controlled voter list, a personal one-time code for each voter, a single secret ballot
        each, and results that add up.
      </p>
    </Section>

    <Section id="who" title="Who it’s for">
      <p>
        Schools and universities, student unions, professional bodies, clubs, cooperatives, associations and boards: any group that needs to elect
        people from a known list of members, with confidence in the outcome.
      </p>
    </Section>

    <Section id="principles" title="What we stand for">
      <div className="grid gap-4 sm:grid-cols-3">
        {PRINCIPLES.map((item) => <Card key={item.title} {...item} />)}
      </div>
    </Section>

    <Section id="security" title="Security">
      <p>Trust in an election depends on getting the details right. Here’s how {SITE.name} protects voters and results:</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {SECURITY.map((item) => <Card key={item.title} {...item} />)}
      </div>
      <p>
        Read the <Link href="/privacy">Privacy Policy</Link> for exactly what we store and who handles it, and the{' '}
        <Link href="/terms">Terms of Service</Link> for the rules of the service.
      </p>
    </Section>

    <Section id="contact" title="Contact">
      <p>Questions, ideas or problems? Organisers can <ContactLine />.</p>
      <p>If you’re a voter, please contact the organisation that invited you about anything to do with your election.</p>
      <Link
        href="/signup"
        className="!inline-flex h-12 items-center gap-2 rounded-[8px] bg-[#1050ff] px-6 text-[15px] font-medium !text-white no-underline transition hover:bg-[#0b45e4] hover:!no-underline"
      >
        Create your election <FiArrowRight aria-hidden />
      </Link>
    </Section>
  </ContentPage>
)

export default About
