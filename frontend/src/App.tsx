import React from 'react'
import { Redirect, Route, Switch } from 'wouter'
import RequireAuth from '@/components/RequireAuth'
import { useSession } from '@/lib/api/hooks'
import Dashboard from '@/pages/Dashboard'
import Landing from '@/pages/Landing'
import LoadingScreen from '@/pages/LoadingScreen'
import CheckEmail from '@/pages/Onboarding/CheckEmail'
import ForgotPassword from '@/pages/Onboarding/ForgotPassword'
import Login from '@/pages/Onboarding/Login'
import ResetPassword from '@/pages/Onboarding/ResetPassword'
import SignUp from '@/pages/Onboarding/SignUp'
import PreviewPage from '@/pages/Voting/PreviewPage'
import VotePage from '@/pages/Voting/VotePage'

/**
 * Visitors see the landing page straight away, without waiting for the session
 * check; signed-in organisers are sent on to their dashboard.
 */
const Home: React.FC = () => {
  const session = useSession()
  return session.data ? <Redirect to="/dashboard" replace /> : <Landing />
}

/** Signed-in organisers skip the sign-up page. */
const SignUpRoute: React.FC = () => {
  const session = useSession()
  if (session.isPending) return <LoadingScreen />
  return session.data ? <Redirect to="/dashboard" replace /> : <SignUp />
}

const App: React.FC = () => {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={SignUpRoute} />
      <Route path="/login" component={Login} />
      <Route path="/check-email" component={CheckEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard">
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      </Route>
      <Route path="/preview/:electionId">
        {(params) => (
          <RequireAuth>
            <PreviewPage electionId={params.electionId} />
          </RequireAuth>
        )}
      </Route>
      <Route path="/vote/:electionId">{(params) => <VotePage electionId={params.electionId} />}</Route>
      <Route>
        <Redirect to="/" replace />
      </Route>
    </Switch>
  )
}

export default App
