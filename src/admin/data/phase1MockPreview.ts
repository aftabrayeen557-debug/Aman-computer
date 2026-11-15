import { AdminTab } from '../types';

export interface AdminQuickShortcut {
  tab: AdminTab;
  title: string;
  subtitle: string;
}

export const ADMIN_QUICK_SHORTCUTS: AdminQuickShortcut[] = [
  {
    tab: 'hero-headline',
    title: 'Hero Headline',
    subtitle: 'Main hero copy & buttons',
  },
  {
    tab: 'government-schemes',
    title: 'Government Schemes',
    subtitle: 'Public welfare schemes',
  },
  {
    tab: 'services',
    title: 'Our Services',
    subtitle: 'Catalog & turnaround times',
  },
  {
    tab: 'enquiries',
    title: 'Customer Enquiries',
    subtitle: 'Incoming customer requests',
  },
  {
    tab: 'media',
    title: 'Media Library',
    subtitle: 'Uploaded photos & flyers',
  },
  {
    tab: 'activity-logs',
    title: 'Security & Activity',
    subtitle: 'Account protection & logs',
  },
];

