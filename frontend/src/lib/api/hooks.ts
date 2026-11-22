import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'
import { api } from './services'
import type { UserProfile } from './types'

export const queryKeys = {
  session: ['session'] as const,
  elections: ['elections'] as const,
  election: (id: string) => ['elections', id] as const,
  voters: (id: string) => ['elections', id, 'voters'] as const,
  results: (id: string) => ['elections', id, 'results'] as const,
  publicElection: (id: string) => ['public-election', id] as const,
  publicResults: (id: string) => ['public-election', id, 'results'] as const,
}

/** Retries network blips and 5xx, never 4xx (those won't change on retry). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}

/** Refreshes everything that depends on one election after a change to it. */
export function invalidateElection(client: QueryClient, id: string) {
  return Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.election(id) }),
    client.invalidateQueries({ queryKey: queryKeys.elections, exact: true }),
  ])
}

// ---- Session ----

/** The signed-in organiser, or null when signed out. */
export function useSession() {
  return useQuery<UserProfile | null>({
    queryKey: queryKeys.session,
    queryFn: async () => {
      try {
        return (await api.auth.me()).user
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) return null
        throw error
      }
    },
    staleTime: 5 * 60_000,
  })
}

export function useLogin() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: { email: string; password: string }) => api.auth.login(input),
    onSuccess: (session) => client.setQueryData(queryKeys.session, session.user),
  })
}

export function useLogout() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSettled: () => {
      client.clear()
      client.setQueryData(queryKeys.session, null)
    },
  })
}

// ---- Organiser data ----

export function useElections() {
  return useQuery({
    queryKey: queryKeys.elections,
    queryFn: () => api.elections.list({ limit: 100 }),
  })
}

export function useElection(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.election(id ?? ''),
    queryFn: () => api.elections.get(id as string),
    enabled: Boolean(id),
  })
}

export function useVoters(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.voters(id ?? ''),
    queryFn: () => api.voters.listAll(id as string),
    enabled: Boolean(id),
  })
}

export function useResults(id: string | null | undefined, options: { live?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.results(id ?? ''),
    queryFn: () => api.elections.results(id as string),
    enabled: Boolean(id),
    refetchInterval: options.live ? 15_000 : false,
  })
}

// ---- Voter-facing ----

export function usePublicElection(id: string) {
  return useQuery({
    queryKey: queryKeys.publicElection(id),
    queryFn: () => api.voting.election(id),
  })
}

export function usePublicResults(id: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.publicResults(id),
    queryFn: () => api.voting.results(id),
    enabled,
  })
}
