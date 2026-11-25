/**
 * UserJot feedback widget for organisers (https://feedback.userjot.com/help/articles/widget-installation).
 *
 * The SDK loads only when the dashboard mounts, so voters on /vote never download it.
 * There is no floating launcher: the dashboard's "Send Feedback" item opens the widget.
 * With no VITE_USERJOT_PROJECT_ID nothing loads and every call here is a no-op.
 */
import { useEffect } from 'react'
import { api } from '@/lib/api/services'
import type { UserProfile } from '@/lib/api/types'

type OpenTarget = 'home' | 'feedback' | 'roadmap' | 'updates' | 'messages' | 'notifications' | 'help'

interface UserJot {
  init(projectId: string, options?: Record<string, unknown>): Promise<unknown>
  identify(
    input:
      | { token: string }
      | { user: { id: string; email?: string; firstName?: string; lastName?: string; traits?: Record<string, unknown> } },
  ): Promise<unknown>
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
/** Resolves once the real SDK has replaced the queueing stub (its calls then return real promises). */
let sdkLoaded: Promise<void> | undefined

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
    sdkLoaded = new Promise((resolve, reject) => {
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Could not load ${SDK_URL}`))
    })
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

function unsignedIdentity(user: UserProfile) {
  return {
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
  }
}

/**
 * Tells UserJot which organiser is giving feedback. Uses a token the API signs with the
 * UserJot project secret, so the identity is verified and posts are attributed to the
 * organiser. Falls back to an unsigned identity when the API has no secret configured.
 */
async function identify(user: UserProfile) {
  let token: string | null = null
  try {
    token = (await api.auth.userJotToken()).token
  } catch (error) {
    console.warn('Could not get a UserJot identity token', error)
  }
  // The stub can't report a rejected token, so wait for the real SDK before identifying.
  await sdkLoaded
  const uj = window.uj
  if (!uj) return
  if (token) {
    try {
      await uj.identify({ token })
      return
    } catch (error) {
      // A token UserJot rejects (wrong secret or project ID) leaves the visitor anonymous.
      console.warn('UserJot rejected the signed identity', error)
    }
  }
  await uj.identify(unsignedIdentity(user))
}

/** Loads the widget and identifies the signed-in organiser. */
export function useUserJot(user: UserProfile | null | undefined) {
  useEffect(() => {
    if (!user || !load()) return
    quietly(identify(user))
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
