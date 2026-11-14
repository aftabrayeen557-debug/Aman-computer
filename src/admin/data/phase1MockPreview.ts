import { AdminTab } from '../types';

export interface PreviewKpiItem {
  id: string;
  label: string;
  value: string;
  delta: string;
  detail: string;
  targetTab: AdminTab;
  isMockPreview: true;
}

export interface PreviewAnalyticsPoint {
  period: string;
  enquiries: number;
  resolved: number;
  visits: number;
}

export interface PreviewEnquiryRow {
  id: string;
  customerName: string;
  service: string;
  submittedAt: string;
  status: 'New' | 'In Review' | 'Completed';
  urgency: 'Standard' | 'Urgent';
}

export interface PreviewActivityEntry {
  id: string;
  action: string;
  module: string;
  detail: string;
  timestamp: string;
}

export const PHASE1_PREVIEW_KPIS: PreviewKpiItem[] = [
  {
    id: 'total-enquiries',
    label: 'Total Enquiries',
    value: '148',
    delta: '+12.4%',
    detail: '30-day illustrative baseline',
    targetTab: 'enquiries',
    isMockPreview: true,
  },
  {
    id: 'pending-enquiries',
    label: 'Pending Enquiries',
    value: '19',
    delta: '6 urgent',
    detail: 'Awaiting counter follow-up',
    targetTab: 'enquiries',
    isMockPreview: true,
  },
  {
    id: 'total-customers',
    label: 'Total Customers',
    value: '412',
    delta: '+28',
    detail: 'Registered citizen directory',
    targetTab: 'customers',
    isMockPreview: true,
  },
  {
    id: 'website-visits',
    label: 'Website Visits',
    value: '3,840',
    delta: '+18.2%',
    detail: 'Public storefront traffic',
    targetTab: 'reports',
    isMockPreview: true,
  },
];

export const PHASE1_ANALYTICS_7D: PreviewAnalyticsPoint[] = [
  { period: 'Mon', enquiries: 14, resolved: 11, visits: 410 },
  { period: 'Tue', enquiries: 19, resolved: 15, visits: 485 },
  { period: 'Wed', enquiries: 17, resolved: 14, visits: 462 },
  { period: 'Thu', enquiries: 24, resolved: 19, visits: 590 },
  { period: 'Fri', enquiries: 29, resolved: 23, visits: 640 },
  { period: 'Sat', enquiries: 26, resolved: 21, visits: 685 },
  { period: 'Sun', enquiries: 19, resolved: 16, visits: 568 },
];

export const PHASE1_ANALYTICS_30D: PreviewAnalyticsPoint[] = [
  { period: 'Wk 1', enquiries: 31, resolved: 26, visits: 820 },
  { period: 'Wk 2', enquiries: 38, resolved: 33, visits: 960 },
  { period: 'Wk 3', enquiries: 42, resolved: 36, visits: 1015 },
  { period: 'Wk 4', enquiries: 37, resolved: 34, visits: 1045 },
];

export const PHASE1_RECENT_ENQUIRIES_PREVIEW: PreviewEnquiryRow[] = [
  {
    id: 'ENQ-409',
    customerName: 'Rameshwar Prasad',
    service: 'PM-Kisan e-KYC & Land Seeding',
    submittedAt: '14 mins ago',
    status: 'New',
    urgency: 'Urgent',
  },
  {
    id: 'ENQ-408',
    customerName: 'Ananya Kumari',
    service: 'SSC CGL Online Application Form',
    submittedAt: '1 hr ago',
    status: 'In Review',
    urgency: 'Urgent',
  },
  {
    id: 'ENQ-407',
    customerName: 'Faizan Ahmad',
    service: 'PAN Card Correction & Reprint',
    submittedAt: '3 hrs ago',
    status: 'In Review',
    urgency: 'Standard',
  },
  {
    id: 'ENQ-406',
    customerName: 'Sunita Devi',
    service: 'Ayushman Bharat Golden Card',
    submittedAt: 'Yesterday',
    status: 'Completed',
    urgency: 'Standard',
  },
];

export const PHASE1_RECENT_ACTIVITY_PREVIEW: PreviewActivityEntry[] = [
  {
    id: 'act-1',
    action: 'Session Verified',
    module: 'Single-Admin Gate',
    detail: 'Sole proprietor UID authenticated via Firebase Spark + Supabase RLS.',
    timestamp: 'Just now',
  },
  {
    id: 'act-2',
    action: 'Notice Published',
    module: 'Latest Updates',
    detail: 'SSC & Scholarship document checklist draft prepared for Door 0.',
    timestamp: '28m ago',
  },
  {
    id: 'act-3',
    action: 'Media Indexed',
    module: 'Media Library',
    detail: 'High-resolution center workspace photos staged for Gallery sync.',
    timestamp: '2h ago',
  },
  {
    id: 'act-4',
    action: 'Schema Audited',
    module: 'Security & Activity',
    detail: 'Pre-deployment RLS policies and rate-limit guards confirmed active.',
    timestamp: 'Yesterday',
  },
];

export const PHASE1_QUICK_SHORTCUTS: Array<{
  tab: AdminTab;
  title: string;
  subtitle: string;
}> = [
  {
    tab: 'hero-section',
    title: 'Hero Section',
    subtitle: 'Public headlines & notices',
  },
  {
    tab: 'services',
    title: 'Government Schemes',
    subtitle: 'Service catalog & fees',
  },
  {
    tab: 'four-doors',
    title: 'Four Doors',
    subtitle: 'Interactive storefront doors',
  },
  {
    tab: 'enquiries',
    title: 'Customer Enquiries',
    subtitle: 'Public submissions queue',
  },
  {
    tab: 'media',
    title: 'Media Library',
    subtitle: 'Storage buckets & posters',
  },
  {
    tab: 'activity-logs',
    title: 'Security & Activity',
    subtitle: 'Single-admin audit trail',
  },
];
