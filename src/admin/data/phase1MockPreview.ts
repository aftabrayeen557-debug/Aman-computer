import { AdminTab } from '../types';

export interface AdminQuickShortcut {
  tab: AdminTab;
  title: string;
  subtitle: string;
  icon3d?: string;
}

export const ADMIN_QUICK_SHORTCUTS: AdminQuickShortcut[] = [
  {
    tab: 'hero-headline',
    title: 'Hero Headline',
    subtitle: 'Main hero copy & buttons',
    icon3d: '/assets/3d-icons/04-hero-headline.png',
  },
  {
    tab: 'government-schemes',
    title: 'Government Schemes',
    subtitle: 'Public welfare schemes',
    icon3d: '/assets/3d-icons/08-government-schemes.png',
  },
  {
    tab: 'services',
    title: 'Our Services',
    subtitle: 'Catalog & turnaround times',
    icon3d: '/assets/3d-icons/12-our-services.png',
  },
  {
    tab: 'enquiries',
    title: 'Customer Enquiries',
    subtitle: 'Incoming customer requests',
    icon3d: '/assets/3d-icons/21-customer-enquiries.png',
  },
  {
    tab: 'media',
    title: 'Media Library',
    subtitle: 'Uploaded photos & flyers',
    icon3d: '/assets/3d-icons/23-media-library.png',
  },
  {
    tab: 'activity-logs',
    title: 'Security & Activity',
    subtitle: 'Account protection & logs',
    icon3d: '/assets/3d-icons/26-security-activity.png',
  },
];

