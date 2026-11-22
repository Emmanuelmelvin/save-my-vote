/**
 * UserJot feedback widget for organisers (https://feedback.userjot.com/help/articles/widget-installation).
 *
 * The SDK loads only when the dashboard mounts, so voters on /vote never download it.
 * There is no floating launcher: the dashboard's "Send Feedback" item opens the widget.
 * With no VITE_USERJOT_PROJECT_ID nothing loads and every call here is a no-op.
 */
import { useEffect } from 'react'
import type { UserProfile } from '@/lib/api/types'

type OpenTarget = 'home' | 'feedback' | 'roadmap' | 'updates' | 'messages' | 'notifications' | 'help'

interface UserJot {
  init(projectId: string, options?: Record<string, unknown>): Promise<unknown>
  identify(input: {
    user: { id: string; email?: string; firstName?: string; lastName?: string; traits?: Record<string, unknown> }
  }): Promise<unknown>
  logout(): Promise<unknown>
  open(options?: { to?: OpenTarget; compose?: boolean }): void
  close(): void
}

declare global {
  interface Window {
    uj?: UserJot
    $ujq?: unknown[][]
  }
}

const SDK_URL = 'https://cdn.userjot.com/sdk/v3/uj.js'
const projectId = import.meta.env.VITE_USERJOT_PROJECT_ID?.trim()

export const userJotEnabled = Boolean(projectId)

let loaded = false

/** UserJot's loader: calls made before the SDK arrives are queued on window.$ujq and replayed. */
function load(): UserJot | undefined {
  if (!projectId) return undefined
  if (!loaded) {
    loaded = true
    window.uj ||= new Proxy({} as UserJot, {
      get: (_, method) =>
        method === 'then'
          ? undefined
          : (...args: unknown[]) => {
              ;(window.$ujq ||= []).push([method, ...args])
            },
    })
    window.uj.init(projectId, { widget: { launcher: false } })

    const script = document.createElement('script')
    script.type = 'module'
    script.async = true
    script.src = SDK_URL
    document.head.appendChild(script)
  }
  return window.uj
}

/** SDK calls return promises once loaded; a failure there must never break the dashboard. */
function quietly(result: unknown) {
  if (result instanceof Promise) result.catch((error) => console.warn('UserJot call failed', error))
}

function splitName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  return { firstName: firstName || undefined, lastName: rest.join(' ') || undefined }
}

/** Loads the widget and tells UserJot which organiser is giving feedback. */
export function useUserJot(user: UserProfile | null | undefined) {
  useEffect(() => {
    if (!user) return
    const uj = load()
    if (!uj) return
    quietly(
      uj.identify({
        user: {
          id: user.id,
          email: user.email,
          ...splitName(user.fullName),
          traits: {
            organizationType: user.organizationType,
            organizationName: user.organizationName,
            signedUpAt: user.createdAt,
          },
        },
      }),
    )
  }, [user])
}

export function openFeedback() {
  load()?.open({ to: 'feedback' })
}

/** Call on sign-out so the next person on this device isn't posting as the previous organiser. */
export function resetUserJot() {
  if (!loaded || !window.uj) return
  window.uj.close()
  quietly(window.uj.logout())
}
