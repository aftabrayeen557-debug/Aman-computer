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
  FolderGit2,
  Globe,
  SearchCheck,
  ShieldCheck,
  FileCheck2,
  Layers,
  HelpCircle,
  PanelBottom,
  PhoneCall,
  BookOpen,
  Camera,
  CalendarRange,
} from 'lucide-react';
import { AdminTab } from '../types';

export interface StudioNavItem {
  id: string;
  tab?: AdminTab;
  label: string;
  shortLabel: string;
  groupTitle: string;
  parentLabel?: string;
  icon: React.ElementType;
  description: string;
  routeSlug: string;
  children?: StudioNavItem[];
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
        id: 'overview',
        tab: 'overview',
        label: 'Dashboard',
        shortLabel: 'Dashboard',
        groupTitle: 'OVERVIEW',
        icon: LayoutDashboard,
        description:
          'Central owner workspace for Aman Computer operations, customer enquiries, and business health.',
        routeSlug: '/admin',
      },
    ],
  },
  {
    groupTitle: 'OWNER & BRAND',
    items: [
      {
        id: 'owner-profile',
        tab: 'owner-profile',
        label: 'Owner Profile',
        shortLabel: 'Owner Profile',
        groupTitle: 'OWNER & BRAND',
        icon: UserCheck,
        description:
          'Proprietor biography, profile photo, public contact information, and verified online presence.',
        routeSlug: '/admin?tab=owner-profile',
      },
      {
        id: 'hero-manager',
        label: 'Hero Section Manager',
        shortLabel: 'Hero Manager',
        groupTitle: 'OWNER & BRAND',
        icon: Sparkles,
        description:
          'Manage the homepage headline, featured service flip-notebook, and optional owner portrait.',
        routeSlug: '/admin?tab=hero-headline',
        children: [
          {
            id: 'hero-headline',
            tab: 'hero-headline',
            label: 'Hero Headline',
            shortLabel: 'Hero Headline',
            groupTitle: 'OWNER & BRAND',
            parentLabel: 'Hero Section Manager',
            icon: Sparkles,
            description:
              'Editorial headline copy, center hours notice, announcement ribbon, and primary calls-to-action.',
            routeSlug: '/admin?tab=hero-headline',
          },
          {
            id: 'hero-showcase',
            tab: 'hero-showcase',
            label: 'Featured Service Showcase',
            shortLabel: 'Service Showcase',
            groupTitle: 'OWNER & BRAND',
            parentLabel: 'Hero Section Manager',
            icon: CalendarRange,
            description:
              'Control the animated spiral flip-calendar notebook cards showcased in the hero section.',
            routeSlug: '/admin?tab=hero-showcase',
          },
          {
            id: 'hero-portrait',
            tab: 'hero-portrait',
            label: 'Owner Portrait',
            shortLabel: 'Owner Portrait',
            groupTitle: 'OWNER & BRAND',
            parentLabel: 'Hero Section Manager',
            icon: Camera,
            description:
              'Upload, replace, hide, or remove the optional hero portrait. Shown only when enabled.',
            routeSlug: '/admin?tab=hero-portrait',
          },
        ],
      },
      {
        id: 'brand-settings',
        tab: 'brand-settings',
        label: 'Brand Settings',
        shortLabel: 'Brand Settings',
        groupTitle: 'OWNER & BRAND',
        icon: SlidersHorizontal,
        description:
          'Shop identity, tagline, header badge, logo, favicon, and footer brand wordmark.',
        routeSlug: '/admin?tab=brand-settings',
      },
    ],
  },
  {
    groupTitle: 'CONTENT MANAGEMENT',
    items: [
      {
        id: 'government-schemes',
        tab: 'government-schemes',
        label: 'Government Schemes',
        shortLabel: 'Govt Schemes',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: Landmark,
        description:
          'Publish verified government welfare schemes, eligibility rules, document checklists, and official links.',
        routeSlug: '/admin?tab=government-schemes',
      },
      {
        id: 'doors-management',
        label: 'Doors Management',
        shortLabel: 'Doors',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: DoorOpen,
        description:
          'Manage the four signature interactive doors on the homepage and their dedicated portal pages.',
        routeSlug: '/admin?tab=services',
        children: [
          {
            id: 'latest-updates',
            tab: 'latest-updates',
            label: 'Latest Updates',
            shortLabel: 'Latest Updates',
            groupTitle: 'CONTENT MANAGEMENT',
            parentLabel: 'Doors Management',
            icon: Newspaper,
            description:
              'Door 1 notices: examination deadlines, admit card releases, results, and scholarships.',
            routeSlug: '/admin?tab=latest-updates',
          },
          {
            id: 'doc-requirements',
            tab: 'doc-requirements',
            label: 'Documents Needed',
            shortLabel: 'Documents Needed',
            groupTitle: 'CONTENT MANAGEMENT',
            parentLabel: 'Doors Management',
            icon: FileCheck2,
            description:
              'Door 2 document checklists helping citizens prepare required paperwork before visiting.',
            routeSlug: '/admin?tab=doc-requirements',
          },
          {
            id: 'services',
            tab: 'services',
            label: 'Our Services',
            shortLabel: 'Our Services',
            groupTitle: 'CONTENT MANAGEMENT',
            parentLabel: 'Doors Management',
            icon: Layers,
            description:
              'Door 3 full service catalog, counter rates, turnaround timings, and door headings.',
            routeSlug: '/admin?tab=services',
          },
          {
            id: 'gallery',
            tab: 'gallery',
            label: 'Gallery',
            shortLabel: 'Gallery',
            groupTitle: 'CONTENT MANAGEMENT',
            parentLabel: 'Doors Management',
            icon: ImageIcon,
            description:
              'Door 4 photography showcase for studio workstations, printing, and center highlights.',
            routeSlug: '/admin?tab=gallery',
          },
        ],
      },
      {
        id: 'journey',
        tab: 'journey',
        label: 'The Journey',
        shortLabel: 'The Journey',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: Milestone,
        description:
          'Chronological milestones, descriptions, and milestone photography for the public timeline.',
        routeSlug: '/admin?tab=journey',
      },
      {
        id: 'website-content-group',
        label: 'Website Content',
        shortLabel: 'Website Content',
        groupTitle: 'CONTENT MANAGEMENT',
        icon: FileEdit,
        description:
          'Structured editorial sections for About Us, Contact Information, FAQs, and Footer copy.',
        routeSlug: '/admin?tab=content-about',
        children: [
          {
            id: 'content-about',
            tab: 'content-about',
            label: 'About Us',
            shortLabel: 'About Us',
            groupTitle: 'CONTENT MANAGEMENT',
            parentLabel: 'Website Content',
            icon: BookOpen,
            description:
              'Center story, mission, experience metrics, why choose us, and step-by-step workflow.',
            routeSlug: '/admin?tab=content-about',
          },
          {
            id: 'content-contact',
            tab: 'content-contact',
            label: 'Contact Information',
            shortLabel: 'Contact Info',
            groupTitle: 'CONTENT MANAGEMENT',
            parentLabel: 'Website Content',
            icon: PhoneCall,
            description:
              'Public contact prompts, phone guidance, WhatsApp greeting, and visiting hours copy.',
            routeSlug: '/admin?tab=content-contact',
          },
          {
            id: 'faqs',
            tab: 'faqs',
            label: 'FAQs',
            shortLabel: 'FAQs',
            groupTitle: 'CONTENT MANAGEMENT',
            parentLabel: 'Website Content',
            icon: HelpCircle,
            description:
              'Frequently asked questions organized by category and synced to the public help center.',
            routeSlug: '/admin?tab=faqs',
          },
          {
            id: 'content-footer',
            tab: 'content-footer',
            label: 'Footer Content',
            shortLabel: 'Footer Content',
            groupTitle: 'CONTENT MANAGEMENT',
            parentLabel: 'Website Content',
            icon: PanelBottom,
            description:
              'Footer tagline, copyright notice, and public service disclaimer copy.',
            routeSlug: '/admin?tab=content-footer',
          },
        ],
      },
    ],
  },
  {
    groupTitle: 'BUSINESS MANAGEMENT',
    items: [
      {
        id: 'business-profile',
        tab: 'business-profile',
        label: 'Business Profile',
        shortLabel: 'Business Profile',
        groupTitle: 'BUSINESS MANAGEMENT',
        icon: Building2,
        description:
          'Registered center address, trade license details, operating hours, UPI payment details, and map links.',
        routeSlug: '/admin?tab=business-profile',
      },
      {
        id: 'enquiries',
        tab: 'enquiries',
        label: 'Customer Enquiries',
        shortLabel: 'Enquiries',
        groupTitle: 'BUSINESS MANAGEMENT',
        icon: MessageSquareText,
        description:
          'Incoming public form requests, urgency triage, internal counter notes, and WhatsApp follow-up.',
        routeSlug: '/admin?tab=enquiries',
      },
      {
        id: 'customers',
        tab: 'customers',
        label: 'Customers',
        shortLabel: 'Customers',
        groupTitle: 'BUSINESS MANAGEMENT',
        icon: Users,
        description:
          'Citizen and applicant directory tracking recurring visits, service categories, and counter history.',
        routeSlug: '/admin?tab=customers',
      },
    ],
  },
  {
    groupTitle: 'MEDIA & ASSETS',
    items: [
      {
        id: 'media',
        tab: 'media',
        label: 'Media Library',
        shortLabel: 'Media Library',
        groupTitle: 'MEDIA & ASSETS',
        icon: FolderGit2,
        description:
          'Centralized media library for banners, logos, posters, center photos, and document templates.',
        routeSlug: '/admin?tab=media',
      },
    ],
  },
  {
    groupTitle: 'SYSTEM & SECURITY',
    items: [
      {
        id: 'website-settings',
        tab: 'website-settings',
        label: 'Website Settings',
        shortLabel: 'Website Settings',
        groupTitle: 'SYSTEM & SECURITY',
        icon: Globe,
        description:
          'Maintenance mode, section visibility switches, announcement ribbon, and WhatsApp floating CTA.',
        routeSlug: '/admin?tab=website-settings',
      },
      {
        id: 'seo-manager',
        tab: 'seo-manager',
        label: 'SEO Manager',
        shortLabel: 'SEO Manager',
        groupTitle: 'SYSTEM & SECURITY',
        icon: SearchCheck,
        description:
          'Search engine title, meta description, keywords, canonical URL, and social share image.',
        routeSlug: '/admin?tab=seo-manager',
      },
      {
        id: 'activity-logs',
        tab: 'activity-logs',
        label: 'Security & Activity',
        shortLabel: 'Security & Logs',
        groupTitle: 'SYSTEM & SECURITY',
        icon: ShieldCheck,
        description:
          'Owner account protection status, sign-in verification, and workspace activity history.',
        routeSlug: '/admin?tab=activity-logs',
      },
    ],
  },
];

