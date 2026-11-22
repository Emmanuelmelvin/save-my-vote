import React from 'react'
import platformLogo from '@/assets/image.png'

const LoadingScreen: React.FC = () => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdfdfd]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(55,88,249,0.08),transparent_40%),radial-gradient(circle_at_50%_45%,rgba(17,21,40,0.04),transparent_55%)]" />

      <div className="relative flex items-center justify-center">
        <div className="absolute h-36 w-36 rounded-full border border-[#3758F9]/15 border-t-[#3758F9]/70 animate-[spin_3s_linear_infinite]" />
        <div className="absolute h-24 w-24 rounded-full bg-[#3758F9]/10 blur-2xl animate-pulse" />
        <img
          src={platformLogo}
          alt="Save our vote"
          className="relative h-16 w-auto max-w-[180px] object-contain drop-shadow-[0_18px_40px_rgba(17,21,40,0.12)] animate-[pulse_2.4s_ease-in-out_infinite]"
        />
      </div>

      <span className="sr-only">Loading</span>
    </main>
  )
}

export default LoadingScreen