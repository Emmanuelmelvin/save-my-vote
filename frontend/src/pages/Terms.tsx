import React from 'react'
import { Link } from 'wouter'
import { ContactLine, ContentPage, Section } from '@/components/site'
import { SITE } from '@/lib/site'

const TOC = [
  { id: 'agreement', label: 'Agreeing to these terms' },
  { id: 'service', label: 'The service' },
  { id: 'accounts', label: 'Your account' },
  { id: 'organisers', label: 'Running an election' },
  { id: 'voter-data', label: 'Voter data' },
  { id: 'acceptable-use', label: 'Acceptable use' },
  { id: 'voters', label: 'If you’re a voter' },
  { id: 'content', label: 'Your content' },
  { id: 'availability', label: 'Availability' },
  { id: 'liability', label: 'Liability' },
  { id: 'ending', label: 'Ending your use' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
]

const Terms: React.FC = () => (
  <ContentPage
    eyebrow="Legal"
    title="Terms of Service"
    intro={<p>The rules for using {SITE.name}, whether you run elections on it or vote in one.</p>}
    updated={SITE.legalUpdated}
    toc={TOC}
  >
    <Section id="agreement" title="Agreeing to these terms">
      <p>
        By creating an account, launching an election or voting through {SITE.name}, you agree to these terms and to our{' '}
        <Link href="/privacy">Privacy Policy</Link>. If you’re using {SITE.name} for an organisation, you confirm you’re allowed to accept these terms
        on its behalf. If you don’t agree, please don’t use the service.
      </p>
    </Section>

    <Section id="service" title="The service">
      <p>
        {SITE.name} lets organisers set up online elections: build a ballot, add a voter list, and send each voter a one-time code by email so they
        can cast one secret ballot. Organisers can follow turnout and results, and voters see final results once voting closes.
      </p>
      <p>We may change, add or remove features over time. We’ll try to give notice of changes that significantly affect elections you have running.</p>
    </Section>

    <Section id="accounts" title="Your account">
      <ul>
        <li>Give accurate details when you sign up, and keep them up to date.</li>
        <li>Keep your password secret and don’t share your account. You’re responsible for what happens under it.</li>
        <li>Tell us straight away if you think someone else has accessed your account.</li>
        <li>You must be old enough to enter a binding agreement where you live.</li>
      </ul>
    </Section>

    <Section id="organisers" title="Running an election">
      <p>As an organiser, you’re responsible for your elections. In particular, you’re responsible for:</p>
      <ul>
        <li>Making sure you have the authority to run the election, and that it follows your organisation’s rules and any laws that apply.</li>
        <li>The accuracy of the ballot, candidates, dates and voter list. Check them before launching: once an election is launched, its ballot and start time can’t be changed.</li>
        <li>Deciding who may vote, and handling disputes, appeals and announcements of results under your own rules.</li>
        <li>Telling voters how to reach you if something goes wrong.</li>
      </ul>
      <p>
        {SITE.name} provides the tools to run the vote. It doesn’t decide who is eligible, certify outcomes or act as an official returning officer,
        unless you’ve agreed that with us separately in writing.
      </p>
    </Section>

    <Section id="voter-data" title="Voter data">
      <p>
        When you add voters, you confirm you have a lawful basis to give us their names and email addresses and to have us email them about the
        election. You control your voter lists; we process them on your behalf, only to run your election, as described in the{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </Section>

    <Section id="acceptable-use" title="Acceptable use">
      <p>Don’t use {SITE.name} to:</p>
      <ul>
        <li>Send spam, or email people who have no reason to be on a voter list.</li>
        <li>Mislead voters, impersonate another person or organisation, or run a vote you’re not authorised to run.</li>
        <li>Try to vote more than once, use someone else’s code, or interfere with anyone else’s ability to vote.</li>
        <li>Upload unlawful, hateful or infringing content, or content you don’t have the rights to use (such as candidate photos or logos).</li>
        <li>Probe, overload or break the service, get around its limits, or access data that isn’t yours.</li>
      </ul>
      <p>We may suspend or close accounts, or stop an election, that break these rules or put voters or the service at risk.</p>
    </Section>

    <Section id="voters" title="If you’re a voter">
      <ul>
        <li>Your one-time code is personal. Don’t share it, and don’t vote on anyone else’s behalf.</li>
        <li>You can vote once per election. Once submitted, your vote is final and can’t be changed.</li>
        <li>The organiser who invited you runs the election. Questions about eligibility, candidates or results should go to them.</li>
      </ul>
    </Section>

    <Section id="content" title="Your content">
      <p>
        You keep ownership of what you add, such as election text, candidate details, photos and logos. You give us permission to store, display
        and send it only as needed to run your elections and provide the service.
      </p>
    </Section>

    <Section id="availability" title="Availability">
      <p>
        We work to keep {SITE.name} running reliably, but we can’t promise it will always be available or error-free. Outages, email delivery problems
        or issues with our providers can happen. For important elections, plan a sensible voting window and a fallback in case voters can’t reach
        the service. Email delivery also depends on voters’ mail providers, and invitations can land in spam folders.
      </p>
    </Section>

    <Section id="liability" title="Liability">
      <p>
        The service is provided “as is”. To the extent the law allows, we aren’t liable for indirect or consequential losses, or for losses caused
        by how an organiser sets up or runs an election, by information an organiser provides, or by events outside our reasonable control. Nothing
        in these terms limits liability that can’t be limited by law.
      </p>
    </Section>

    <Section id="ending" title="Ending your use">
      <p>
        You can stop using {SITE.name} at any time. Delete your elections from the dashboard, and to close your account, <ContactLine />. We may close
        accounts that break these terms, or that have been inactive for a long time after giving notice.
      </p>
    </Section>

    <Section id="changes" title="Changes to these terms">
      <p>
        We may update these terms. We’ll change the date at the top, and for significant changes we’ll let organisers know before they take effect.
        Continuing to use {SITE.name} after a change means you accept the new terms.
      </p>
    </Section>

    <Section id="contact" title="Contact">
      <p>If you have questions about these terms, <ContactLine />.</p>
    </Section>
  </ContentPage>
)

export default Terms
