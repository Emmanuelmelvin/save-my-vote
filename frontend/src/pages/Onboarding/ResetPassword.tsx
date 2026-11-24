import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useSearch } from 'wouter'
import { toast } from 'sonner'
import AuthLayout from '@/components/AuthLayout'
import { PasswordField, PrimaryButton, PrimaryLink } from '@/components/AuthControls'
import forgotSideImage from '@/assets/side.png'
import { queryKeys } from '@/lib/api/hooks'
import { api } from '@/lib/api/services'
import { errorMessage } from '@/lib/format'

/** Step 2 of a password reset, opened from the emailed link (?token=...). Signs the user in. */
const ResetPassword: React.FC = () => {
  const [, setLocation] = useLocation()
  const token = new URLSearchParams(useSearch()).get('token') ?? ''
  const client = useQueryClient()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const reset = useMutation({
    mutationFn: () => api.auth.resetPassword({ token, password: newPassword, passwordConfirm: confirmPassword }),
    onSuccess: (session) => {
      client.setQueryData(queryKeys.session, session.user)
      toast.success('Password updated. You are now signed in.')
      setLocation('/dashboard')
    },
    onError: (error) => setPasswordError(errorMessage(error)),
  })

  if (!token) {
    return (
      <AuthLayout title="Reset link missing" subtitle="Open the link from your password reset email, or request a new one." sideImageSrc={forgotSideImage}>
        <PrimaryLink href="/forgot-password">Request a new link</PrimaryLink>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Use at least 8 characters." sideImageSrc={forgotSideImage}>
      <form
        className="w-full max-w-[520px] space-y-8"
        onSubmit={(event) => {
          event.preventDefault()
          if (newPassword.length < 8) {
            setPasswordError('Use at least 8 characters.')
            return
          }
          if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.')
            return
          }
          setPasswordError('')
          reset.mutate()
        }}
      >
        <div className="space-y-5">
          <PasswordField id="new-password" label="Password" required value={newPassword} onChange={setNewPassword} error={passwordError} />
          <PasswordField id="confirm-password" label="Confirm password" required value={confirmPassword} onChange={setConfirmPassword} placeholder="Enter it again" />
        </div>

        <PrimaryButton type="submit" disabled={reset.isPending}>
          {reset.isPending ? 'Updating…' : 'Update password'}
        </PrimaryButton>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
