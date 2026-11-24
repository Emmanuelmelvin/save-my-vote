import React from 'react'
import { Redirect } from 'wouter'
import { useSession } from '@/lib/api/hooks'
import LoadingScreen from '@/pages/LoadingScreen'

/** Renders its children only for a signed-in organiser; otherwise sends them to /login. */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useSession()

  if (session.isPending) return <LoadingScreen />
  // "~" makes the path absolute, as this also renders inside the nested /dashboard route.
  if (!session.data) return <Redirect to="~/login" replace />
  return <>{children}</>
}

export default RequireAuth
