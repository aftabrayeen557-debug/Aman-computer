import React, { Suspense, lazy } from 'react';
import { useAdmin } from './context/AdminContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { EnquiryDetailDrawer } from './components/EnquiryDetailDrawer';
import { ServiceModal } from './components/ServiceModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ToastContainer } from './components/ToastContainer';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { MarbleLogin } from './components/MarbleLogin';

// Code-splitting via React.lazy for all 20 views
const OverviewView = lazy(() => import('./views/OverviewView').then((m) => ({ default: m.OverviewView })));
const CustomersView = lazy(() => import('./views/CustomersView').then((m) => ({ default: m.CustomersView })));
const EnquiriesView = lazy(() => import('./views/EnquiriesView').then((m) => ({ default: m.EnquiriesView })));
const ServicesView = lazy(() => import('./views/ServicesView').then((m) => ({ default: m.ServicesView })));
const LatestUpdatesView = lazy(() => import('./views/LatestUpdatesView').then((m) => ({ default: m.LatestUpdatesView })));
const DocumentRequirementsView = lazy(() => import('./views/DocumentRequirementsView').then((m) => ({ default: m.DocumentRequirementsView })));
const GalleryView = lazy(() => import('./views/GalleryView').then((m) => ({ default: m.GalleryView })));
const JourneyManagementView = lazy(() => import('./views/JourneyManagementView').then((m) => ({ default: m.JourneyManagementView })));
const WebsiteContentView = lazy(() => import('./views/WebsiteContentView').then((m) => ({ default: m.WebsiteContentView })));
const FaqView = lazy(() => import('./views/FaqView').then((m) => ({ default: m.FaqView })));
const TestimonialsView = lazy(() => import('./views/TestimonialsView').then((m) => ({ default: m.TestimonialsView })));
const BusinessProfileView = lazy(() => import('./views/BusinessProfileView').then((m) => ({ default: m.BusinessProfileView })));
const ReceiptsTokensView = lazy(() => import('./views/ReceiptsTokensView').then((m) => ({ default: m.ReceiptsTokensView })));
const MediaLibraryView = lazy(() => import('./views/MediaLibraryView').then((m) => ({ default: m.MediaLibraryView })));
const ReportsAnalyticsView = lazy(() => import('./views/ReportsAnalyticsView').then((m) => ({ default: m.ReportsAnalyticsView })));
const NotificationsView = lazy(() => import('./views/NotificationsView').then((m) => ({ default: m.NotificationsView })));
const StaffManagementView = lazy(() => import('./views/StaffManagementView').then((m) => ({ default: m.StaffManagementView })));
const ActivityLogsView = lazy(() => import('./views/ActivityLogsView').then((m) => ({ default: m.ActivityLogsView })));
const BackupRestoreView = lazy(() => import('./views/BackupRestoreView').then((m) => ({ default: m.BackupRestoreView })));
const SettingsView = lazy(() => import('./views/SettingsView').then((m) => ({ default: m.SettingsView })));

const ViewLoadingFallback = () => (
  <div className="w-full py-20 flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
    <span className="text-xs font-mono text-[#857878] dark:text-[#B5A8A8] tracking-wider uppercase">
      Loading Terminal Workspace...
    </span>
  </div>
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
    return <MarbleLogin onSuccess={completeLoginTransition} externalError={authError} />;
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewView />;
      case 'customers':
        return <CustomersView />;
      case 'enquiries':
        return <EnquiriesView />;
      case 'services':
        return <ServicesView />;
      case 'latest-updates':
        return <LatestUpdatesView />;
      case 'doc-requirements':
        return <DocumentRequirementsView />;
      case 'gallery':
        return <GalleryView />;
      case 'journey':
        return <JourneyManagementView />;
      case 'website-content':
        return <WebsiteContentView />;
      case 'faqs':
        return <FaqView />;
      case 'testimonials':
        return <TestimonialsView />;
      case 'business-profile':
        return <BusinessProfileView />;
      case 'receipts':
        return <ReceiptsTokensView />;
      case 'media':
        return <MediaLibraryView />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'staff':
        return <StaffManagementView />;
      case 'activity-logs':
        return <ActivityLogsView />;
      case 'backup-restore':
        return <BackupRestoreView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E4E0] dark:bg-[#1A1818] text-[#2E2828] dark:text-[#E8E4E0] font-sans antialiased selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-200">
      <div className="flex min-h-screen">
        {/* Responsive Sidebar */}
        <Sidebar />

        {/* Main Content Workspace */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
          }`}
        >
          {/* Top Navbar */}
          <TopBar />

          {/* Dynamic Module Workspace with Code-Splitting Suspense */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Suspense fallback={<ViewLoadingFallback />}>
              {renderActiveView()}
            </Suspense>
          </main>

          {/* Footer Bar */}
          <footer className="px-6 py-4 border-t border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] flex flex-col sm:flex-row items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] gap-2 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Aman Computer Cyber Cafe & Digital Center — Operator Terminal v3.0</span>
            </div>
            <div>
              <span>
                {isSupabaseActive
                  ? 'Protected Counter Environment • Firebase Auth + Supabase RLS'
                  : 'Protected Counter Environment • Local Cache Fallback'}
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Modals & Drawers */}
      <EnquiryDetailDrawer />
      <ServiceModal />
      <GlobalSearchModal />
      <ReceiptPrintModal />
      <ToastContainer />
    </div>
  );
};