function flattenNavItems(items: StudioNavItem[]): StudioNavItem[] {
  const result: StudioNavItem[] = [];
  for (const item of items) {
    if (item.tab) {
      result.push(item);
    }
    if (item.children && item.children.length > 0) {
      result.push(...flattenNavItems(item.children));
    }
  }
  return result;
}

export const ALL_STUDIO_NAV_ITEMS: StudioNavItem[] = STUDIO_NAV_GROUPS.flatMap((group) =>
  flattenNavItems(group.items)
);

export function getParentIdForTab(tab: AdminTab): string | null {
  const normalized = resolveStudioTab(tab);
  for (const group of STUDIO_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.children?.some((child) => child.tab === normalized)) {
        return item.id;
      }
    }
  }
  return null;
}

export function resolveStudioTab(tab: AdminTab): AdminTab {
  switch (tab) {
    case 'hero-section':
      return 'hero-headline';
    case 'four-doors':
      return 'services';
    case 'website-content':
      return 'content-about';
    case 'reports':
    case 'settings':
    case 'backup-restore':
    case 'receipts':
    case 'staff':
    case 'testimonials':
      return 'overview';
    case 'notifications':
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
    value === 'hero-section' ||
    value === 'four-doors' ||
    value === 'website-content' ||
    value === 'reports' ||
    value === 'settings' ||
    value === 'backup-restore' ||
    value === 'receipts' ||
    value === 'notifications' ||
    value === 'staff' ||
    value === 'testimonials'
  );
}
