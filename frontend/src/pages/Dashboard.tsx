import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FiMenu, FiX, FiHome, FiPlus, FiBarChart2, FiHelpCircle, FiLogOut, FiMessageSquare } from 'react-icons/fi'
import { Redirect, useLocation, useRoute } from 'wouter'
import logo from '@/assets/image.png'
import CreateElection from '@/pages/dashboard/CreateElection'
import DashboardHome from '@/pages/dashboard/Overview'
import ElectionManage from '@/pages/dashboard/ElectionManage'
import HelpCenter from '@/pages/dashboard/HelpCenter'
import Results from '@/pages/dashboard/Results'
import { Button } from '@/components/ui/button'
import { queryKeys, useLogout, useSession } from '@/lib/api/hooks'
import { api } from '@/lib/api/services'
import { ElectionDraftMapper } from '@/lib/election-draft'
import { errorMessage } from '@/lib/format'
import { openFeedback, resetUserJot, userJotEnabled, useUserJot } from '@/lib/userjot'
import useCreateElectionStore from '@/store/createElection'

type Page = 'dashboard' | 'create' | 'manage' | 'results' | 'help'

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  create: 'Create Election',
  manage: 'Manage Election',
  results: 'Results',
  help: 'Help Center',
}

const NavItem: React.FC<{ icon: React.ReactNode; children: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ icon, children, active, onClick }) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 ${active ? 'text-blue-600 bg-slate-50' : 'text-slate-700 hover:bg-slate-50'}`}
    >
      <span className="text-lg" aria-hidden>{icon}</span>
      <span>{children}</span>
    </button>
  </li>
)

/** Which dashboard page the URL (relative to /dashboard) points at. */
function useDashboardRoute(): { page: Page | null; electionId: string | null } {
  const [isHome] = useRoute('/')
  const [isNew] = useRoute('/new')
  const [isDraft, draft] = useRoute<{ id: string }>('/drafts/:id')
  const [isManage, manage] = useRoute<{ id: string }>('/elections/:id')
  const [isResultsAll] = useRoute('/results')
  const [isResults, results] = useRoute<{ id: string }>('/results/:id')
  const [isHelp] = useRoute('/help')
  if (isHome) return { page: 'dashboard', electionId: null }
  if (isNew) return { page: 'create', electionId: null }
  if (isDraft) return { page: 'create', electionId: draft.id }
  if (isManage) return { page: 'manage', electionId: manage.id }
  if (isResultsAll) return { page: 'results', electionId: null }
  if (isResults) return { page: 'results', electionId: results.id }
  if (isHelp) return { page: 'help', electionId: null }
  return { page: null, electionId: null }
}

const UserCard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { data: user } = useSession()
  if (!user) return null
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
        {user.fullName.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{user.fullName}</div>
        <div className="truncate text-xs text-slate-400">{user.organizationName ?? user.email}</div>
      </div>
      <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Log out" title="Log out">
        <FiLogOut />
      </Button>
    </div>
  )
}

const Dashboard: React.FC = () => {
  const [open, setOpen] = useState(false)
  // Relative to /dashboard (the route is nested in App.tsx).
  const [, navigate] = useLocation()
  const { page: routePage, electionId: selectedElectionId } = useDashboardRoute()
  const activePage: Page = routePage ?? 'dashboard'
  const client = useQueryClient()
  const logout = useLogout()
  const { data: user } = useSession()
  const { reset, hydrate } = useCreateElectionStore()
  const loadedDraftId = useCreateElectionStore((state) => state.electionId)
  const [draftError, setDraftError] = useState<string | null>(null)
  useUserJot(user)

  const go = (path: string) => {
    navigate(path)
    setOpen(false)
  }

  const startNewElection = () => {
    reset()
    go('/new')
  }

  // A draft opened by URL (a refresh, or a shared link) is loaded into the wizard here.
  const draftToLoad = activePage === 'create' && selectedElectionId && loadedDraftId !== selectedElectionId ? selectedElectionId : null
  useEffect(() => {
    if (!draftToLoad) return
    let cancelled = false
    Promise.all([
      client.fetchQuery({ queryKey: queryKeys.election(draftToLoad), queryFn: () => api.elections.get(draftToLoad) }),
      client.fetchQuery({ queryKey: queryKeys.voters(draftToLoad), queryFn: () => api.voters.listAll(draftToLoad) }),
    ])
      .then(([detail, voters]) => {
        if (cancelled) return
        if (detail.status !== 'draft') {
          navigate(`/elections/${detail.id}`, { replace: true })
          return
        }
        setDraftError(null)
        hydrate(ElectionDraftMapper.fromApi(detail, voters))
      })
      .catch((error) => {
        if (!cancelled) setDraftError(errorMessage(error))
      })
    return () => {
      cancelled = true
    }
  }, [draftToLoad, client, hydrate, navigate])

  const handleLogout = () =>
    logout.mutate(undefined, {
      onSettled: () => {
        reset()
        resetUserJot()
        navigate('~/login')
      },
    })

  // Once a new election's first step is saved, give it its draft URL so a refresh keeps it.
  useEffect(() => {
    if (activePage === 'create' && !selectedElectionId && loadedDraftId) navigate(`/drafts/${loadedDraftId}`, { replace: true })
  }, [activePage, selectedElectionId, loadedDraftId, navigate])

  if (routePage === null) return <Redirect to="/" replace />

  const navItems = (
    <ul className="space-y-2">
      <NavItem icon={<FiHome />} active={activePage === 'dashboard' || activePage === 'manage'} onClick={() => go('/')}>Dashboard</NavItem>
      <NavItem icon={<FiPlus />} active={activePage === 'create'} onClick={startNewElection}>Create Election</NavItem>
      <NavItem icon={<FiBarChart2 />} active={activePage === 'results'} onClick={() => go(selectedElectionId ? `/results/${selectedElectionId}` : '/results')}>Results</NavItem>
      <NavItem icon={<FiHelpCircle />} active={activePage === 'help'} onClick={() => go('/help')}>Help Center</NavItem>
      {userJotEnabled && (
        <NavItem
          icon={<FiMessageSquare />}
          onClick={() => {
            setOpen(false)
            openFeedback()
          }}
        >
          Send Feedback
        </NavItem>
      )}
    </ul>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:overflow-hidden">
      {/* Sidebar for large screens (fixed, non-scrollable) */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:fixed md:left-0 md:top-0 md:z-30 bg-white border-r border-slate-100 px-6 py-6 md:h-screen md:overflow-hidden">
        <div className="mb-8">
          <img src={logo} alt="logo" className="w-28 h-auto" />
        </div>
        <nav className="flex-1">{navItems}</nav>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <UserCard onLogout={handleLogout} />
        </div>
      </aside>

      <div className="min-w-0 flex flex-col md:ml-64 md:h-screen">
        {/* Mobile topbar */}
        {activePage !== 'create' && (
          <header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 md:hidden">
            <img src={logo} alt="logo" className="h-8 w-auto" />
            <h1 className="flex-1 px-4 text-center text-lg font-medium">{PAGE_TITLES[activePage]}</h1>
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
              <FiMenu size={20} />
            </Button>
          </header>
        )}

        {/* Desktop topbar */}
        {activePage !== 'create' && (
          <header className="hidden items-center justify-between border-b border-slate-100 bg-white px-6 py-5 md:flex">
            <h1 className="text-lg font-medium">{PAGE_TITLES[activePage]}</h1>
            <div />
          </header>
        )}

        {/* Mobile slide-over sidebar */}
        {open && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
            <aside className="fixed right-0 top-0 h-full w-64 bg-white z-50 p-6 shadow-lg">
              <div className="flex items-center justify-end mb-6">
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu"><FiX size={20} /></Button>
              </div>
              <nav>{navItems}</nav>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <UserCard onLogout={handleLogout} />
              </div>
            </aside>
          </>
        )}

        <main className={activePage === 'create' ? 'flex-1 overflow-auto' : 'flex-1 overflow-auto p-8 max-[640px]:p-5'}>
          {activePage === 'create' ? (
            draftError ? (
              <div className="mx-auto max-w-xl p-8 text-center">
                <p className="text-sm text-rose-600">{draftError}</p>
                <Button variant="outline" className="mt-4" onClick={() => go('/')}>Back to all elections</Button>
              </div>
            ) : draftToLoad ? (
              <div className="m-8 h-64 animate-pulse rounded-lg bg-white" aria-label="Loading draft" />
            ) : (
              <CreateElection
                key={selectedElectionId ?? 'new'}
                onOpenMenu={() => setOpen(true)}
                onLaunched={(id) => go(`/elections/${id}`)}
              />
            )
          ) : (
            <div className="mx-auto max-w-6xl">
              {activePage === 'dashboard' && (
                <DashboardHome
                  onCreate={startNewElection}
                  onEdit={(id) => go(`/drafts/${id}`)}
                  onManage={(id) => go(`/elections/${id}`)}
                  onResults={(id) => go(`/results/${id}`)}
                />
              )}
              {activePage === 'manage' && selectedElectionId && (
                <ElectionManage electionId={selectedElectionId} onBack={() => go('/')} onResults={(id) => go(`/results/${id}`)} />
              )}
              {activePage === 'results' && <Results electionId={selectedElectionId} onSelect={(id) => navigate(`/results/${id}`, { replace: true })} />}
              {activePage === 'help' && <HelpCenter onCreate={startNewElection} />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
