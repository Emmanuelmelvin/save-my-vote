import React from 'react'
import { Route } from 'wouter'
import SignUp from '@/pages/Onboarding/SignUp'
import Login from '@/pages/Onboarding/Login'
import ForgotPassword from '@/pages/Onboarding/ForgotPassword';
import Dashboard from '@/pages/Dashboard'

const App: React.FC = () => {
  return (
    <>
      <Route path="/" component={SignUp} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/signup" component={SignUp} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
    </>
  )
}

export default App
