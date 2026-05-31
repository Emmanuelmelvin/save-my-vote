import React, { useState } from 'react'
import { FiMenu, FiX, FiHome, FiPlus, FiBarChart2, FiHelpCircle } from 'react-icons/fi'
import logo from '@/assets/image.png'
import CreateElection from '@/pages/dashboard/CreateElection'

const FilterPill: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <button
    className={`px-3 py-1 rounded-md text-sm font-medium border ${active ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'}`}
  >
    {children}
  </button>
)

const BallotSvg: React.FC = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="30" width="100" height="60" rx="8" fill="#0B61FF"/>
    <path d="M25 30L95 30" stroke="#ffffff" strokeWidth="2" opacity="0.15"/>
    <rect x="48" y="14" width="24" height="18" rx="3" fill="#E6F0FF" transform="rotate(20 48 14)"/>
    <circle cx="44" cy="52" r="3" fill="#ffffff"/>
  </svg>
)

const Dashboard: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [activePage, setActivePage] = useState<'dashboard' | 'create' | 'results' | 'help'>('dashboard')

  const NavItem: React.FC<{ icon: React.ReactNode; children: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ icon, children, active, onClick }) => (
    <li onClick={onClick} className={`flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer ${active ? 'text-blue-600 bg-slate-50' : 'text-slate-700 hover:bg-slate-50'}`}>
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </li>
  )

  // CreateElection moved to separate tab file

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:overflow-hidden">
      {/* Sidebar for large screens (fixed, non-scrollable) */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:fixed md:left-0 md:top-0 md:z-30 bg-white border-r border-slate-100 px-6 py-6 md:h-screen md:overflow-hidden">
        <div className="mb-8">
          <img src={logo} alt="logo" className="w-28 h-auto" />
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <NavItem icon={<FiHome />} active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')}>Dashboard</NavItem>
            <NavItem icon={<FiPlus />} active={activePage === 'create'} onClick={() => setActivePage('create')}>Create Election</NavItem>
            <NavItem icon={<FiBarChart2 />} active={activePage === 'results'} onClick={() => setActivePage('results')}>Results</NavItem>
            <NavItem icon={<FiHelpCircle />} active={activePage === 'help'} onClick={() => setActivePage('help')}>Help Center</NavItem>
          </ul>
        </nav>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">J</div>
            <div>
              <div className="font-medium">Jane Doe</div>
              <div className="text-xs text-slate-400">Association of Com...</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col md:ml-64 md:h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2" onClick={() => setOpen(true)} aria-label="Open menu"><FiMenu size={20} /></button>
            <h1 className="text-lg font-medium">{activePage === 'create' ? 'Create Election' : 'Dashboard'}</h1>
          </div>
          <div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow">Create new Election +</button>
          </div>
        </header>

        {/* Mobile slide-over sidebar */}
        {open && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
            <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  {activePage !== 'create' && <img src={logo} alt="logo" className="w-24 h-auto" />}
                  <button onClick={() => setOpen(false)} aria-label="Close menu"><FiX size={20} /></button>
                </div>
              <nav>
                <ul className="space-y-2">
                  <NavItem icon={<FiHome />} onClick={() => { setOpen(false); setActivePage('dashboard') }} active={activePage === 'dashboard'}>Dashboard</NavItem>
                  <NavItem icon={<FiPlus />} onClick={() => { setOpen(false); setActivePage('create') }} active={activePage === 'create'}>Create Election</NavItem>
                  <NavItem icon={<FiBarChart2 />} onClick={() => { setOpen(false); setActivePage('results') }} active={activePage === 'results'}>Results</NavItem>
                  <NavItem icon={<FiHelpCircle />} onClick={() => { setOpen(false); setActivePage('help') }} active={activePage === 'help'}>Help Center</NavItem>
                </ul>
              </nav>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">J</div>
                  <div>
                    <div className="font-medium">Jane Doe</div>
                    <div className="text-xs text-slate-400">Association of Com...</div>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activePage === 'create' ? (
              <CreateElection />
            ) : (
              <>
                <section className="mb-6">
                  <h2 className="text-sm font-semibold text-slate-700 mb-4">All Elections</h2>
                  <div className="flex gap-3">
                    <FilterPill active>All</FilterPill>
                    <FilterPill>Active</FilterPill>
                    <FilterPill>Upcoming</FilterPill>
                    <FilterPill>Drafts</FilterPill>
                    <FilterPill>Completed</FilterPill>
                  </div>
                </section>

                <section className="bg-white rounded-lg p-16 mt-6 text-center border border-slate-100">
                  <div className="flex flex-col items-center gap-5">
                    <BallotSvg />
                    <h3 className="text-lg font-semibold">You don’t have any elections created</h3>
                    <p className="text-sm text-slate-400">Start by creating your first election</p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg" onClick={() => setActivePage('create')}>Create new Election</button>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
