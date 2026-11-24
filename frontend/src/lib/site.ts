/** Site-wide facts shown on the public pages (footer, About, Terms, Privacy). */
export const SITE = {
  name: 'SaveMyVote',
  tagline: 'Secure online elections',
  /** Public contact address. Set VITE_CONTACT_EMAIL; without it, pages point to in-app feedback. */
  contactEmail: (import.meta.env.VITE_CONTACT_EMAIL ?? '').trim() || null,
  /** When the Terms and Privacy Policy last changed. Update with any change to their text. */
  legalUpdated: '24 November 2026',
} as const
