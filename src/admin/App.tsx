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
import { resolveStudioTab } from './config/navigation';
import { AdminTab } from './types';

const OverviewView = lazy(() =>
  import('./views/OverviewView').then((m) => ({ default: m.OverviewView }))
);
const OwnerProfileView = lazy(() =>
  import('./views/OwnerProfileView').then((m) => ({ default: m.OwnerProfileView }))
);
const HeroManagerView = lazy(() =>
  import('./views/HeroManagerView').then((m) => ({ default: m.HeroManagerView }))
);
const BrandSettingsView = lazy(() =>
  import('./views/BrandSettingsView').then((m) => ({ default: m.BrandSettingsView }))
);
const GovernmentSchemesView = lazy(() =>
  import('./views/GovernmentSchemesView').then((m) => ({ default: m.GovernmentSchemesView }))
);
const LatestUpdatesView = lazy(() =>
  import('./views/LatestUpdatesView').then((m) => ({ default: m.LatestUpdatesView }))
);
const DocumentRequirementsView = lazy(() =>
  import('./views/DocumentRequirementsView').then((m) => ({ default: m.DocumentRequirementsView }))
);
const ServicesView = lazy(() =>
  import('./views/ServicesView').then((m) => ({ default: m.ServicesView }))
);
const GalleryView = lazy(() =>
  import('./views/GalleryView').then((m) => ({ default: m.GalleryView }))
);
const JourneyManagementView = lazy(() =>
  import('./views/JourneyManagementView').then((m) => ({ default: m.JourneyManagementView }))
);
const WebsiteContentView = lazy(() =>
  import('./views/WebsiteContentView').then((m) => ({ default: m.WebsiteContentView }))
);
const FaqView = lazy(() =>
  import('./views/FaqView').then((m) => ({ default: m.FaqView }))
);
const BusinessProfileView = lazy(() =>
  import('./views/BusinessProfileView').then((m) => ({ default: m.BusinessProfileView }))
);
const EnquiriesView = lazy(() =>
  import('./views/EnquiriesView').then((m) => ({ default: m.EnquiriesView }))
);
const CustomersView = lazy(() =>
  import('./views/CustomersView').then((m) => ({ default: m.CustomersView }))
);
const MediaLibraryView = lazy(() =>
  import('./views/MediaLibraryView').then((m) => ({ default: m.MediaLibraryView }))
);
const WebsiteSettingsView = lazy(() =>
  import('./views/WebsiteSettingsView').then((m) => ({ default: m.WebsiteSettingsView }))
);
const SeoManagerView = lazy(() =>
  import('./views/SeoManagerView').then((m) => ({ default: m.SeoManagerView }))
);
const ActivityLogsView = lazy(() =>
  import('./views/ActivityLogsView').then((m) => ({ default: m.ActivityLogsView }))
);

const renderActiveView = (activeTab: AdminTab): React.ReactNode => {
  switch (activeTab) {
    case 'overview':
      return <OverviewView />;
    case 'owner-profile':
      return <OwnerProfileView />;
    case 'hero-headline':
      return <HeroManagerView mode="headline" />;
    case 'hero-showcase':
      return <HeroManagerView mode="showcase" />;
    case 'hero-portrait':
      return <HeroManagerView mode="portrait" />;
    case 'brand-settings':
      return <BrandSettingsView />;
    case 'government-schemes':
      return <GovernmentSchemesView />;
    case 'latest-updates':
      return <LatestUpdatesView />;
    case 'doc-requirements':
      return <DocumentRequirementsView />;
    case 'services':
      return <ServicesView />;
    case 'gallery':
      return <GalleryView />;
    case 'journey':
      return <JourneyManagementView />;
    case 'content-about':
      return <WebsiteContentView focusedSection="about" />;
    case 'content-contact':
      return <WebsiteContentView focusedSection="contact" />;
    case 'faqs':
      return <FaqView />;
    case 'content-footer':
      return <WebsiteContentView focusedSection="footer" />;
    case 'business-profile':
      return <BusinessProfileView />;
    case 'enquiries':
      return <EnquiriesView />;
    case 'customers':
      return <CustomersView />;
    case 'media':
      return <MediaLibraryView />;
    case 'website-settings':
      return <WebsiteSettingsView />;
    case 'seo-manager':
      return <SeoManagerView />;
    case 'activity-logs':
      return <ActivityLogsView />;
    default:
      return <OverviewView />;
  }
};

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
      <div className="min-h-screen w-full bg-[#0A0A0E] text-[#E8E5DF] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-9 h-9 rounded-full border-2 border-[#C9A96E]/25 border-t-[#C9A96E] animate-spin" />
        <div className="text-xs font-mono tracking-widest uppercase text-[#85838A]">
          Opening Owner Control Center…
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

  return (
    <MotionConfig reducedMotion="user">
      <div className="admin-studio-theme min-h-screen bg-[#0A0A0E] text-[#E8E5DF] font-sans antialiased selection:bg-[#C9A96E]/25 selection:text-[#DFC492] overflow-x-hidden">
        <div className="flex min-h-screen">
          <Sidebar />

          <div
            className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
              sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'
            }`}
          >
            <TopBar />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
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
                      {renderActiveView(activeTab)}
                    </motion.div>
                  </AnimatePresence>
                </Suspense>
              </StudioErrorBoundary>
            </main>

            <footer className="px-4 sm:px-6 lg:px-8 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#85838A]">
              <span>Aman Computer — Owner Control Center · Account Protected</span>
              <span>
                {isSupabaseActive ? 'Online Data Sync Active' : 'Offline Workspace Mode'}
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
