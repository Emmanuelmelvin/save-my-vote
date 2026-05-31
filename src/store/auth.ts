import { create } from 'zustand'
import mock from '@/data/mock'

type AuthState = {
  user: null | { id: string; name: string; email?: string; role: string; verified: boolean }
  setUser: (u: any) => void
  sendOTP: (identifier: string) => void
  requestPasswordReset: (identifier: string) => void
  verifyOTP: (code: string) => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  sendOTP: (identifier: string) => {
    console.log('sendOTP', identifier)
    // mimic sending OTP by saving to mock
  },
  requestPasswordReset: (identifier: string) => {
    console.log('requestPasswordReset', identifier)
    // reuse sendOTP behavior for now
  },
  verifyOTP: (code: string) => {
    console.log('verifyOTP', code)
    set({ user: mock.users[1] })
  },
}))

export default useAuthStore
