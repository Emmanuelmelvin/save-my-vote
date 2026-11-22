import React from 'react'
import { Redirect, Route, Switch } from 'wouter'
import RequireAuth from '@/components/RequireAuth'
import { useSession } from '@/lib/api/hooks'
import Dashboard from '@/pages/Dashboard'
import LoadingScreen from '@/pages/LoadingScreen'
import CheckEmail from '@/pages/Onboarding/CheckEmail'
import ForgotPassword from '@/pages/Onboarding/ForgotPassword'
import Login from '@/pages/Onboarding/Login'
import ResetPassword from '@/pages/Onboarding/ResetPassword'
import SignUp from '@/pages/Onboarding/SignUp'
import PreviewPage from '@/pages/Voting/PreviewPage'
import VotePage from '@/pages/Voting/VotePage'

/** Signed-in organisers skip the sign-up page. */
const Home: React.FC = () => {
  const session = useSession()
  if (session.isPending) return <LoadingScreen />
  return session.data ? <Redirect to="/dashboard" replace /> : <SignUp />
}

const App: React.FC = () => {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={SignUp} />
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
