import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invalidateElection, queryKeys } from '@/lib/api/hooks'
import { errorMessage } from '@/lib/format'
import useCreateElectionStore, { type ElectionDraft } from '@/store/createElection'

/** Thrown when a step needs the draft to exist on the server first. */
export function requireElectionId(draft: ElectionDraft): string {
  if (!draft.electionId) throw new Error('Save the Basic Info step first.')
  return draft.electionId
}

/**
 * Saves one wizard step to the API, reading the latest draft from the store.
 * Shows any API error as a toast; call `mutate(undefined, { onSuccess: onNext })`
 * to move on only once the save worked.
 */
export function useSaveStep(save: (draft: ElectionDraft) => Promise<unknown>, successMessage?: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => save(useCreateElectionStore.getState()),
    onSuccess: async () => {
      if (successMessage) toast.success(successMessage)
      const id = useCreateElectionStore.getState().electionId
      if (id) {
        await Promise.all([
          invalidateElection(client, id),
          client.invalidateQueries({ queryKey: queryKeys.voters(id) }),
        ])
      }
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
