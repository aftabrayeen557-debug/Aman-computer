import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Sparkles,
  SlidersHorizontal,
  Landmark,
  DoorOpen,
  Milestone,
  FileEdit,
  Image as ImageIcon,
  Newspaper,
  Building2,
  MessageSquareText,
  Users,
  BarChart3,
  FolderGit2,
  Globe,
  SearchCheck,
  Settings2,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { AdminTab } from '../types';

export interface StudioNavItem {
  tab: AdminTab;
  label: string;
  shortLabel: string;
  groupTitle: string;
  icon: React.ElementType;
  description: string;
  phase2Modules: string[];
  routeSlug: string;
}

export interface StudioNavGroup {
  groupTitle: string;
  items: StudioNavItem[];
}

export const STUDIO_NAV_GROUPS: StudioNavGroup[] = [
  {
    groupTitle: 'OVERVIEW',
    items: [
      {
        tab: 'overview',
        label: 'Dashboard',
        shortLabel: 'Dashboard',
        groupTitle: 'OVERVIEW',
        icon: LayoutDashboard,
        description:
          'Unified studio control center for Aman Computer operations, enquiry velocity preview, and system readiness.',
        phase2Modules: [
          'Live Supabase KPI aggregation',
          'Enquiry conversion funnel telemetry',
          'Real-time operator audit stream',
        ],
        routeSlug: '/admin',
      },
    ],
  },
  {
    groupTitle: 'OWNER & BRAND',
    items: [
      {
        tab: 'owner-profile',
        label: 'Owner Profile',
        shortLabel: 'Owner Profile',
        groupTitle: 'OWNER & BRAND',
        icon: UserCheck,
        description:
          'Proprietor biography, credentials, public studio portrait, and single-admin identity metadata for Sharique Aman.',
        phase2Modules: [
          'Proprietor profile & credentials editor',
          'Portrait media binding via Storage',
          'Verified signature & stamp configuration',
        ],
        routeSlug: '/admin?tab=owner-profile',
      },
      {
        tab: 'hero-section',
        label: 'Hero Section',
        shortLabel: 'Hero Section',
        groupTitle: 'OWNER & BRAND',
        icon: Sparkles,
        description:
          'Editorial headline copy, marquee announcements, counter hours notice, and primary hero call-to-actions.',
        phase2Modules: [
          'Hero headline & subheadline editor',
          'Announcement ribbon scheduler',
          'Primary & WhatsApp CTA bindings',
        ],
        routeSlug: '/admin?tab=hero-section',
      },
      {
        tab: 'brand-settings',
        label: 'Brand Settings',
        shortLabel: 'Brand Settings',
        groupTitle: 'OWNER & BRAND',
        icon: SlidersHorizontal,
        description:
          'Studio identity marks, typography tokens, watermark rules, and public presentation defaults.',
        phase2Modules: [
          'Brand mark & emblem management',
          'Signature color & contrast presets',
          'Public header & footer branding sync',
        ],
        routeSlug: '/admin?tab=brand-settings',
      },
    ],
  },
  {
    groupTitle: 'CONTENT MANAGEMENT',
    items: [
      {
        tab: 'services',
        label: 'Government Schemes',
        shortLabel: 'Govt Schemes',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: Landmark,
        description:
          'Citizen digital services, government scheme catalog, turnaround timings, and transparent fee schedules.',
        phase2Modules: [
          'Scheme & service CRUD catalog',
          'Required document checklist mapping',
          'Featured visibility & pricing controls',
        ],
        routeSlug: '/admin?tab=services',
      },
      {
        tab: 'four-doors',
        label: 'Four Doors',
        shortLabel: 'Four Doors',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: DoorOpen,
        description:
          'Curated interactive portal architecture governing the four signature service doors on the public storefront.',
        phase2Modules: [
          'Door 0–3 titles & visual cues editor',
          'Document checklists per citizen door',
          'Portal ordering & live visibility',
        ],
        routeSlug: '/admin?tab=four-doors',
      },
      {
        tab: 'journey',
        label: 'The Journey',
        shortLabel: 'The Journey',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: Milestone,
        description:
          'Chronological milestones documenting Aman Computer growth, community impact, and digital service evolution.',
        phase2Modules: [
          'Chronological milestone composer',
          'Year / month sorting & highlights',
          'Publish toggle synced to public timeline',
        ],
        routeSlug: '/admin?tab=journey',
      },
      {
        tab: 'website-content',
        label: 'Website Content',
        shortLabel: 'Website Content',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: FileEdit,
        description:
          'Structured editorial sections covering About, Why Choose Us, How It Works, FAQs, and client testimonials.',
        phase2Modules: [
          'Section-by-section CMS editor',
          'FAQ & testimonial moderation queue',
          'Instant public content synchronization',
        ],
        routeSlug: '/admin?tab=website-content',
      },
      {
        tab: 'gallery',
        label: 'Gallery & Portfolio',
        shortLabel: 'Gallery',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: ImageIcon,
        description:
          'Studio workstation photography, commercial printing showcases, and verified cyber cafe media collections.',
        phase2Modules: [
          'Supabase Storage gallery uploads',
          'Category tagging & display ordering',
          'Featured showcase curation',
        ],
        routeSlug: '/admin?tab=gallery',
      },
      {
        tab: 'latest-updates',
        label: 'Latest Updates',
        shortLabel: 'Latest Updates',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: Newspaper,
        description:
          'Time-sensitive examination deadlines, admit card releases, results, scholarships, and public notices.',
        phase2Modules: [
          'Notice & deadline publisher',
          'Poster attachment & external portal links',
          'Auto-status badges (New / Closing Soon)',
        ],
        routeSlug: '/admin?tab=latest-updates',
      },
    ],
  },
  {
    groupTitle: 'BUSINESS',
    items: [
      {
        tab: 'business-profile',
        label: 'Business Profile',
        shortLabel: 'Business Profile',
        groupTitle: 'BUSINESS',
        icon: Building2,
        description:
          'Registered center address, trade license details, operating hours, UPI payment details, and map coordinates.',
        phase2Modules: [
          'Address & Google Maps link verification',
          'Phone, WhatsApp & email endpoints',
          'UPI QR & trade registration records',
        ],
        routeSlug: '/admin?tab=business-profile',
      },
      {
        tab: 'enquiries',
        label: 'Customer Enquiries',
        shortLabel: 'Enquiries',
        groupTitle: 'BUSINESS',
        icon: MessageSquareText,
        description:
          'Incoming public form requests, urgency triage, internal operator notes, and WhatsApp follow-up workflows.',
        phase2Modules: [
          'Live enquiry queue & status workflow',
          'Urgency filtering & operator notes',
          'CSV spreadsheet export',
        ],
        routeSlug: '/admin?tab=enquiries',
      },
      {
        tab: 'customers',
        label: 'Customers',
        shortLabel: 'Customers',
        groupTitle: 'BUSINESS',
        icon: Users,
        description:
          'Citizen and applicant directory tracking recurring visits, service categories, and counter history.',
        phase2Modules: [
          'Customer directory & search filters',
          'Visit ledger & category tagging',
          'Directory CSV export',
        ],
        routeSlug: '/admin?tab=customers',
      },
      {
        tab: 'reports',
        label: 'Reports & Analytics',
        shortLabel: 'Reports',
        groupTitle: 'BUSINESS',
        icon: BarChart3,
        description:
          'Operational intelligence across enquiry volume, popular government services, and counter turnaround metrics.',
        phase2Modules: [
          'Service demand & category breakdowns',
          'Monthly enquiry volume reporting',
          'Scheduled summary exports',
        ],
        routeSlug: '/admin?tab=reports',
      },
    ],
  },
  {
    groupTitle: 'ASSETS & SYSTEM',
    items: [
      {
        tab: 'media',
        label: 'Media Library',
        shortLabel: 'Media Library',
        groupTitle: 'ASSETS & SYSTEM',
        icon: FolderGit2,
        description:
          'Centralized Supabase Storage vault for posters, center images, document templates, and studio banners.',
        phase2Modules: [
          'Bucket browser (gallery, posters, media)',
          'Drag-and-drop asset upload & copy URL',
          'Orphaned asset cleanup utility',
        ],
        routeSlug: '/admin?tab=media',
      },
      {
        tab: 'website-settings',
        label: 'Website Settings',
        shortLabel: 'Website Settings',
        groupTitle: 'ASSETS & SYSTEM',
        icon: Globe,
        description:
          'Public storefront visibility switches, maintenance banner controls, and contact channel toggles.',
        phase2Modules: [
          'Section visibility & ordering controls',
          'Floating action & WhatsApp toggle',
          'Public sync cache refresh trigger',
        ],
        routeSlug: '/admin?tab=website-settings',
      },
      {
        tab: 'seo-manager',
        label: 'SEO Manager',
        shortLabel: 'SEO Manager',
        groupTitle: 'ASSETS & SYSTEM',
        icon: SearchCheck,
        description:
          'Search engine metadata, OpenGraph social preview cards, local business schema, and canonical rules.',
        phase2Modules: [
          'Meta title & description editor',
          'OpenGraph image & social preview',
          'LocalBusiness JSON-LD validation',
        ],
        routeSlug: '/admin?tab=seo-manager',
      },
      {
        tab: 'settings',
        label: 'Owner Settings',
        shortLabel: 'Owner Settings',
        groupTitle: 'ASSETS & SYSTEM',
        icon: Settings2,
        description:
          'Control center preferences, default fee baselines, receipt notes, and operator session behavior.',
        phase2Modules: [
          'Studio workspace density preferences',
          'Default counter fee & receipt header',
          'Notification delivery thresholds',
        ],
        routeSlug: '/admin?tab=settings',
      },
      {
        tab: 'activity-logs',
        label: 'Security & Activity',
        shortLabel: 'Security & Logs',
        groupTitle: 'ASSETS & SYSTEM',
        icon: ShieldCheck,
        description:
          'Single-admin authentication status, Firebase token claim verification, Supabase RLS posture, and audit trail.',
        phase2Modules: [
          'Immutable admin action audit stream',
          'Single-admin UID & RLS status inspection',
          'Audit trail CSV export',
        ],
        routeSlug: '/admin?tab=activity-logs',
      },
      {
        tab: 'backup-restore',
        label: 'Backup & Restore',
        shortLabel: 'Backup & Restore',
        groupTitle: 'ASSETS & SYSTEM',
        icon: Database,
        description:
          'Full JSON database snapshot export, schema-validated restoration, and cloud vault synchronization.',
        phase2Modules: [
          'Complete PostgreSQL JSON export',
          'Validated snapshot restore workflow',
          'Pre-restore safety checkpointing',
        ],
        routeSlug: '/admin?tab=backup-restore',
      },
    ],
  },
];

export const ALL_STUDIO_NAV_ITEMS: StudioNavItem[] = STUDIO_NAV_GROUPS.flatMap(
  (group) => group.items
);

export function resolveStudioTab(tab: AdminTab): AdminTab {
  switch (tab) {
    case 'doc-requirements':
      return 'four-doors';
    case 'faqs':
    case 'testimonials':
      return 'website-content';
    case 'receipts':
      return 'reports';
    case 'notifications':
    case 'staff':
      return 'activity-logs';
    default:
      return tab;
  }
}

export function getNavItemForTab(tab: AdminTab): StudioNavItem {
  const normalized = resolveStudioTab(tab);
  return (
    ALL_STUDIO_NAV_ITEMS.find((item) => item.tab === normalized) ||
    ALL_STUDIO_NAV_ITEMS[0]
  );
}

export function isKnownAdminTab(value: string | null | undefined): value is AdminTab {
  if (!value) return false;
  return (
    ALL_STUDIO_NAV_ITEMS.some((item) => item.tab === value) ||
    value === 'doc-requirements' ||
    value === 'faqs' ||
    value === 'testimonials' ||
    value === 'receipts' ||
    value === 'notifications' ||
    value === 'staff'
  );
}
