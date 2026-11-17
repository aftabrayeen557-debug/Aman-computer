export type AdminTab =
  | 'overview'
  | 'owner-profile'
  | 'hero-headline'
  | 'hero-showcase'
  | 'hero-portrait'
  | 'brand-settings'
  | 'government-schemes'
  | 'latest-updates'
  | 'doc-requirements'
  | 'services'
  | 'gallery'
  | 'journey'
  | 'content-about'
  | 'content-contact'
  | 'faqs'
  | 'content-footer'
  | 'business-profile'
  | 'enquiries'
  | 'customers'
  | 'media'
  | 'website-settings'
  | 'seo-manager'
  | 'activity-logs'
  // Legacy route aliases kept for URL backward compatibility & resolution
  | 'hero-section'
  | 'four-doors'
  | 'website-content'
  | 'reports'
  | 'settings'
  | 'backup-restore'
  | 'testimonials'
  | 'receipts'
  | 'notifications'
  | 'staff';

export type EnquiryStatus = 'new' | 'pending' | 'in-progress' | 'completed';
export type EnquirySource = 'walk-in' | 'whatsapp' | 'phone' | 'online';

export interface Enquiry {
  id: string;
  customerName: string;
  phoneNumber: string;
  serviceId: string;
  serviceName: string;
  customerMessage: string;
  createdAt: string;
  status: EnquiryStatus;
  adminNotes: string;
  urgency: 'normal' | 'urgent';
  estimatedCost?: string;
  assignedOperator?: string;
  source?: EnquirySource;
}

export type CustomerCategory =
  | 'Student / Job Aspirant'
  | 'Regular Citizen'
  | 'Farmer / PM-Kisan'
  | 'Business / Trader';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  category: CustomerCategory;
  totalVisits: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
  lastVisitDate: string;
}

export type ReceiptPaymentMode = 'Cash' | 'UPI' | 'Pending';
export type ReceiptPaymentStatus = 'Paid' | 'Unpaid' | 'Partial';
export type ReceiptStatus = 'Pending Processing' | 'Ready for Pickup' | 'Completed & Delivered';

export interface Receipt {
  id: string;
  tokenNumber: number;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  serviceCategory: string;
  applicationRefNo?: string;
  govtChallanFee: number;
  operatorServiceFee: number;
  totalAmount: number;
  paymentMode: ReceiptPaymentMode;
  paymentStatus: ReceiptPaymentStatus;
  status: ReceiptStatus;
  expectedDeliveryDate?: string;
  operatorName: string;
  notes?: string;
  createdAt: string;
}

export type ServiceCategory =
  | 'Government Forms'
  | 'Identity & Cards'
  | 'Printing & Documents'
  | 'Financial & Banking'
  | 'Travel & Ticketing'
  | 'Computer & Design';

export interface ServiceItem {
  id: string;
  title: string;
  category: ServiceCategory;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  image: string;
  priceStartingAt: string;
  tat: string;
  featured: boolean;
  displayOrder: number;
  visible: boolean;
  whatsappMessageTemplate: string;
  requirements: string[];
}

export type UpdateCategory =
  | 'Jobs'
  | 'Admit Card'
  | 'Results'
  | 'Government Schemes'
  | 'Scholarships'
  | 'Certificates'
  | 'Other Announcements';

export type UpdateStatus = 'New' | 'Active' | 'Closing Soon' | 'Closed';

export interface LatestUpdateItem {
  id: string;
  title: string;
  category: UpdateCategory | string;
  publishedDate: string;
  shortDescription: string;
  importantDates?: {
    startDate?: string;
    lastDate?: string;
    examDate?: string;
  };
  eligibility?: {
    qualification?: string;
    ageLimit?: string;
  };
  applicationFee?: string;
  officialLink?: string;
  status: UpdateStatus;
  sourceWebsite?: string;
  posterImage?: string;
  published: boolean;
}

export interface DocumentRequirementItem {
  id: string;
  serviceTitle: string;
  requiredDocuments: string[];
  importantNote?: string;
  category?: string;
  published: boolean;
  displayOrder?: number;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  featured: boolean;
  displayOrder: number;
  visible: boolean;
  uploadedAt: string;
}

export interface JourneyItem {
  id: string;
  year: string;
  month: string;
  date: string;
  title: string;
  subtitle?: string;
  description?: string;
  bullets?: string[];
  imageUrl?: string;
  published: boolean;
  displayOrder?: number;
}

