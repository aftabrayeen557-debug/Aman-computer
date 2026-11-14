import React, { Suspense, lazy } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useAdmin } from './context/AdminContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ToastContainer } from './components/ToastContainer';
import { MarbleLogin } from './components/MarbleLogin';
import {
  StudioErrorBoundary,
  StudioLoadingState,
} from './components/StateViews';
import { getNavItemForTab, resolveStudioTab } from './config/navigation';

const OverviewView = lazy(() =>
  import('./views/OverviewView').then((m) => ({ default: m.OverviewView }))
);
const ModuleFoundationView = lazy(() =>
  import('./views/ModuleFoundationView').then((m) => ({
    default: m.ModuleFoundationView,
  }))
);

export const AdminApp: React.FC = () => {
  const {
    currentTab,
    sidebarCollapsed,
    authViewMode,
    authStatus,
    authError,
    completeLoginTransition,
    isSupabaseActive,
  } = useAdmin();

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen w-full bg-[#0A0E16] text-[#EAF0F7] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-9 h-9 rounded-full border-2 border-[#A9D6FF]/20 border-t-[#A9D6FF] animate-spin" />
        <div className="text-xs font-mono tracking-widest uppercase text-[#8D98AA]">
          Verifying Admin Session…
        </div>
      </div>
    );
  }

  if (authStatus !== 'authenticated' || authViewMode === 'login') {
    return (
      <MarbleLogin
        onSuccess={completeLoginTransition}
        externalError={authError}
      />
    );
  }

  const activeTab = resolveStudioTab(currentTab);
  const activeNav = getNavItemForTab(activeTab);

  return (
    <MotionConfig reducedMotion="user">
      <div className="admin-studio-theme min-h-screen bg-[#090A0C] text-[#F5F2EC] font-sans antialiased selection:bg-[#C6A56B]/25 selection:text-[#F3EFE7]">
        <div className="flex min-h-screen">
          <Sidebar />

          <div
            className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
              sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'
            }`}
          >
            <TopBar />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <StudioErrorBoundary resetKey={activeTab}>
                <Suspense fallback={<StudioLoadingState />}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {activeTab === 'overview' ? (
                        <OverviewView />
                      ) : (
                        <ModuleFoundationView navItem={activeNav} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Suspense>
              </StudioErrorBoundary>
            </main>

            <footer className="px-4 sm:px-6 lg:px-8 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#92949B]">
              <span>
                Aman Computer — Studio Control Center · Single-Admin Session
              </span>
              <span>
                {isSupabaseActive
                  ? 'Firebase Spark Auth · Supabase PostgreSQL + RLS'
                  : 'Firebase Auth · Local Fallback Mode'}
              </span>
            </footer>
          </div>
        </div>

        <GlobalSearchModal />
        <ToastContainer />
      </div>
    </MotionConfig>
  );
};
