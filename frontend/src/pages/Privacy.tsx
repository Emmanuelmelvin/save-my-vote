import React from 'react'
import { Link } from 'wouter'
import { ContactLine, ContentPage, Section } from '@/components/site'
import { SITE } from '@/lib/site'

const TOC = [
  { id: 'summary', label: 'In short' },
  { id: 'roles', label: 'Who is responsible' },
  { id: 'organisers', label: 'Organiser data' },
  { id: 'voters', label: 'Voter data' },
  { id: 'ballots', label: 'Ballot secrecy' },
  { id: 'use', label: 'How we use data' },
  { id: 'providers', label: 'Service providers' },
  { id: 'cookies', label: 'Cookies and storage' },
  { id: 'security', label: 'Security' },
  { id: 'retention', label: 'Keeping and deleting data' },
  { id: 'rights', label: 'Your rights' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
]

const Privacy: React.FC = () => (
  <ContentPage
    eyebrow="Legal"
    title="Privacy Policy"
    intro={<p>What {SITE.name} collects when you run or take part in an election, why, who else handles it, and the choices you have.</p>}
    updated={SITE.legalUpdated}
    toc={TOC}
  >
    <Section id="summary" title="In short">
      <ul>
        <li>We collect only what’s needed to run elections: organiser accounts, voter names and email addresses, and ballots.</li>
        <li>Votes are stored without any link to the voter who cast them, or the time they were cast. Organisers see who has voted, never how.</li>
        <li>We don’t sell personal data or use it for advertising.</li>
        <li>Organisers decide who is on their voter lists and can delete their elections at any time once voting has ended.</li>
      </ul>
    </Section>

    <Section id="roles" title="Who is responsible for what">
      <p>
        <strong>Organisers</strong> (the people and institutions that create elections) decide whose details go on a voter list and why. For voter data they
        are responsible for having a lawful reason to use it, and for telling their voters how it is used. {SITE.name} processes voter data on the
        organiser’s behalf and only to run their election.
      </p>
      <p>For organiser accounts, and for running the service itself, {SITE.name} is responsible for the data.</p>
      <p>If you’re a voter with a question about why you’re on a voter list, contact the organisation that invited you first.</p>
    </Section>

    <Section id="organisers" title="Data about organisers">
      <ul>
        <li><strong>Account details:</strong> your full name, email address, organisation or institution name, and a password. Passwords are stored only as a salted hash, never in readable form.</li>
        <li><strong>Google sign-in:</strong> if you sign in with Google, we receive your name, email address and Google account ID.</li>
        <li><strong>Election content:</strong> titles, descriptions, dates, ballot positions, candidate names, descriptions and photos, logos, colours and email wording.</li>
        <li><strong>Feedback:</strong> if you use Send Feedback, the message you write, along with your name and email so we can reply.</li>
      </ul>
    </Section>

    <Section id="voters" title="Data about voters">
      <ul>
        <li><strong>Voter list entries:</strong> the name and email address the organiser adds.</li>
        <li><strong>One-time codes:</strong> each voter gets a code by email. We keep only a keyed hash of it, so the code itself can’t be read back from our database.</li>
        <li><strong>Voting status:</strong> whether and when an invitation was sent, whether the voter has voted, and when. Organisers see this to follow turnout.</li>
        <li><strong>Sign-in attempts:</strong> we count wrong codes and lock a voter out after too many, to stop guessing.</li>
      </ul>
      <p>Voters don’t create accounts or passwords.</p>
    </Section>

    <Section id="ballots" title="Ballot secrecy">
      <p>
        When a ballot is cast, we record the choice for each position against the election and candidate only. The vote record holds no voter
        ID, email, name or timestamp. Separately, the voter is marked as having voted so they can’t vote twice. Results are totals per candidate.
      </p>
    </Section>

    <Section id="use" title="How we use data">
      <ul>
        <li>To run elections: sending invitations, codes, reminders and confirmations, checking codes, counting votes and showing results.</li>
        <li>To run your account: signing you in, verifying your email address and resetting your password.</li>
        <li>To keep the service working and secure: diagnosing errors, preventing abuse and rate-limiting repeated attempts.</li>
        <li>To answer your feedback and improve {SITE.name}.</li>
      </ul>
      <p>We don’t sell personal data, share it for advertising, or use voter data for anything other than the election it was added to.</p>
    </Section>

    <Section id="providers" title="Service providers">
      <p>We use these providers to run {SITE.name}. Each handles data only to provide its service to us:</p>
      <ul>
        <li><strong>Vercel</strong>: hosts the website.</li>
        <li><strong>Neon</strong>: hosts the database.</li>
        <li><strong>Resend</strong>: delivers emails (verification, password reset, invitations, reminders and confirmations).</li>
        <li><strong>Sentry</strong>: records errors and performance data so we can fix problems. For a sample of sessions it also records a replay of page layout and clicks, with all text and form fields masked and images blocked.</li>
        <li><strong>UserJot</strong>: collects feedback from signed-in organisers.</li>
        <li><strong>Google</strong>: only if you choose to sign in with Google.</li>
      </ul>
      <p>Some of these providers store data outside your country, including in the United States.</p>
    </Section>

    <Section id="cookies" title="Cookies and browser storage">
      <p>
        When an organiser signs in we set one cookie that keeps you signed in. It’s marked <em>httpOnly</em>, so page scripts can’t read it, and
        it expires after a set time or when you log out. Voters get no sign-in cookie: they enter their email and code each time.
      </p>
      <p>Sentry and UserJot may store small identifiers in your browser to group errors and feedback by session. We don’t use advertising or cross-site tracking cookies.</p>
    </Section>

    <Section id="security" title="Security">
      <p>
        Data travels over encrypted connections (HTTPS). Passwords and one-time codes are stored only as hashes. Each organiser can reach only their
        own elections, and voter sign-in is limited by attempt counts and rate limits. No system is perfectly secure, so please use a strong,
        unique password and keep codes private.
      </p>
    </Section>

    <Section id="retention" title="Keeping and deleting data">
      <ul>
        <li>Elections, their voter lists, ballots and votes are kept until the organiser deletes the election. Drafts can be deleted at any time, and launched elections once voting has ended. Deleting an election deletes its voters and votes too.</li>
        <li>Organisers can remove a voter who hasn’t voted yet from a running election.</li>
        <li>Organiser accounts are kept while they’re in use. To close your account and delete its data, <ContactLine />.</li>
        <li>Error and performance data in Sentry is kept for a limited period and then deleted automatically.</li>
      </ul>
    </Section>

    <Section id="rights" title="Your rights">
      <p>
        Depending on where you live, you may have the right to see the personal data held about you, correct it, delete it, restrict or object to
        its use, or receive a copy. Organisers can see and edit most of their data in the dashboard. For anything else, <ContactLine />.
      </p>
      <p>
        Voters: because the organiser controls their voter list, we’ll usually pass your request to them, or ask you to contact them directly.
        You may also complain to your local data protection authority.
      </p>
    </Section>

    <Section id="changes" title="Changes to this policy">
      <p>If we change how we handle personal data, we’ll update this page and the date at the top. For significant changes we’ll let organisers know before they take effect.</p>
    </Section>

    <Section id="contact" title="Contact">
      <p>For questions about privacy or this policy, <ContactLine />.</p>
      <p>See also our <Link href="/terms">Terms of Service</Link>.</p>
    </Section>
  </ContentPage>
)

export default Privacy