export interface GovernmentSchemeItem {
  id: string;
  title: string;
  category: string;
  department: string;
  shortDescription: string;
  eligibility: string;
  benefits: string;
  requiredDocuments: string[];
  applicationMode: string;
  lastDate: string;
  officialLink: string;
  posterImage: string;
  status: UpdateStatus;
  featured: boolean;
  published: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HeroShowcaseItem {
  id: string;
  label: string;
  visible: boolean;
  displayOrder: number;
}

export interface OwnerPortraitConfig {
  imageUrl: string;
  visible: boolean;
  caption: string;
  subcaption: string;
  altText: string;
}

export interface BrandSettings {
  shopName: string;
  tagline: string;
  headerBadgeText: string;
  logoUrl: string;
  faviconUrl: string;
  accentColor: string;
  footerBrandWordmark: string;
}

export interface DoorMetaConfig {
  doorIndex: 0 | 1 | 2 | 3;
  title: string;
  subtitle: string;
  highlights: string[];
}

export interface DoorsConfig {
  sectionHeading: string;
  door0: DoorMetaConfig;
  door1: DoorMetaConfig;
  door2: DoorMetaConfig;
  door3: DoorMetaConfig;
}

export interface WebsiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcementEnabled: boolean;
  announcementText: string;
  whatsappButtonEnabled: boolean;
  sectionVisibility: {
    hero: boolean;
    doors: boolean;
    schemes: boolean;
    journey: boolean;
    footer: boolean;
  };
}

export interface SeoSettings {
  pageTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
  canonicalUrl: string;
}

export interface OwnerCustomLink {
  id: string;
  label: string;
  url: string;
}

export interface OwnerSocialLinks {
  website: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  other: OwnerCustomLink[];
}

export interface OwnerProfile {
  fullName: string;
  designation: string;
  businessIdentity: string;
  bio: string;
  email: string;
  phone: string;
  profileImage: string;
  locationLabel?: string;
  experienceLabel?: string;
  socialLinks: OwnerSocialLinks;
  updatedAt?: string;
}

export interface WebsiteSectionContent {
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    description?: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    announcement: string;
    timingNotice: string;
  };
  heroShowcase?: HeroShowcaseItem[];
  ownerPortrait?: OwnerPortraitConfig;
  brandSettings?: BrandSettings;
  doorsConfig?: DoorsConfig;
  websiteSettings?: WebsiteSettings;
  seoSettings?: SeoSettings;
  governmentSchemesFallback?: GovernmentSchemeItem[];
  about: {
    heading: string;
    subheading: string;
    bio: string;
    experienceYears: string;
    customersServed: string;
    successRate: string;
    coreValues: Array<{ title: string; description: string }>;
  };
  whyChooseUs: {
    heading: string;
    subheading: string;
    points: Array<{ title: string; desc: string; icon: string }>;
  };
  howItWorks: {
    heading: string;
    steps: Array<{ stepNumber: string; title: string; desc: string }>;
  };
  contact: {
    heading: string;
    subheading: string;
    phonePrompt: string;
    whatsappPrompt: string;
    visitingPrompt: string;
  };
  footer: {
    tagline: string;
    copyrightText: string;
    disclaimer: string;
  };
  ownerProfile?: OwnerProfile;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  visible: boolean;
}

export interface Testimonial {
  id: string;
  customerName: string;
  location: string;
  serviceName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  approved: boolean;
}

export interface BusinessProfile {
  businessName: string;
  tagline: string;
  proprietorName: string;
  tradeLicenseNo: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectLink: string;
  primaryPhone: string;
  whatsappNumber: string;
  secondaryPhone?: string;
  email: string;
  telegramChannel?: string;
  openingHours: string;
  workingDays: string;
  upiId: string;
  upiQrImage?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  fileType: 'image' | 'pdf' | 'doc';
  fileSize: string;
  url: string;
  category: 'banner' | 'logo' | 'document-template' | 'gallery';
  uploadedDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  level: 'info' | 'warning' | 'alert' | 'success';
  linkToTab?: AdminTab;
}

export type StaffRole =
  | 'Proprietor / Super Admin'
  | 'Senior Form Specialist'
  | 'Counter Assistant'
  | 'Data Entry Clerk';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  workstationId: string;
  phone: string;
  email: string;
  shift: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  joinedDate: string;
}

export interface ActivityLog {
  id: string;
  operator: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface TerminalSettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  audioChimes: boolean;
  defaultServiceFee: number;
  currencySymbol: string;
  receiptHeaderNote: string;
}
