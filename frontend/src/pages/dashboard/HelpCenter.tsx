import React from 'react'
import { FiFileText, FiList, FiMessageSquare, FiPlus, FiSend, FiUsers } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { openFeedback, userJotEnabled } from '@/lib/userjot'

const STEPS = [
  { icon: FiFileText, title: 'Basic info', body: 'Give the election a title, an optional description, and the times voting opens and closes. The start must be at least an hour away.' },
  { icon: FiUsers, title: 'Voters', body: 'Upload a CSV or XLSX file with name and email columns, or add voters one at a time.' },
  { icon: FiList, title: 'Ballot', body: 'Add each position and its candidates. A photo per candidate is optional.' },
  { icon: FiSend, title: 'Emails, branding and launch', body: 'Adjust the invitation and reminder emails, add your logo and colour, preview the ballot, then launch.' },
]

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'When do voters get their one-time codes?',
    a: 'Invitations go out automatically shortly before voting opens. From an election’s Manage page you can also send invitations straight away, or send a voter a new code.',
  },
  {
    q: 'Can a voter vote twice, or change their vote?',
    a: 'No. Each voter has their own code and can submit one ballot. Once submitted, a vote can’t be changed.',
  },
  {
    q: 'Can I see how someone voted?',
    a: 'No. You can see who has voted, for turnout, but votes aren’t linked to voters.',
  },
  {
    q: 'What can I change after launching?',
    a: 'You can extend the end time, close voting early, remind people who haven’t voted, and add or remove voters who haven’t voted yet. The ballot and start time are fixed: to change them, delete the election once it ends and create a new one.',
  },
  {
    q: 'A voter says their code doesn’t work.',
    a: 'Check they’re using the email address the invitation was sent to. After too many wrong attempts a voter is locked out; send them a new code from the voter list on the Manage page.',
  },
  {
    q: 'When are results available?',
    a: 'You can follow results live on the Results page while voting is open. Voters see the final results on the voting page once the election closes.',
  },
]

const HelpCenter: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <div className="space-y-8">
    <section className="rounded-lg border border-slate-100 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Running your first election</h2>
          <p className="mt-1 text-sm text-slate-500">The Create Election wizard walks you through these steps, and saves as you go.</p>
        </div>
        {onCreate && (
          <Button className="h-9 gap-2 bg-blue-600 px-4 text-white" onClick={onCreate}>
            <FiPlus className="h-4 w-4" />Create Election
          </Button>
        )}
      </div>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3 rounded-lg bg-slate-50 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8edff] text-[#003dff]" aria-hidden>
              <step.icon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{index + 1}. {step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>

    <section className="rounded-lg border border-slate-100 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-800">Common questions</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {FAQS.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="text-lg leading-none text-slate-400 transition group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-2 pr-8 text-sm leading-6 text-slate-500">{item.a}</p>
          </details>
        ))}
      </div>
    </section>

    {userJotEnabled && (
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white p-6">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Still stuck?</h2>
          <p className="mt-1 text-sm text-slate-500">Tell us what’s wrong or what you’d like to see, and we’ll get back to you.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={openFeedback}>
          <FiMessageSquare className="h-4 w-4" />Send feedback
        </Button>
      </section>
    )}
  </div>
)

export default HelpCenter
