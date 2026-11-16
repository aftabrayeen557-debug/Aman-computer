import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  AdminTab,
  Enquiry,
  EnquiryStatus,
  Customer,
  Receipt,
  ReceiptStatus,
  ServiceItem,
  WebsiteSectionContent,
  GalleryItem,
  Testimonial,
  FaqItem,
  LatestUpdateItem,
  DocumentRequirementItem,
  JourneyItem,
  BusinessProfile,
  MediaAsset,
  NotificationItem,
  StaffMember,
  ActivityLog,
  TerminalSettings,
  OwnerProfile,
  GovernmentSchemeItem,
} from '../types';
import { isKnownAdminTab, resolveStudioTab } from '../config/navigation';
import {
  normalizeOwnerProfile,
  validateOwnerProfileDraft,
} from '../services/ownerProfileService';
import { deleteStorageFileByUrl } from '../services/storageService';
import {
  INITIAL_SERVICES,
  INITIAL_ENQUIRIES,
  INITIAL_CUSTOMERS,
  INITIAL_RECEIPTS,
  INITIAL_WEBSITE_CONTENT,
  INITIAL_GALLERY,
  INITIAL_GOVERNMENT_SCHEMES,
  INITIAL_TESTIMONIALS,
  INITIAL_FAQS,
  INITIAL_LATEST_UPDATES,
  INITIAL_DOC_REQUIREMENTS,
  INITIAL_JOURNEY,
  INITIAL_BUSINESS_PROFILE,
  INITIAL_MEDIA_ASSETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STAFF,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { isFirebaseConfigured } from '../../lib/firebase';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  AdminProfile,
  clearPrivateAdminStorage,
  signOutAdmin,
  subscribeToAdminAuth,
} from '../services/authService';
import {
  DbWriteResult,
  dbGetCustomers,
  dbUpsertCustomer,
  dbDeleteCustomer,
  dbGetEnquiries,
  dbUpsertEnquiry,
  dbDeleteEnquiry,
  dbGetServices,
  dbUpsertService,
  dbDeleteService,
  dbGetLatestUpdates,
  dbUpsertLatestUpdate,
  dbDeleteLatestUpdate,
  dbGetDocRequirements,
  dbUpsertDocRequirement,
  dbDeleteDocRequirement,
  dbGetGalleryItems,
  dbUpsertGalleryItem,
  dbDeleteGalleryItem,
  dbGetJourneyMilestones,
  dbUpsertJourneyMilestone,
  dbDeleteJourneyMilestone,
  dbGetBusinessProfile,
  dbSaveBusinessProfile,
  dbGetWebsiteContent,
  dbSaveWebsiteContent,
  dbGetFaqs,
  dbUpsertFaq,
  dbDeleteFaq,
  dbGetTestimonials,
  dbUpsertTestimonial,
  dbDeleteTestimonial,
  dbGetReceipts,
  dbUpsertReceipt,
  dbDeleteReceipt,
  dbGetMediaAssets,
  dbUpsertMediaAsset,
  dbDeleteMediaAsset,
  dbGetNotifications,
  dbUpsertNotification,
  dbClearNotifications,
  dbGetStaffMembers,
  dbUpsertStaffMember,
  dbDeleteStaffMember,
  dbGetActivityLogs,
  dbAddActivityLog,
  dbGetTerminalSettings,
  dbSaveTerminalSettings,
  dbGetGovernmentSchemes,
  dbUpsertGovernmentScheme,
  dbDeleteGovernmentScheme,
} from '../services/supabaseService';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'unauthorized';
export type DbSyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'not-configured';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AdminContextType {
  // Authentication & Security State
  authStatus: AuthStatus;
  currentUser: AdminProfile | null;
  authError: string | null;
  logout: () => Promise<void>;
  completeLoginTransition: () => void;
  isSupabaseActive: boolean;
  isFirebaseActive: boolean;
  dbSyncStatus: DbSyncStatus;
  hydrateFromSupabase: () => Promise<void>;

  // Navigation & UI Layout
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  toggleDarkMode: () => void;
  authViewMode: 'dashboard' | 'login';
  setAuthViewMode: (mode: 'dashboard' | 'login') => void;

  // Active Print Receipt Modal
  activePrintReceipt: Receipt | null;
  setActivePrintReceipt: (receipt: Receipt | null) => void;

  // 1. Operations: Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'lastVisitDate' | 'totalVisits' | 'totalSpent'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  exportCustomersCSV: () => void;

  // 1. Operations: Enquiries
  enquiries: Enquiry[];
  addEnquiry: (enquiry: Omit<Enquiry, 'id' | 'createdAt'>) => void;
  updateEnquiryStatus: (id: string, status: EnquiryStatus) => void;
  updateEnquiryNotes: (id: string, notes: string) => void;
  deleteEnquiry: (id: string) => void;
  selectedEnquiry: Enquiry | null;
  setSelectedEnquiry: (enquiry: Enquiry | null) => void;
  exportEnquiriesCSV: () => void;

  // 1. Operations: Services & Rates
  services: ServiceItem[];
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  toggleServiceVisibility: (id: string) => void;
  toggleServiceFeatured: (id: string) => void;
  serviceModalOpen: boolean;
  setServiceModalOpen: (open: boolean) => void;
  editingService: ServiceItem | null;
  setEditingService: (service: ServiceItem | null) => void;

  // 2. Website Content: Door 0 Latest Updates
  latestUpdates: LatestUpdateItem[];
  addLatestUpdate: (update: Omit<LatestUpdateItem, 'id' | 'publishedDate'> & { publishedDate?: string }) => void;
  updateLatestUpdate: (id: string, updates: Partial<LatestUpdateItem>) => void;
  deleteLatestUpdate: (id: string) => void;
  toggleLatestUpdatePublished: (id: string) => void;

  // 2. Website Content: Door 1 Document Requirements
  docRequirements: DocumentRequirementItem[];
  addDocRequirement: (item: Omit<DocumentRequirementItem, 'id'>) => void;
  updateDocRequirement: (id: string, updates: Partial<DocumentRequirementItem>) => void;
  deleteDocRequirement: (id: string) => void;
  toggleDocRequirementPublished: (id: string) => void;

  // 2. Website Content: Door 4 Gallery
  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'uploadedAt'>) => void;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  toggleGalleryVisibility: (id: string) => void;
  toggleGalleryFeatured: (id: string) => void;

  // 2. Website Content: Our Journey Timeline
  journey: JourneyItem[];
  addJourneyItem: (item: Omit<JourneyItem, 'id'>) => void;
  updateJourneyItem: (id: string, updates: Partial<JourneyItem>) => void;
  deleteJourneyItem: (id: string) => void;
  toggleJourneyPublished: (id: string) => void;

  // 2B. Website Content: Government Schemes
  governmentSchemes: GovernmentSchemeItem[];
  addGovernmentScheme: (scheme: Omit<GovernmentSchemeItem, 'id'>) => void;
  updateGovernmentScheme: (id: string, updates: Partial<GovernmentSchemeItem>) => void;
  deleteGovernmentScheme: (id: string) => void;
  toggleGovernmentSchemePublished: (id: string) => void;

  // 2. Website Content: Sections (Hero, Showcase, Portrait, Brand, Doors, Settings, SEO) & Owner Profile
  websiteContent: WebsiteSectionContent;
  updateWebsiteContent: (section: keyof WebsiteSectionContent, data: any) => void;
  ownerProfile: OwnerProfile;
  ownerProfileStatus: 'ready' | 'loading' | 'saving' | 'error';
  ownerProfileError: string | null;
  updateOwnerProfile: (profile: OwnerProfile) => Promise<boolean>;
  refreshOwnerProfile: () => Promise<void>;

  // 2. Website Content: FAQs
  faqs: FaqItem[];
  addFaq: (faq: Omit<FaqItem, 'id'>) => void;
  updateFaq: (id: string, updates: Partial<FaqItem>) => void;
  deleteFaq: (id: string) => void;
  toggleFaqVisibility: (id: string) => void;

  // 2. Website Content: Testimonials
  testimonials: Testimonial[];
  addTestimonial: (t: Omit<Testimonial, 'id' | 'date'>) => void;
  approveTestimonial: (id: string) => void;
  deleteTestimonial: (id: string) => void;

  // 3. Business Management: Business Profile
  businessProfile: BusinessProfile;
  updateBusinessProfile: (updates: Partial<BusinessProfile>) => void;

  // 3. Business Management: Receipts & Tokens
  receipts: Receipt[];
  addReceipt: (receiptData: Omit<Receipt, 'id' | 'tokenNumber' | 'createdAt'>) => Receipt;
  updateReceiptStatus: (id: string, status: ReceiptStatus) => void;
  deleteReceipt: (id: string) => void;
  exportReceiptsCSV: () => void;

  // 3. Business Management: Media Library
  mediaAssets: MediaAsset[];
  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'uploadedDate'>) => void;
  deleteMediaAsset: (id: string) => void;

  // 4. System: Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // 4. System: Staff
  staff: StaffMember[];
  addStaff: (member: Omit<StaffMember, 'id' | 'joinedDate'>) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;

  // 4. System: Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, module: string, details: string) => void;
  clearActivityLogs: () => void;
  exportActivityLogsCSV: () => void;

  // 4. System: Terminal Settings
  terminalSettings: TerminalSettings;
  updateTerminalSettings: (updates: Partial<TerminalSettings>) => void;

  // Backup & Restore
  exportCompleteBackupJSON: () => void;
  restoreBackupJSON: (jsonString: string) => boolean;
  resetAllData: () => void;

  // Toast System
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

const safeGetStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed ?? fallback;
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
    return fallback;
  }
};

/**
 * Safeguard localStorage against storing oversized Base64 image blobs (>16KB).
 */
const stripLargeDataUris = (val: unknown): unknown => {
  if (typeof val === 'string') {
    if (val.startsWith('data:image/') && val.length > 16384) {
      return '';
    }
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(stripLargeDataUris);
  }
  if (val && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = stripLargeDataUris(v);
    }
    return out;
  }
  return val;
};

const safeSetStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = stripLargeDataUris(value);
    const serialized = JSON.stringify(sanitized);
    if (serialized.length > 512 * 1024) {
      console.warn(`Skipping localStorage cache write for "${key}" (>512KB limit)`);
      return;
    }
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.error(`Error writing localStorage key "${key}":`, e);
  }
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFirebaseActive = isFirebaseConfigured();
  const isSupabaseActive = isSupabaseConfigured();

  // Authentication & Sync State (Fail-Closed: never default to authenticated dashboard)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [currentUser, setCurrentUser] = useState<AdminProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dbSyncStatus, setDbSyncStatus] = useState<DbSyncStatus>(
    isSupabaseActive ? 'idle' : 'not-configured'
  );

  // Navigation & Theme State
  const [currentTab, setCurrentTabState] = useState<AdminTab>(() => {
    if (typeof window === 'undefined') return 'overview';
    const param = new URLSearchParams(window.location.search).get('tab');
    return isKnownAdminTab(param) ? resolveStudioTab(param) : 'overview';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [activePrintReceipt, setActivePrintReceipt] = useState<Receipt | null>(null);

  const setCurrentTab = useCallback((tab: AdminTab) => {
    const resolved = resolveStudioTab(tab);
    setCurrentTabState(resolved);
    if (typeof window !== 'undefined' && authStatusRef.current === 'authenticated') {
      const targetUrl = resolved === 'overview' ? '/admin' : `/admin?tab=${encodeURIComponent(resolved)}`;
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== targetUrl) {
        window.history.replaceState({}, '', targetUrl);
      }
    }
  }, []);

  const authStatusRef = useRef<AuthStatus>('checking');
  const loginTransitionTimerRef = useRef<number | null>(null);
  const isHydratingRef = useRef(false);

  useEffect(() => {
    authStatusRef.current = authStatus;
  }, [authStatus]);

  // Settings
  const [terminalSettings, setTerminalSettings] = useState<TerminalSettings>(() =>
    safeGetStorage<TerminalSettings>('aman_terminal_settings', INITIAL_SETTINGS)
  );

  useEffect(() => {
    safeSetStorage('aman_terminal_settings', terminalSettings);
  }, [terminalSettings]);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedV2 = localStorage.getItem('aman_admin_theme_v2');
      if (savedV2 !== null) return savedV2 === 'dark';
      return false;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-mode', 'dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('aman_admin_theme_v2', 'dark');
      localStorage.setItem('aman_admin_dark', 'true');
    } else {
      document.documentElement.removeAttribute('data-mode');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aman_admin_theme_v2', 'light');
      localStorage.setItem('aman_admin_dark', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Authentication View Mode ('login' default until Firebase + Admin verification passes)
  const [authViewMode, setAuthViewModeState] = useState<'dashboard' | 'login'>('login');

  const syncRouteForAuth = useCallback((mode: 'dashboard' | 'login') => {
    if (typeof window === 'undefined') return;
    if (mode === 'login') {
      if (window.location.pathname !== '/login') {
        window.history.replaceState({}, '', '/login');
      }
      return;
    }
    const param = new URLSearchParams(window.location.search).get('tab');
    const resolved = isKnownAdminTab(param) ? resolveStudioTab(param) : 'overview';
    const targetUrl = resolved === 'overview' ? '/admin' : `/admin?tab=${encodeURIComponent(resolved)}`;
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) {
      window.history.replaceState({}, '', targetUrl);
    }
  }, []);

  const setAuthViewMode = useCallback(
    (mode: 'dashboard' | 'login') => {
      if (mode === 'dashboard' && authStatusRef.current !== 'authenticated') {
        setAuthViewModeState('login');
        syncRouteForAuth('login');
        return;
      }
      setAuthViewModeState(mode);
      if (typeof window !== 'undefined') {
        const targetUrl = mode === 'login' ? '/login' : '/admin';
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({}, '', targetUrl);
        }
      }
    },
    [syncRouteForAuth]
  );

  useEffect(() => {
    const handlePop = () => {
      const p = window.location.pathname;
      const s = new URLSearchParams(window.location.search);
      const wantsLogin =
        p === '/login' || p === '/login/' || p.includes('/admin/login') || s.get('view') === 'login';
      if (wantsLogin || authStatusRef.current !== 'authenticated') {
        setAuthViewModeState('login');
        if (!wantsLogin && authStatusRef.current !== 'authenticated') {
          syncRouteForAuth('login');
        }
      } else {
        setAuthViewModeState('dashboard');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [syncRouteForAuth]);

  // Keyboard shortcut CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (authStatusRef.current === 'authenticated') {
          setSearchModalOpen((prev) => !prev);
        }
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setMobileMenuOpen(false);
        setActivePrintReceipt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback((title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper that handles Supabase persistence honestly and never claims DB success on failure
  const persistWrite = useCallback(
    async (
      operation: () => Promise<DbWriteResult>,
      successTitle: string,
      successMsg: string,
      toastType: ToastMessage['type'] = 'success'
    ): Promise<boolean> => {
      if (!isSupabaseActive) {
        showToast(`${successTitle} (Saved Locally)`, `${successMsg} Changes are saved in offline mode.`, 'info');
        return true;
      }

      setDbSyncStatus('syncing');
      try {
        const res = await operation();
        if (!res.ok) {
          console.error('Persist write rejected:', res.error);
          setDbSyncStatus('error');
          showToast(
            'Unable to Save Changes',
            "We couldn't save your changes right now. Please try again.",
            'error'
          );
          return false;
        }
        setDbSyncStatus('synced');
        showToast(successTitle, successMsg, toastType);
        return true;
      } catch (err: any) {
        console.error('Persist write exception:', err);
        setDbSyncStatus('error');
        showToast('Unable to Save Changes', "We couldn't save your changes. Please try again.", 'error');
        return false;
      }
    },
    [isSupabaseActive, showToast]
  );

  // Private Business States (Initialized empty while unauthenticated; hydrated strictly after server-verified auth)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const [services, setServices] = useState<ServiceItem[]>(() =>
    safeGetStorage<ServiceItem[]>('aman_services', INITIAL_SERVICES)
  );
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [latestUpdates, setLatestUpdates] = useState<LatestUpdateItem[]>(() =>
    safeGetStorage<LatestUpdateItem[]>('aman_latest_updates', INITIAL_LATEST_UPDATES)
  );
  const [docRequirements, setDocRequirements] = useState<DocumentRequirementItem[]>(() =>
    safeGetStorage<DocumentRequirementItem[]>('aman_doc_requirements', INITIAL_DOC_REQUIREMENTS)
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    safeGetStorage<GalleryItem[]>('aman_gallery', INITIAL_GALLERY)
  );
  const [journey, setJourney] = useState<JourneyItem[]>(() =>
    safeGetStorage<JourneyItem[]>('aman_journey', INITIAL_JOURNEY)
  );
  const [governmentSchemes, setGovernmentSchemes] = useState<GovernmentSchemeItem[]>(() =>
    safeGetStorage<GovernmentSchemeItem[]>('aman_government_schemes', INITIAL_GOVERNMENT_SCHEMES)
  );
  const [websiteContent, setWebsiteContent] = useState<WebsiteSectionContent>(() =>
    safeGetStorage<WebsiteSectionContent>('aman_website_content', INITIAL_WEBSITE_CONTENT)
  );
  const [faqs, setFaqs] = useState<FaqItem[]>(() =>
    safeGetStorage<FaqItem[]>('aman_faqs', INITIAL_FAQS)
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() =>
    safeGetStorage<Testimonial[]>('aman_testimonials', INITIAL_TESTIMONIALS)
  );
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() =>
    safeGetStorage<BusinessProfile>('aman_business_profile', INITIAL_BUSINESS_PROFILE)
  );
  const [ownerProfileStatus, setOwnerProfileStatus] = useState<'ready' | 'loading' | 'saving' | 'error'>('ready');
  const [ownerProfileError, setOwnerProfileError] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() =>
    safeGetStorage<MediaAsset[]>('aman_media', INITIAL_MEDIA_ASSETS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // Journey Sorting Helper
  const monthOrderMap: Record<string, number> = {
    january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
    april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
    august: 8, aug: 8, september: 9, sep: 9, october: 10, oct: 10,
    november: 11, nov: 11, december: 12, dec: 12,
  };

  const sortJourneyChronologically = useCallback((items: JourneyItem[]): JourneyItem[] => {
    return [...items].sort((a, b) => {
      const ya = parseInt(a.year, 10) || 2024;
      const yb = parseInt(b.year, 10) || 2024;
      if (ya !== yb) return ya - yb;
      const ma = monthOrderMap[a.month?.toLowerCase() || ''] || monthOrderMap[a.date?.toLowerCase().slice(0, 3) || ''] || 1;
      const mb = monthOrderMap[b.month?.toLowerCase() || ''] || monthOrderMap[b.date?.toLowerCase().slice(0, 3) || ''] || 1;
      if (ma !== mb) return ma - mb;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, []);

  const clearPrivateAdminState = useCallback(() => {
    clearPrivateAdminStorage();
    setCustomers([]);
    setReceipts([]);
    setEnquiries([]);
    setStaff([]);
    setActivityLogs([]);
    setNotifications([]);
    setSelectedEnquiry(null);
    setActivePrintReceipt(null);
    setSearchModalOpen(false);
    setEditingService(null);
    setServiceModalOpen(false);
    setDbSyncStatus(isSupabaseActive ? 'idle' : 'not-configured');
    isHydratingRef.current = false;
  }, [isSupabaseActive]);

  // Hydrate all 17 modules from Supabase PostgreSQL once authenticated
  const hydrateFromSupabase = useCallback(async () => {
    if (!isSupabaseActive || isHydratingRef.current) return;
    isHydratingRef.current = true;
    setDbSyncStatus('syncing');

    try {
      const [
        dbCust,
        dbEnq,
        dbSrv,
        dbUpd,
        dbDoc,
        dbGal,
        dbJrn,
        dbProf,
        dbWeb,
        dbFaq,
        dbTst,
        dbRcp,
        dbMed,
        dbNtf,
        dbStf,
        dbLogs,
        dbSettings,
        dbSchemes,
      ] = await Promise.all([
        dbGetCustomers(),
        dbGetEnquiries(),
        dbGetServices(),
        dbGetLatestUpdates(),
        dbGetDocRequirements(),
        dbGetGalleryItems(),
        dbGetJourneyMilestones(),
        dbGetBusinessProfile(),
        dbGetWebsiteContent(),
        dbGetFaqs(),
        dbGetTestimonials(),
        dbGetReceipts(),
        dbGetMediaAssets(),
        dbGetNotifications(),
        dbGetStaffMembers(),
        dbGetActivityLogs(),
        dbGetTerminalSettings(),
        dbGetGovernmentSchemes(),
      ]);

      // Detect whether cloud database is completely unseeded before overwriting local cache
      const totalCloudRows =
        (dbCust?.length || 0) +
        (dbEnq?.length || 0) +
        (dbSrv?.length || 0) +
        (dbUpd?.length || 0) +
        (dbDoc?.length || 0) +
        (dbGal?.length || 0) +
        (dbJrn?.length || 0) +
        (dbFaq?.length || 0) +
        (dbTst?.length || 0) +
        (dbRcp?.length || 0) +
        (dbSchemes?.length || 0);

      if (totalCloudRows === 0) {
        if (dbProf !== null) setBusinessProfile(dbProf);
        if (dbWeb !== null) {
          setWebsiteContent((prev) => ({
            ...INITIAL_WEBSITE_CONTENT,
            ...prev,
            ...dbWeb,
          }));
          if (Array.isArray(dbWeb.governmentSchemesFallback) && dbWeb.governmentSchemesFallback.length > 0) {
            setGovernmentSchemes(dbWeb.governmentSchemesFallback);
          }
        }
        // Hydrate any pre-migration local private records strictly after authentication
        setCustomers(safeGetStorage<Customer[]>('aman_customers', []));
        setEnquiries(safeGetStorage<Enquiry[]>('aman_enquiries', []));
        setReceipts(safeGetStorage<Receipt[]>('aman_receipts', []));
        setStaff(safeGetStorage<StaffMember[]>('aman_staff', []));
        setNotifications(safeGetStorage<NotificationItem[]>('aman_notifications', []));
        setActivityLogs(safeGetStorage<ActivityLog[]>('aman_activity_logs', []));

        setDbSyncStatus('synced');
        return;
      }

      if (dbCust !== null) setCustomers(dbCust);
      if (dbEnq !== null) setEnquiries(dbEnq);
      if (dbSrv !== null) setServices(dbSrv);
      if (dbUpd !== null) setLatestUpdates(dbUpd);
      if (dbDoc !== null) setDocRequirements(dbDoc);
      if (dbGal !== null) setGallery(dbGal);
      if (dbJrn !== null) setJourney(sortJourneyChronologically(dbJrn));
      if (dbProf !== null) setBusinessProfile(dbProf);
      if (dbWeb !== null) {
        setWebsiteContent((prev) => ({
          ...INITIAL_WEBSITE_CONTENT,
          ...prev,
          ...dbWeb,
        }));
      }
      if (dbSchemes !== null) {
        setGovernmentSchemes(dbSchemes);
      } else if (dbWeb && Array.isArray(dbWeb.governmentSchemesFallback)) {
        setGovernmentSchemes(dbWeb.governmentSchemesFallback);
      }
      if (dbFaq !== null) setFaqs(dbFaq);
      if (dbTst !== null) setTestimonials(dbTst);
      if (dbRcp !== null) setReceipts(dbRcp);
      if (dbMed !== null) setMediaAssets(dbMed);
      if (dbNtf !== null) setNotifications(dbNtf);
      if (dbStf !== null) setStaff(dbStf);
      if (dbLogs !== null) setActivityLogs(dbLogs);
      if (dbSettings !== null) setTerminalSettings(dbSettings);

      setDbSyncStatus('synced');
    } catch (err: any) {
      console.error('Workspace sync error:', err);
      setDbSyncStatus('error');
      showToast('Unable to Load Information', 'We could not load your latest records right now. Please try again.', 'error');
    } finally {
      isHydratingRef.current = false;
    }
  }, [isSupabaseActive, showToast, sortJourneyChronologically]);

  // Real Firebase Auth Listener -> Protected Route Enforcement
  useEffect(() => {
    if (!isFirebaseActive || !isSupabaseActive) {
      setAuthStatus('unauthenticated');
      setCurrentUser(null);
      setAuthViewModeState('login');
      syncRouteForAuth('login');
      return;
    }

    const unsubscribe = subscribeToAdminAuth((user, profile, reason, errorMessage) => {
      if (loginTransitionTimerRef.current) {
        window.clearTimeout(loginTransitionTimerRef.current);
        loginTransitionTimerRef.current = null;
      }

      if (user && profile && profile.isAuthorized) {
        setCurrentUser(profile);
        setAuthError(null);

        const wasInteractiveLogin =
          authStatusRef.current === 'unauthenticated' || authStatusRef.current === 'unauthorized';

        if (wasInteractiveLogin) {
          // Give MarbleLogin lock() animation 850ms to play cleanly before opening /admin
          loginTransitionTimerRef.current = window.setTimeout(() => {
            authStatusRef.current = 'authenticated';
            setAuthStatus('authenticated');
            setAuthViewModeState('dashboard');
            syncRouteForAuth('dashboard');
            void hydrateFromSupabase();
          }, 900);
        } else {
          authStatusRef.current = 'authenticated';
          setAuthStatus('authenticated');
          setAuthViewModeState('dashboard');
          syncRouteForAuth('dashboard');
          void hydrateFromSupabase();
        }
      } else {
        const wasAuthenticated = authStatusRef.current === 'authenticated';
        authStatusRef.current = reason === 'unauthorized' ? 'unauthorized' : 'unauthenticated';
        setCurrentUser(null);
        setAuthStatus(authStatusRef.current);

        // Immediately purge sensitive data when a session ends or an unauthorized user is rejected
        if (wasAuthenticated || reason === 'unauthorized') {
          clearPrivateAdminState();
        }

        setAuthError(
          reason === 'unauthorized'
            ? errorMessage ||
                'Access denied: Only the sole authorized Aman Computer administrator can access this terminal.'
            : null
        );
        setAuthViewModeState('login');
        syncRouteForAuth('login');
      }
    });

    return () => {
      if (loginTransitionTimerRef.current) {
        window.clearTimeout(loginTransitionTimerRef.current);
      }
      unsubscribe();
    };
  }, [isFirebaseActive, isSupabaseActive, hydrateFromSupabase, syncRouteForAuth, clearPrivateAdminState]);

  const completeLoginTransition = useCallback(() => {
    if (authStatusRef.current !== 'authenticated' && !currentUser) return;
    if (loginTransitionTimerRef.current) {
      window.clearTimeout(loginTransitionTimerRef.current);
      loginTransitionTimerRef.current = null;
    }
    authStatusRef.current = 'authenticated';
    setAuthStatus('authenticated');
    setAuthViewModeState('dashboard');
    syncRouteForAuth('dashboard');
    void hydrateFromSupabase();
  }, [hydrateFromSupabase, syncRouteForAuth, currentUser]);

  const logout = useCallback(async () => {
    if (loginTransitionTimerRef.current) {
      window.clearTimeout(loginTransitionTimerRef.current);
      loginTransitionTimerRef.current = null;
    }
    authStatusRef.current = 'unauthenticated';
    setAuthStatus('unauthenticated');
    setCurrentUser(null);
    clearPrivateAdminState();
    await signOutAdmin();
    setAuthViewModeState('login');
    syncRouteForAuth('login');
    showToast('Signed Out', 'You have signed out safely and your workspace is locked.', 'info');
  }, [clearPrivateAdminState, syncRouteForAuth, showToast]);

  // Persist private states strictly when authenticated; never leak private data into localStorage when logged out
  useEffect(() => {
    if (authStatus === 'authenticated') safeSetStorage('aman_activity_logs', activityLogs);
  }, [activityLogs, authStatus]);
  useEffect(() => {
    if (authStatus === 'authenticated') safeSetStorage('aman_customers', customers);
  }, [customers, authStatus]);
  useEffect(() => {
    if (authStatus === 'authenticated') safeSetStorage('aman_receipts', receipts);
  }, [receipts, authStatus]);
  useEffect(() => {
    if (authStatus === 'authenticated') safeSetStorage('aman_enquiries', enquiries);
  }, [enquiries, authStatus]);

  useEffect(() => {
    safeSetStorage('aman_services', services);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aman_services_changed', { detail: services }));
    }
  }, [services]);

  useEffect(() => {
    safeSetStorage('aman_latest_updates', latestUpdates);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aman_updates_changed', { detail: latestUpdates }));
    }
  }, [latestUpdates]);

  useEffect(() => {
    safeSetStorage('aman_doc_requirements', docRequirements);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aman_docs_changed', { detail: docRequirements }));
    }
  }, [docRequirements]);

  useEffect(() => {
    safeSetStorage('aman_gallery', gallery);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aman_gallery_changed', { detail: gallery }));
    }
  }, [gallery]);

  useEffect(() => {
    safeSetStorage('aman_journey', journey);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aman_journey_changed', { detail: journey }));
    }
  }, [journey]);

  useEffect(() => {
    safeSetStorage('aman_government_schemes', governmentSchemes);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aman_schemes_changed', { detail: governmentSchemes }));
    }
  }, [governmentSchemes]);

  useEffect(() => {
    safeSetStorage('aman_website_content', websiteContent);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aman_website_content_changed', { detail: websiteContent }));
    }
  }, [websiteContent]);

  useEffect(() => {
    safeSetStorage('aman_faqs', faqs);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aman_faqs_changed', { detail: faqs }));
    }
  }, [faqs]);

  useEffect(() => safeSetStorage('aman_testimonials', testimonials), [testimonials]);

  useEffect(() => {
    safeSetStorage('aman_business_profile', businessProfile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aman_business_profile_changed', { detail: businessProfile }));
    }
  }, [businessProfile]);

  useEffect(() => safeSetStorage('aman_media', mediaAssets), [mediaAssets]);
  useEffect(() => {
    if (authStatus === 'authenticated') safeSetStorage('aman_notifications', notifications);
  }, [notifications, authStatus]);
  useEffect(() => {
    if (authStatus === 'authenticated') safeSetStorage('aman_staff', staff);
  }, [staff, authStatus]);

  // Terminal Settings
  const updateTerminalSettings = (updates: Partial<TerminalSettings>) => {
    const next = { ...terminalSettings, ...updates };
    setTerminalSettings(next);
    void persistWrite(
      () => dbSaveTerminalSettings(next),
      'Settings Saved',
      'Terminal preferences synced.'
    );
  };

  // Activity Logs
  const addActivityLog = useCallback(
    (action: string, module: string, details: string) => {
      const now = new Date();
      const timeStr = now.toISOString();
      const newLog: ActivityLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        operator: currentUser?.name || currentUser?.email || 'Admin Operator',
        action,
        module,
        details,
        ipAddress: 'Authorized Web Session',
        timestamp: timeStr,
      };
      setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
      if (isSupabaseActive && authStatusRef.current === 'authenticated') {
        void dbAddActivityLog(newLog);
      }
    },
    [currentUser, isSupabaseActive]
  );

  const clearActivityLogs = () => {
    setActivityLogs([]);
    showToast('Logs Cleared', 'Local view of activity log history cleared.', 'info');
  };

  const exportActivityLogsCSV = () => {
    const headers = ['ID', 'Timestamp', 'Operator', 'Action', 'Module', 'Details', 'Terminal'];
    const rows = activityLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.operator}"`,
      `"${l.action}"`,
      `"${l.module}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aman_Activity_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Exported', `Exported ${activityLogs.length} audit entries.`);
  };

  // 1. Customers CRUD
  const addCustomer = (
    data: Omit<Customer, 'id' | 'createdAt' | 'lastVisitDate' | 'totalVisits' | 'totalSpent'>
  ): Customer => {
    const today = new Date().toISOString().slice(0, 10);
    const newCust: Customer = {
      ...data,
      id: 'CUST-' + Date.now().toString(36).toUpperCase(),
      createdAt: today,
      lastVisitDate: today,
      totalVisits: 1,
      totalSpent: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
    addActivityLog('CUSTOMER_ADD', 'Customers', `Registered customer: ${newCust.name} (${newCust.phone})`);
    void persistWrite(
      () => dbUpsertCustomer(newCust),
      'Customer Saved',
      `${newCust.name} persisted to database.`
    );
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const existing = customers.find((c) => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    addActivityLog('CUSTOMER_UPDATE', 'Customers', `Updated profile for ID: ${id}`);
    void persistWrite(
      () => dbUpsertCustomer(updated),
      'Customer Updated',
      'Profile changes saved.'
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    addActivityLog('CUSTOMER_DELETE', 'Customers', `Deleted customer ID: ${id}`);
    void persistWrite(
      () => dbDeleteCustomer(id),
      'Customer Removed',
      'Record deleted from directory.',
      'info'
    );
  };

  const exportCustomersCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Category', 'Address', 'Total Visits', 'Total Spent (₹)', 'Last Visit'];
    const rows = customers.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.category}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.totalVisits,
      c.totalSpent,
      c.lastVisitDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Aman_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Exported', `Downloaded ${customers.length} customer records.`);
  };

  // 2. Receipts & Tokens CRUD
  const addReceipt = (data: Omit<Receipt, 'id' | 'tokenNumber' | 'createdAt'>): Receipt => {
    const maxToken = receipts.reduce((max, r) => (r.tokenNumber > max ? r.tokenNumber : max), 40);
    const now = new Date();
    const newReceipt: Receipt = {
      ...data,
      id: `RCP-${now.getFullYear()}-${maxToken + 1}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      tokenNumber: maxToken + 1,
      createdAt: now.toISOString(),
    };
    setReceipts((prev) => [newReceipt, ...prev]);

    let updatedCustomer: Customer | null = null;
    if (data.customerId) {
      const target = customers.find((c) => c.id === data.customerId);
      if (target) {
        updatedCustomer = {
          ...target,
          totalVisits: target.totalVisits + 1,
          totalSpent: target.totalSpent + data.totalAmount,
          lastVisitDate: new Date().toISOString().slice(0, 10),
        };
        setCustomers((prev) => prev.map((c) => (c.id === data.customerId ? updatedCustomer! : c)));
      }
    }

    addActivityLog(
      'RECEIPT_GENERATED',
      'Receipts',
      `Created Token #${newReceipt.tokenNumber} for ${newReceipt.customerName} (₹${newReceipt.totalAmount})`
    );

    void persistWrite(
      async () => {
        const res = await dbUpsertReceipt(newReceipt);
        if (!res.ok) return res;
        if (updatedCustomer) {
          await dbUpsertCustomer(updatedCustomer);
        }
        return res;
      },
      'Token Generated',
      `Token #${newReceipt.tokenNumber} saved for ${newReceipt.customerName}.`
    );

    return newReceipt;
  };

  const updateReceiptStatus = (id: string, status: ReceiptStatus) => {
    const existing = receipts.find((r) => r.id === id);
    if (!existing) return;
    const updated = { ...existing, status };
    setReceipts((prev) => prev.map((r) => (r.id === id ? updated : r)));
    addActivityLog('RECEIPT_STATUS', 'Receipts', `Updated ${id} status to ${status}`);
    void persistWrite(
      () => dbUpsertReceipt(updated),
      'Status Updated',
      `Receipt status changed to ${status}.`
    );
  };

  const deleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    addActivityLog('RECEIPT_DELETE', 'Receipts', `Deleted receipt ${id}`);
    void persistWrite(
      () => dbDeleteReceipt(id),
      'Receipt Deleted',
      'Record removed from system.',
      'info'
    );
  };

  const exportReceiptsCSV = () => {
    const headers = [
      'Receipt ID',
      'Token #',
      'Customer Name',
      'Phone',
      'Service',
      'Govt Fee (₹)',
      'Service Fee (₹)',
      'Total (₹)',
      'Mode',
      'Status',
      'Date',
    ];
    const rows = receipts.map((r) => [
      r.id,
      r.tokenNumber,
      `"${r.customerName.replace(/"/g, '""')}"`,
      `"${r.customerPhone}"`,
      `"${r.serviceName.replace(/"/g, '""')}"`,
      r.govtChallanFee,
      r.operatorServiceFee,
      r.totalAmount,
      r.paymentMode,
      r.status,
      `"${r.createdAt}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Aman_Receipts_Tokens_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Exported', `Exported ${receipts.length} receipt tokens.`);
  };

  // 3. Enquiries CRUD
  const addEnquiry = (enquiry: Omit<Enquiry, 'id' | 'createdAt'>) => {
    const newEnq: Enquiry = {
      ...enquiry,
      id: 'ENQ-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    setEnquiries((prev) => [newEnq, ...prev]);
    addActivityLog('ENQUIRY_ADD', 'Enquiries', `Logged enquiry from ${newEnq.customerName}`);
    void persistWrite(
      () => dbUpsertEnquiry(newEnq),
      'Enquiry Created',
      `Added request for ${newEnq.customerName}.`
    );
  };

  const updateEnquiryStatus = (id: string, status: EnquiryStatus) => {
    const existing = enquiries.find((e) => e.id === id);
    if (!existing) return;
    const updated = { ...existing, status };
    setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry(updated);
    }
    addActivityLog('STATUS_UPDATE', 'Enquiries', `Changed status of ${id} to ${status}`);
    void persistWrite(
      () => dbUpsertEnquiry(updated),
      'Status Updated',
      `Enquiry ${id} is now ${status.toUpperCase()}`
    );
  };

  const updateEnquiryNotes = (id: string, notes: string) => {
    const existing = enquiries.find((e) => e.id === id);
    if (!existing) return;
    const updated = { ...existing, adminNotes: notes };
    setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry(updated);
    }
    addActivityLog('NOTES_UPDATE', 'Enquiries', `Updated admin notes for ${id}`);
    void persistWrite(
      () => dbUpsertEnquiry(updated),
      'Notes Saved',
      'Internal operator notes updated successfully.'
    );
  };

  const deleteEnquiry = (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
    addActivityLog('DELETE', 'Enquiries', `Deleted enquiry ${id}`);
    void persistWrite(
      () => dbDeleteEnquiry(id),
      'Enquiry Deleted',
      `Record ${id} removed from dashboard.`,
      'info'
    );
  };

  const exportEnquiriesCSV = () => {
    const headers = ['ID', 'Customer Name', 'Phone', 'Service', 'Status', 'Urgency', 'Created At', 'Admin Notes'];
    const rows = enquiries.map((e) => [
      e.id,
      `"${e.customerName.replace(/"/g, '""')}"`,
      `"${e.phoneNumber}"`,
      `"${e.serviceName.replace(/"/g, '""')}"`,
      e.status,
      e.urgency,
      `"${e.createdAt}"`,
      `"${(e.adminNotes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Aman_Computer_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addActivityLog('EXPORT_CSV', 'Enquiries', `Exported ${enquiries.length} enquiries to CSV file`);
    showToast('CSV Exported', `Downloaded ${enquiries.length} records to spreadsheet.`);
  };

  // 4. Services & Rates CRUD
  const addService = (data: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...data,
      id: 'srv-' + Date.now().toString(36),
    };
    setServices((prev) => [...prev, newService]);
    addActivityLog('ADD_SERVICE', 'Services', `Added service: ${data.title}`);
    void persistWrite(
      () => dbUpsertService(newService),
      'Service Created',
      `${data.title} saved to catalog.`
    );
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    const existing = services.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    addActivityLog('EDIT_SERVICE', 'Services', `Updated service ${id}`);
    void persistWrite(
      () => dbUpsertService(updated),
      'Service Updated',
      'Changes saved to service catalog.'
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    addActivityLog('DELETE_SERVICE', 'Services', `Deleted service ${id}`);
    void persistWrite(
      () => dbDeleteService(id),
      'Service Deleted',
      'Removed from catalog.',
      'info'
    );
  };

  const toggleServiceVisibility = (id: string) => {
    const existing = services.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, visible: !existing.visible };
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    void persistWrite(
      () => dbUpsertService(updated),
      'Visibility Toggled',
      'Public website visibility updated.'
    );
  };

  const toggleServiceFeatured = (id: string) => {
    const existing = services.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, featured: !existing.featured };
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    void persistWrite(
      () => dbUpsertService(updated),
      'Featured Updated',
      'Spotlight status updated.'
    );
  };

  // 5. Latest Updates (Door 0) CRUD
  const addLatestUpdate = (update: Omit<LatestUpdateItem, 'id' | 'publishedDate'> & { publishedDate?: string }) => {
    const newUpdate: LatestUpdateItem = {
      ...update,
      id: 'upd-' + Date.now(),
      publishedDate: update.publishedDate || new Date().toISOString().slice(0, 10),
    };
    setLatestUpdates((prev) => [newUpdate, ...prev]);
    addActivityLog('UPDATE_ADD', 'Latest Updates', `Created update: ${update.title}`);
    void persistWrite(
      () => dbUpsertLatestUpdate(newUpdate),
      'Update Published',
      `${update.title} saved to Door 0 Latest Updates.`
    );
  };

  const updateLatestUpdate = (id: string, updates: Partial<LatestUpdateItem>) => {
    const existing = latestUpdates.find((u) => u.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    setLatestUpdates((prev) => prev.map((u) => (u.id === id ? updated : u)));
    addActivityLog('UPDATE_EDIT', 'Latest Updates', `Updated record ID: ${id}`);
    void persistWrite(
      () => dbUpsertLatestUpdate(updated),
      'Update Saved',
      'Changes reflected on Latest Updates door.'
    );
  };

  const deleteLatestUpdate = (id: string) => {
    const existing = latestUpdates.find((u) => u.id === id);
    if (existing?.posterImage) {
      void deleteStorageFileByUrl(existing.posterImage);
    }
    setLatestUpdates((prev) => prev.filter((u) => u.id !== id));
    addActivityLog('UPDATE_DELETE', 'Latest Updates', `Deleted update: ${id}`);
    void persistWrite(
      () => dbDeleteLatestUpdate(id),
      'Update Removed',
      'Item deleted from Latest Updates.',
      'info'
    );
  };

  const toggleLatestUpdatePublished = (id: string) => {
    const existing = latestUpdates.find((u) => u.id === id);
    if (!existing) return;
    const updated = { ...existing, published: !existing.published };
    setLatestUpdates((prev) => prev.map((u) => (u.id === id ? updated : u)));
    void persistWrite(
      () => dbUpsertLatestUpdate(updated),
      'Visibility Toggled',
      'Publication status updated for public cards.'
    );
  };

  // 6. Document Requirements (Door 1) CRUD
  const addDocRequirement = (item: Omit<DocumentRequirementItem, 'id'>) => {
    const newItem: DocumentRequirementItem = {
      ...item,
      id: 'doc-' + Date.now(),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setDocRequirements((prev) => [newItem, ...prev]);
    addActivityLog('DOC_REQ_ADD', 'Document Requirements', `Created requirements for: ${item.serviceTitle}`);
    void persistWrite(
      () => dbUpsertDocRequirement(newItem),
      'Requirement Card Created',
      `${item.serviceTitle} saved to Door 1.`
    );
  };

  const updateDocRequirement = (id: string, updates: Partial<DocumentRequirementItem>) => {
    const existing = docRequirements.find((d) => d.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString().slice(0, 10) };
    setDocRequirements((prev) => prev.map((d) => (d.id === id ? updated : d)));
    addActivityLog('DOC_REQ_EDIT', 'Document Requirements', `Updated requirement card ID: ${id}`);
    void persistWrite(
      () => dbUpsertDocRequirement(updated),
      'Changes Saved',
      'Document requirements updated.'
    );
  };

  const deleteDocRequirement = (id: string) => {
    setDocRequirements((prev) => prev.filter((d) => d.id !== id));
    addActivityLog('DOC_REQ_DELETE', 'Document Requirements', `Deleted requirement ID: ${id}`);
    void persistWrite(
      () => dbDeleteDocRequirement(id),
      'Entry Removed',
      'Requirement card deleted.',
      'info'
    );
  };

  const toggleDocRequirementPublished = (id: string) => {
    const existing = docRequirements.find((d) => d.id === id);
    if (!existing) return;
    const updated = { ...existing, published: !existing.published };
    setDocRequirements((prev) => prev.map((d) => (d.id === id ? updated : d)));
    void persistWrite(
      () => dbUpsertDocRequirement(updated),
      'Status Updated',
      'Publication status toggled for Door 1.'
    );
  };

  // 7. Gallery (Door 4) CRUD
  const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'uploadedAt'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: 'gal-' + Date.now(),
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    setGallery((prev) => [newItem, ...prev]);
    addActivityLog('UPLOAD_IMAGE', 'Gallery', `Added gallery image: ${item.title || item.category}`);
    void persistWrite(
      () => dbUpsertGalleryItem(newItem),
      'Image Added',
      'New photograph saved to center showcase.'
    );
  };

  const updateGalleryItem = (id: string, updates: Partial<GalleryItem>) => {
    const existing = gallery.find((g) => g.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    setGallery((prev) => prev.map((g) => (g.id === id ? updated : g)));
    addActivityLog('EDIT_IMAGE', 'Gallery', `Updated gallery photo ${id}`);
    void persistWrite(
      () => dbUpsertGalleryItem(updated),
      'Photo Updated',
      'Gallery item updated successfully.'
    );
  };

  const deleteGalleryItem = (id: string) => {
    const existing = gallery.find((g) => g.id === id);
    if (existing?.imageUrl) {
      void deleteStorageFileByUrl(existing.imageUrl);
    }
    setGallery((prev) => prev.filter((g) => g.id !== id));
    addActivityLog('DELETE_IMAGE', 'Gallery', `Deleted gallery image ${id}`);
    void persistWrite(
      () => dbDeleteGalleryItem(id),
      'Image Removed',
      'Photograph deleted from gallery.',
      'info'
    );
  };

  const toggleGalleryVisibility = (id: string) => {
    const existing = gallery.find((g) => g.id === id);
    if (!existing) return;
    const updated = { ...existing, visible: !existing.visible };
    setGallery((prev) => prev.map((g) => (g.id === id ? updated : g)));
    void persistWrite(
      () => dbUpsertGalleryItem(updated),
      'Updated',
      'Gallery visibility toggled.'
    );
  };

  const toggleGalleryFeatured = (id: string) => {
    const existing = gallery.find((g) => g.id === id);
    if (!existing) return;
    const updated = { ...existing, featured: !existing.featured };
    setGallery((prev) => prev.map((g) => (g.id === id ? updated : g)));
    void persistWrite(
      () => dbUpsertGalleryItem(updated),
      'Updated',
      'Spotlight status toggled.'
    );
  };

  // 8. Our Journey Timeline CRUD
  const addJourneyItem = (item: Omit<JourneyItem, 'id'>) => {
    const newItem: JourneyItem = {
      ...item,
      id: 'jrn-' + Date.now(),
    };
    setJourney((prev) => sortJourneyChronologically([...prev, newItem]));
    addActivityLog('JOURNEY_ADD', 'Our Journey', `Added timeline entry: ${item.title} (${item.date || item.year})`);
    void persistWrite(
      () => dbUpsertJourneyMilestone(newItem),
      'Entry Added',
      `${item.title} saved to Our Journey.`
    );
  };

  const updateJourneyItem = (id: string, updates: Partial<JourneyItem>) => {
    const existing = journey.find((j) => j.id === id);
    if (!existing) return;
    if (existing.imageUrl && updates.imageUrl !== undefined && updates.imageUrl !== existing.imageUrl) {
      void deleteStorageFileByUrl(existing.imageUrl);
    }
    const updated = { ...existing, ...updates };
    setJourney((prev) => sortJourneyChronologically(prev.map((j) => (j.id === id ? updated : j))));
    addActivityLog('JOURNEY_EDIT', 'Our Journey', `Updated entry ID: ${id}`);
    void persistWrite(
      () => dbUpsertJourneyMilestone(updated),
      'Changes Saved',
      'Journey timeline entry updated.'
    );
  };

  const deleteJourneyItem = (id: string) => {
    const existing = journey.find((j) => j.id === id);
    if (existing?.imageUrl) {
      void deleteStorageFileByUrl(existing.imageUrl);
    }
    setJourney((prev) => prev.filter((j) => j.id !== id));
    addActivityLog('JOURNEY_DELETE', 'Our Journey', `Deleted milestone ID: ${id}`);
    void persistWrite(
      () => dbDeleteJourneyMilestone(id),
      'Milestone Removed',
      'Timeline entry deleted.',
      'info'
    );
  };

  const toggleJourneyPublished = (id: string) => {
    const existing = journey.find((j) => j.id === id);
    if (!existing) return;
    const updated = { ...existing, published: !existing.published };
    setJourney((prev) => prev.map((j) => (j.id === id ? updated : j)));
    void persistWrite(
      () => dbUpsertJourneyMilestone(updated),
      'Status Updated',
      'Milestone visibility toggled.'
    );
  };

  // 8B. Government Schemes CRUD
  const syncSchemesWithFallback = async (
    nextList: GovernmentSchemeItem[],
    primaryOp: () => Promise<DbWriteResult>
  ): Promise<DbWriteResult> => {
    const res = await primaryOp();
    if (res.ok) return res;
    if (res.error && /(government_schemes|schema cache|does not exist|PGRST205|42P01)/i.test(res.error)) {
      const nextWeb: WebsiteSectionContent = {
        ...websiteContent,
        governmentSchemesFallback: nextList,
      };
      setWebsiteContent(nextWeb);
      return dbSaveWebsiteContent(nextWeb);
    }
    return res;
  };

  const addGovernmentScheme = (scheme: Omit<GovernmentSchemeItem, 'id'>) => {
    const newScheme: GovernmentSchemeItem = {
      ...scheme,
      id: 'sch-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextList = [newScheme, ...governmentSchemes];
    setGovernmentSchemes(nextList);
    addActivityLog('SCHEME_ADD', 'Government Schemes', `Published scheme: ${newScheme.title}`);
    void persistWrite(
      () => syncSchemesWithFallback(nextList, () => dbUpsertGovernmentScheme(newScheme)),
      'Scheme Saved',
      `${newScheme.title} added to Government Schemes.`
    );
  };

  const updateGovernmentScheme = (id: string, updates: Partial<GovernmentSchemeItem>) => {
    const existing = governmentSchemes.find((s) => s.id === id);
    if (!existing) return;
    if (existing.posterImage && updates.posterImage !== undefined && updates.posterImage !== existing.posterImage) {
      void deleteStorageFileByUrl(existing.posterImage);
    }
    const updated: GovernmentSchemeItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const nextList = governmentSchemes.map((s) => (s.id === id ? updated : s));
    setGovernmentSchemes(nextList);
    addActivityLog('SCHEME_UPDATE', 'Government Schemes', `Updated scheme: ${updated.title}`);
    void persistWrite(
      () => syncSchemesWithFallback(nextList, () => dbUpsertGovernmentScheme(updated)),
      'Scheme Updated',
      `${updated.title} updated successfully.`
    );
  };

  const deleteGovernmentScheme = (id: string) => {
    const existing = governmentSchemes.find((s) => s.id === id);
    if (existing?.posterImage) {
      void deleteStorageFileByUrl(existing.posterImage);
    }
    const nextList = governmentSchemes.filter((s) => s.id !== id);
    setGovernmentSchemes(nextList);
    addActivityLog('SCHEME_DELETE', 'Government Schemes', `Deleted scheme ID: ${id}`);
    void persistWrite(
      () => syncSchemesWithFallback(nextList, () => dbDeleteGovernmentScheme(id)),
      'Scheme Deleted',
      'Government scheme entry removed.',
      'info'
    );
  };

  const toggleGovernmentSchemePublished = (id: string) => {
    const existing = governmentSchemes.find((s) => s.id === id);
    if (!existing) return;
    updateGovernmentScheme(id, { published: !existing.published });
  };

  // 9. Website Content & Owner Profile CRUD
  const ownerProfile: OwnerProfile = normalizeOwnerProfile(websiteContent.ownerProfile, {
    fullName: currentUser?.name || INITIAL_WEBSITE_CONTENT.ownerProfile?.fullName || 'Sharique Aman',
    email: currentUser?.email || INITIAL_WEBSITE_CONTENT.ownerProfile?.email || 'shariqueaman77@gmail.com',
    phone: businessProfile.primaryPhone || INITIAL_WEBSITE_CONTENT.ownerProfile?.phone || '',
    businessIdentity: businessProfile.businessName
      ? `${businessProfile.businessName} — Cyber Cafe & Digital Center`
      : undefined,
  });

  const refreshOwnerProfile = useCallback(async () => {
    setOwnerProfileStatus('loading');
    setOwnerProfileError(null);
    if (!isSupabaseActive) {
      const localWeb = safeGetStorage<WebsiteSectionContent>('aman_website_content', INITIAL_WEBSITE_CONTENT);
      setWebsiteContent((prev) => ({ ...INITIAL_WEBSITE_CONTENT, ...prev, ...localWeb }));
      setOwnerProfileStatus('ready');
      return;
    }
    try {
      const dbWeb = await dbGetWebsiteContent();
      if (dbWeb) {
        setWebsiteContent((prev) => ({
          ...INITIAL_WEBSITE_CONTENT,
          ...prev,
          ...dbWeb,
        }));
      }
      setOwnerProfileStatus('ready');
    } catch (err: any) {
      console.error('Owner profile refresh error:', err);
      setOwnerProfileStatus('error');
      setOwnerProfileError('Unable to refresh your profile right now. Please try again.');
    }
  }, [isSupabaseActive]);

  const updateOwnerProfile = async (draft: OwnerProfile): Promise<boolean> => {
    const validation = validateOwnerProfileDraft(draft);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0] || 'Please check the highlighted profile fields.';
      setOwnerProfileStatus('error');
      setOwnerProfileError(firstError);
      showToast('Validation Error', firstError, 'error');
      return false;
    }

    const previousContent = websiteContent;
    const nextContent: WebsiteSectionContent = {
      ...INITIAL_WEBSITE_CONTENT,
      ...websiteContent,
      ownerProfile: validation.sanitized,
    };

    setOwnerProfileStatus('saving');
    setOwnerProfileError(null);
    setWebsiteContent(nextContent);
    addActivityLog(
      'OWNER_PROFILE_UPDATE',
      'Owner Profile',
      `Updated owner profile details for ${validation.sanitized.fullName}`
    );

    const saved = await persistWrite(
      () => dbSaveWebsiteContent(nextContent),
      'Profile Updated',
      'Your changes have been saved successfully.'
    );

    if (!saved) {
      setWebsiteContent(previousContent);
      setOwnerProfileStatus('error');
      setOwnerProfileError("We couldn't save your profile changes. Your previous saved details remain intact.");
      return false;
    }

    setOwnerProfileStatus('ready');
    return true;
  };

  const updateWebsiteContent = (section: keyof WebsiteSectionContent, data: any) => {
    const existingSection = websiteContent[section];
    const nextValue = Array.isArray(data)
      ? data
      : { ...(existingSection && typeof existingSection === 'object' ? existingSection : {}), ...data };
    const next: WebsiteSectionContent = {
      ...INITIAL_WEBSITE_CONTENT,
      ...websiteContent,
      [section]: nextValue,
    };
    setWebsiteContent(next);
    addActivityLog('CONTENT_UPDATE', 'Website Content', `Updated ${String(section)}`);
    void persistWrite(
      () => dbSaveWebsiteContent(next),
      'Changes Saved',
      'Your website updates are saved and live.'
    );
  };

  // 10. FAQs CRUD
  const addFaq = (faq: Omit<FaqItem, 'id'>) => {
    const newFaq: FaqItem = { ...faq, id: 'faq-' + Date.now().toString(36) };
    setFaqs((prev) => [...prev, newFaq]);
    void persistWrite(
      () => dbUpsertFaq(newFaq),
      'FAQ Added',
      'New question & answer published.'
    );
  };

  const updateFaq = (id: string, updates: Partial<FaqItem>) => {
    const existing = faqs.find((f) => f.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    setFaqs((prev) => prev.map((f) => (f.id === id ? updated : f)));
    void persistWrite(
      () => dbUpsertFaq(updated),
      'FAQ Updated',
      'Question details saved.'
    );
  };

  const deleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    void persistWrite(
      () => dbDeleteFaq(id),
      'FAQ Deleted',
      'Item removed.',
      'info'
    );
  };

  const toggleFaqVisibility = (id: string) => {
    const existing = faqs.find((f) => f.id === id);
    if (!existing) return;
    const updated = { ...existing, visible: !existing.visible };
    setFaqs((prev) => prev.map((f) => (f.id === id ? updated : f)));
    void persistWrite(
      () => dbUpsertFaq(updated),
      'FAQ Visibility Updated',
      'Public visibility changed.'
    );
  };

  // 11. Testimonials CRUD
  const addTestimonial = (t: Omit<Testimonial, 'id' | 'date'>) => {
    const newT: Testimonial = {
      ...t,
      id: 'tst-' + Date.now().toString(36),
      date: new Date().toISOString().slice(0, 10),
    };
    setTestimonials((prev) => [newT, ...prev]);
    void persistWrite(
      () => dbUpsertTestimonial(newT),
      'Review Added',
      'Testimonial saved to roster.'
    );
  };

  const approveTestimonial = (id: string) => {
    const existing = testimonials.find((t) => t.id === id);
    if (!existing) return;
    const updated = { ...existing, approved: !existing.approved };
    setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)));
    void persistWrite(
      () => dbUpsertTestimonial(updated),
      'Status Updated',
      'Review publication status changed.'
    );
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    void persistWrite(
      () => dbDeleteTestimonial(id),
      'Review Deleted',
      'Testimonial removed.',
      'info'
    );
  };

  // 12. Business Profile CRUD
  const updateBusinessProfile = (updates: Partial<BusinessProfile>) => {
    const next = { ...businessProfile, ...updates };
    setBusinessProfile(next);
    addActivityLog('INFO_UPDATE', 'Business Profile', 'Updated center profile and contacts');
    void persistWrite(
      () => dbSaveBusinessProfile(next),
      'Profile Saved',
      'Business information updated.'
    );
  };

  // 13. Media Library CRUD
  const addMediaAsset = (asset: Omit<MediaAsset, 'id' | 'uploadedDate'>) => {
    const newAsset: MediaAsset = {
      ...asset,
      id: 'med-' + Date.now().toString(36),
      uploadedDate: new Date().toISOString().slice(0, 10),
    };
    setMediaAssets((prev) => [newAsset, ...prev]);
    void persistWrite(
      () => dbUpsertMediaAsset(newAsset),
      'Asset Uploaded',
      `${asset.name} saved to media repository.`
    );
  };

  const deleteMediaAsset = (id: string) => {
    const existing = mediaAssets.find((m) => m.id === id);
    if (existing?.url) {
      void deleteStorageFileByUrl(existing.url);
    }
    setMediaAssets((prev) => prev.filter((m) => m.id !== id));
    void persistWrite(
      () => dbDeleteMediaAsset(id),
      'Asset Deleted',
      'File removed.',
      'info'
    );
  };

  // 14. Notifications CRUD
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (id: string) => {
    const existing = notifications.find((n) => n.id === id);
    if (!existing) return;
    const updated = { ...existing, read: true };
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    if (isSupabaseActive) {
      void dbUpsertNotification(updated);
    }
  };

  const markAllNotificationsRead = () => {
    const next = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(next);
    void persistWrite(
      async () => {
        for (const n of next) {
          const res = await dbUpsertNotification(n);
          if (!res.ok) return res;
        }
        return { ok: true };
      },
      'Alerts Cleared',
      'All notifications marked as read.'
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    void persistWrite(
      () => dbClearNotifications(),
      'Inbox Emptied',
      'All notifications cleared.'
    );
  };

  // 15. Staff CRUD
  const addStaff = (member: Omit<StaffMember, 'id' | 'joinedDate'>) => {
    const newStaff: StaffMember = {
      ...member,
      id: 'stf-' + Date.now().toString(36),
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    setStaff((prev) => [...prev, newStaff]);
    addActivityLog('STAFF_ADD', 'Staff', `Added operator profile: ${newStaff.name}`);
    void persistWrite(
      () => dbUpsertStaffMember(newStaff),
      'Staff Added',
      `${newStaff.name} assigned to workstation.`
    );
  };

  const updateStaff = (id: string, updates: Partial<StaffMember>) => {
    const existing = staff.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
    addActivityLog('STAFF_UPDATE', 'Staff', `Updated staff record ID: ${id}`);
    void persistWrite(
      () => dbUpsertStaffMember(updated),
      'Staff Updated',
      'Operator details saved.'
    );
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    addActivityLog('STAFF_DELETE', 'Staff', `Removed staff member ID: ${id}`);
    void persistWrite(
      () => dbDeleteStaffMember(id),
      'Staff Removed',
      'Operator record removed.',
      'info'
    );
  };

  // Complete Backup & Restore System
  const exportCompleteBackupJSON = () => {
    const backupData = {
      version: '3.0-aman-terminal',
      timestamp: new Date().toISOString(),
      businessProfile,
      terminalSettings,
      customers,
      receipts,
      enquiries,
      services,
      latestUpdates,
      docRequirements,
      gallery,
      journey,
      websiteContent,
      faqs,
      testimonials,
      mediaAssets,
      notifications,
      staff,
      activityLogs,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aman_Computer_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addActivityLog('BACKUP_EXPORT', 'Backup & Restore', 'Generated full business backup file');
    showToast('Backup Created', 'Your backup file has been downloaded successfully.');
  };

  const restoreBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        showToast('Invalid File', 'The selected file is not a valid backup file.', 'error');
        return false;
      }

      if (data.customers && Array.isArray(data.customers)) setCustomers(data.customers);
      if (data.receipts && Array.isArray(data.receipts)) setReceipts(data.receipts);
      if (data.enquiries && Array.isArray(data.enquiries)) setEnquiries(data.enquiries);
      if (data.services && Array.isArray(data.services)) setServices(data.services);
      if (data.latestUpdates && Array.isArray(data.latestUpdates)) setLatestUpdates(data.latestUpdates);
      if (data.docRequirements && Array.isArray(data.docRequirements)) setDocRequirements(data.docRequirements);
      if (data.gallery && Array.isArray(data.gallery)) setGallery(data.gallery);
      if (data.journey && Array.isArray(data.journey)) setJourney(sortJourneyChronologically(data.journey));
      if (data.websiteContent && typeof data.websiteContent === 'object') setWebsiteContent(data.websiteContent);
      if (data.faqs && Array.isArray(data.faqs)) setFaqs(data.faqs);
      if (data.testimonials && Array.isArray(data.testimonials)) setTestimonials(data.testimonials);
      if (data.businessProfile && typeof data.businessProfile === 'object') setBusinessProfile(data.businessProfile);
      if (data.mediaAssets && Array.isArray(data.mediaAssets)) setMediaAssets(data.mediaAssets);
      if (data.staff && Array.isArray(data.staff)) setStaff(data.staff);
      if (data.terminalSettings && typeof data.terminalSettings === 'object') setTerminalSettings(data.terminalSettings);

      addActivityLog('BACKUP_RESTORE', 'Backup & Restore', 'Restored business data from backup file');
      showToast(
        'Backup Restored Locally',
        isSupabaseActive
          ? 'Sections updated. Select "Sync Local Data Online" below to save restored records.'
          : 'All sections restored to local storage.'
      );
      return true;
    } catch (e) {
      console.error('Failed to parse restore backup file', e);
      showToast('Restore Failed', 'The selected backup file could not be read.', 'error');
      return false;
    }
  };

  const resetAllData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setReceipts(INITIAL_RECEIPTS);
    setEnquiries(INITIAL_ENQUIRIES);
    setServices(INITIAL_SERVICES);
    setLatestUpdates(INITIAL_LATEST_UPDATES);
    setDocRequirements(INITIAL_DOC_REQUIREMENTS);
    setGallery(INITIAL_GALLERY);
    setJourney(INITIAL_JOURNEY);
    setWebsiteContent(INITIAL_WEBSITE_CONTENT);
    setFaqs(INITIAL_FAQS);
    setTestimonials(INITIAL_TESTIMONIALS);
    setBusinessProfile(INITIAL_BUSINESS_PROFILE);
    setMediaAssets(INITIAL_MEDIA_ASSETS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setStaff(INITIAL_STAFF);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setTerminalSettings(INITIAL_SETTINGS);

    safeSetStorage('aman_customers', INITIAL_CUSTOMERS);
    safeSetStorage('aman_receipts', INITIAL_RECEIPTS);
    safeSetStorage('aman_enquiries', INITIAL_ENQUIRIES);
    safeSetStorage('aman_services', INITIAL_SERVICES);
    safeSetStorage('aman_latest_updates', INITIAL_LATEST_UPDATES);
    safeSetStorage('aman_doc_requirements', INITIAL_DOC_REQUIREMENTS);
    safeSetStorage('aman_gallery', INITIAL_GALLERY);
    safeSetStorage('aman_journey', INITIAL_JOURNEY);
    safeSetStorage('aman_website_content', INITIAL_WEBSITE_CONTENT);
    safeSetStorage('aman_faqs', INITIAL_FAQS);
    safeSetStorage('aman_testimonials', INITIAL_TESTIMONIALS);
    safeSetStorage('aman_business_profile', INITIAL_BUSINESS_PROFILE);
    safeSetStorage('aman_media', INITIAL_MEDIA_ASSETS);
    safeSetStorage('aman_notifications', INITIAL_NOTIFICATIONS);
    safeSetStorage('aman_staff', INITIAL_STAFF);
    safeSetStorage('aman_activity_logs', INITIAL_ACTIVITY_LOGS);
    safeSetStorage('aman_terminal_settings', INITIAL_SETTINGS);

    addActivityLog('SYSTEM_RESET', 'System', 'Reset local workspace records to default state');
    showToast('Workspace Reset', 'Local workspace records restored to default.', 'warning');
  };

  return (
    <AdminContext.Provider
      value={{
        authStatus,
        currentUser,
        authError,
        logout,
        completeLoginTransition,
        isSupabaseActive,
        isFirebaseActive,
        dbSyncStatus,
        hydrateFromSupabase,

        currentTab,
        setCurrentTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        searchModalOpen,
        setSearchModalOpen,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        authViewMode,
        setAuthViewMode,

        activePrintReceipt,
        setActivePrintReceipt,

        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        exportCustomersCSV,

        enquiries,
        addEnquiry,
        updateEnquiryStatus,
        updateEnquiryNotes,
        deleteEnquiry,
        selectedEnquiry,
        setSelectedEnquiry,
        exportEnquiriesCSV,

        services,
        addService,
        updateService,
        deleteService,
        toggleServiceVisibility,
        toggleServiceFeatured,
        serviceModalOpen,
        setServiceModalOpen,
        editingService,
        setEditingService,

        latestUpdates,
        addLatestUpdate,
        updateLatestUpdate,
        deleteLatestUpdate,
        toggleLatestUpdatePublished,

        docRequirements,
        addDocRequirement,
        updateDocRequirement,
        deleteDocRequirement,
        toggleDocRequirementPublished,

        gallery,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        toggleGalleryVisibility,
        toggleGalleryFeatured,

        journey,
        addJourneyItem,
        updateJourneyItem,
        deleteJourneyItem,
        toggleJourneyPublished,

        governmentSchemes,
        addGovernmentScheme,
        updateGovernmentScheme,
        deleteGovernmentScheme,
        toggleGovernmentSchemePublished,

        websiteContent,
        updateWebsiteContent,
        ownerProfile,
        ownerProfileStatus,
        ownerProfileError,
        updateOwnerProfile,
        refreshOwnerProfile,

        faqs,
        addFaq,
        updateFaq,
        deleteFaq,
        toggleFaqVisibility,

        testimonials,
        addTestimonial,
        approveTestimonial,
        deleteTestimonial,

        businessProfile,
        updateBusinessProfile,

        receipts,
        addReceipt,
        updateReceiptStatus,
        deleteReceipt,
        exportReceiptsCSV,

        mediaAssets,
        addMediaAsset,
        deleteMediaAsset,

        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,

        staff,
        addStaff,
        updateStaff,
        deleteStaff,

        activityLogs,
        addActivityLog,
        clearActivityLogs,
        exportActivityLogsCSV,

        terminalSettings,
        updateTerminalSettings,

        exportCompleteBackupJSON,
        restoreBackupJSON,
        resetAllData,

        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
