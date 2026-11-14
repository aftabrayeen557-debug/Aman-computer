export type NavigationPage = 
  | 'home' 
  | 'web-development' 
  | 'app-development' 
  | 'ui-ux' 
  | 'graphic-design' 
  | 'photography' 
  | 'my-story' 
  | 'contact'
  | 'privacy-policy'
  | 'terms-and-conditions';

export type ProjectCategory = 'web-dev' | 'app-dev' | 'ui-ux' | 'graphic-design' | 'photography';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  categoryLabel: string;
  year: string;
  client?: string;
  image: string;
  tags: string[];
  overview: string;
  challenge: string;
  solution: string;
  deliverables: string[];
  techStack: string[];
  stats?: { label: string; value: string }[];
  liveUrl?: string;
  interactiveDemo?: 'tax-calculator' | 'api-cost' | 'pnl-preview' | null;
  featured?: boolean;
}

export interface SkillDoor {
  id: NavigationPage;
  number: string;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  accent: string;
  skills: string[];
  projectCount: string;
}

export interface TimelineItem {
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
  highlights: string[];
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  tools: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  location: string;
  verifiedMetric: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  location: string;
  year: string;
  category: 'architecture' | 'street' | 'concert' | 'nature';
  image: string;
  exif: {
    camera: string;
    lens: string;
    shutter: string;
    aperture: string;
    iso: string;
  };
}

