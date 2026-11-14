import { Project, SkillDoor, TimelineItem, PhotoItem } from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_rishi_thakor_1793814784483.jpg';
export const ZERODHA_IMAGE = '/src/assets/images/project_zerodha_pnl_1793814786967.jpg';
export const QUICKO_IMAGE = '/src/assets/images/quicko_tax_calculator_1793815485786.jpg';
export const CLIQ_IMAGE = '/src/assets/images/project_cliq_saas_1793814787377.jpg';
export const SUNDOWN_IMAGE = '/src/assets/images/project_sundown_studio_1793814787385.jpg';
export const PRIME_IMAGE = '/src/assets/images/project_prime_hostel_1793814787343.jpg';
export const HIMSPRING_IMAGE = '/src/assets/images/himspring_branding_design_1793815486224.jpg';

export const SKILL_DOORS: SkillDoor[] = [
  {
    id: 'web-development',
    number: '01',
    title: 'Web Development',
    subtitle: 'From wireframes to production deployment',
    tagline: 'End-to-end full stack websites, fintech dashboards, responsive web tools, and speed optimization.',
    image: ZERODHA_IMAGE,
    accent: 'emerald',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Core Web Vitals'],
    projectCount: '15+ Projects'
  },
  {
    id: 'app-development',
    number: '02',
    title: 'App Development',
    subtitle: 'Fluid mobile-first experiences',
    tagline: 'iOS and cross-platform native applications engineered for intuitive gesture navigation and offline performance.',
    image: CLIQ_IMAGE,
    accent: 'blue',
    skills: ['iOS Architecture', 'Swift', 'React Native', 'Mobile UI/UX', 'RESTful APIs'],
    projectCount: '6+ Apps'
  },
  {
    id: 'ui-ux',
    number: '03',
    title: 'UI/UX Design',
    subtitle: 'Structured user flows & design tokens',
    tagline: 'User research, wireframing, high-fidelity Figma design systems, and clickable prototypes.',
    image: QUICKO_IMAGE,
    accent: 'violet',
    skills: ['Figma', 'Framer', 'Design Systems', 'Usability Testing', 'Information Architecture'],
    projectCount: '20+ Systems'
  },
  {
    id: 'graphic-design',
    number: '04',
    title: 'Graphic Design',
    subtitle: 'Brand identity & visual campaigns',
    tagline: 'Visual identities, social media carousels, marketing collateral, pitch decks, and vector illustrations.',
    image: HIMSPRING_IMAGE,
    accent: 'amber',
    skills: ['Adobe Illustrator', 'Photoshop', 'Brand Books', 'Typography', 'Social Media'],
    projectCount: '35+ Campaigns'
  },
  {
    id: 'photography',
    number: '05',
    title: 'Photography',
    subtitle: 'Visual storytelling through primes',
    tagline: 'Documentary lenswork exploring architectural geometry, street culture, natural light, and concerts.',
    image: HERO_IMAGE,
    accent: 'rose',
    skills: ['Sony Alpha Mirrorless', '35mm & 50mm Primes', 'Natural Light', 'Lightroom Classic'],
    projectCount: '40+ Photo Sets'
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'pnl-page-zerodha',
    title: 'P&L Page for Zerodha (Quicko)',
    subtitle: 'Dark trading-terminal interface allowing Zerodha users to connect Demat accounts, analyze P&L, and share verified tax statements',
    category: 'web-dev',
    categoryLabel: 'Web Development & UI/UX',
    year: '2024',
    client: 'Quicko & Zerodha Ecosystem',
    image: ZERODHA_IMAGE,
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Fintech', 'Zerodha API'],
    overview: 'P&L Page (pnl.page) was built for active Indian stock market traders within the Zerodha ecosystem. It provides a secure, streamlined portal where investors link their Kite/Demat accounts to inspect trading drawdowns, download tax-ready filings, and share authentic, verified performance cards with tax accountants and communities.',
    challenge: 'Traders struggled with cluttered back-office statements and frequently shared unverified screenshots. The challenge was building an ultra-fast terminal experience that parses years of ledger statements into sub-second visual summaries without leaking sensitive credentials.',
    solution: 'Designed and engineered an institutional-grade dark terminal interface with interactive candlestick graphs, tax categorization (Speculative vs Non-Speculative vs Capital Gains), and 1-click shareable verified trade cards.',
    deliverables: [
      'End-to-end Web App Architecture',
      'Kite Connect Demat Integration Flow',
      'Tax-Ready P&L Statement Engine',
      'Verified Social Trading Cards Generator'
    ],
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Chart.js / Canvas', 'Express', 'Zustand'],
    stats: [
      { label: 'Calculation Latency', value: '<70ms' },
      { label: 'Active Traders', value: '18,500+' },
      { label: 'Verified Statements', value: '45,000+' }
    ],
    liveUrl: 'https://pnl.page',
    interactiveDemo: 'pnl-preview',
    featured: true
  },
  {
    id: 'capital-gains-tax-calculator',
    title: 'Capital Gains Tax Calculator (Quicko)',
    subtitle: 'Interactive financial calculator on quicko.com calculating Short-Term (STCG) and Long-Term (LTCG) tax liability on shares, mutual funds, crypto, and real estate',
    category: 'web-dev',
    categoryLabel: 'Web Development & Frontend Engineering',
    year: '2023',
    client: 'Quicko',
    image: QUICKO_IMAGE,
    tags: ['React', 'TypeScript', 'Tax Algorithms', 'UI Engineering', 'Quicko'],
    overview: 'An interactive tax calculation tool deployed on quicko.com that empowers taxpayers and financial advisors to compute their exact tax obligations under Section 111A, 112A, and VDA (crypto) regulations.',
    challenge: 'Indian capital gains tax rules involve complex holding period thresholds (12 months for equity, 24/36 months for property/debt, flat 30% for crypto) and exemptions (₹1 Lakh under 112A). Users needed an instantaneous, mistake-free calculator with zero learning curve.',
    solution: 'Built a multi-asset calculator with instantaneous live recalculations, visual STCG vs LTCG donut breakdowns, grandfathering provisions, and PDF tax projection exports.',
    deliverables: [
      'Interactive Tax Calculation Engine',
      'Multi-Asset Scenario Simulator',
      'Responsive Table & Graph Visualizer',
      'Embedded Widget for Quicko Knowledge Base'
    ],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Highcharts', 'Tax Rule State Machine'],
    stats: [
      { label: 'Monthly Calculations', value: '120,000+' },
      { label: 'Calculation Time', value: 'Instant' },
      { label: 'Tax Accuracy', value: '100%' }
    ],
    liveUrl: 'https://quicko.com',
    interactiveDemo: 'tax-calculator',
    featured: true
  },
  {
    id: 'sandbox-api-cost-calculator',
    title: 'Sandbox Tax API Cost Calculator',
    subtitle: 'Interactive pricing and usage estimation tool for developers building with Sandbox KYC, Income Tax, TDS, and GST APIs',
    category: 'web-dev',
    categoryLabel: 'Web Development & Developer Tools',
    year: '2023',
    client: 'Sandbox by Quicko',
    image: QUICKO_IMAGE,
    tags: ['Developer Tools', 'Next.js', 'Interactive Pricing', 'Sandbox API'],
    overview: 'A transparent developer pricing and usage calculator on sandbox.co.in. Allows CTOs and fintech engineering leads to model API call volumes for PAN verification, GSTIN lookups, Bank Account validation, and Form 26AS extraction with volume-based discount tiers.',
    challenge: 'Fintech developers found tiered API pricing structures opaque and difficult to forecast for seed versus enterprise scales.',
    solution: 'Created a dual-slider simulation matrix where developers select API modules, drag monthly call sliders, toggle pay-as-you-go versus prepaid credit packages, and download JSON cost models.',
    deliverables: [
      'Dynamic Usage Slider Interface',
      'Volume Tier Discount Algorithms',
      'API Bundle Comparison Matrix',
      'Direct Checkout Token Integration'
    ],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Framer Motion'],
    stats: [
      { label: 'Lead Conversion', value: '+34%' },
      { label: 'APIs Modeled', value: '25+' },
      { label: 'Enterprises Modeled', value: '800+' }
    ],
    interactiveDemo: 'api-cost',
    featured: true
  },
  {
    id: 'cliq-saas',
    title: 'Cliq — Self-Hosted Affiliate Management',
    subtitle: 'Comprehensive UI/UX design and architecture for a white-label SaaS referral and promoter platform',
    category: 'ui-ux',
    categoryLabel: 'UI/UX & Product Design',
    year: '2024',
    client: 'Cliq Software Co.',
    image: CLIQ_IMAGE,
    tags: ['Figma', 'UI/UX Design', 'Design System', 'SaaS Dashboard'],
    overview: 'A self-hosted SaaS affiliate platform featuring a white-label dashboard for SaaS founders to monitor commission payouts, detect fraud spikes, and manage top promoter leaderboards.',
    challenge: 'Existing tools required fragmented dashboards for founders and promoters, leading to high abandonment rates during creator onboarding.',
    solution: 'Designed an elegant, high-density design system with dual modes (Founder Admin & Promoter Portal), automated link generator, and real-time conversion charts.',
    deliverables: [
      'Figma Component Library (120+ Components)',
      'Founder Admin & Affiliate Dashboards',
      'Interactive Flow Prototypes',
      'Mobile Companion Layouts'
    ],
    techStack: ['Figma', 'Design Tokens', 'Tailwind UI', 'React Prototyping'],
    stats: [
      { label: 'Onboarding Time', value: '-60%' },
      { label: 'Component Library', value: '120+' },
      { label: 'User Satisfaction', value: '4.9/5' }
    ],
    featured: true
  },
  {
    id: 'himspring-graphic-design',
    title: 'Himspring LLC — Brand Campaigns & Content',
    subtitle: 'Social media creatives, luxury packaging, and brand identities across real estate, luxury water, and apparel',
    category: 'graphic-design',
    categoryLabel: 'Graphic Design & Art Direction',
    year: '2023',
    client: 'Himspring LLC',
    image: HIMSPRING_IMAGE,
    tags: ['Branding', 'Adobe Illustrator', 'Social Media', 'Packaging', 'Typography'],
    overview: 'Managed complete visual narratives for client brands under Himspring LLC. Designed high-impact Instagram carousels, luxury bottle labels, real estate brochures, and advertising banners.',
    challenge: 'Maintaining distinct, high-end visual identities across fundamentally different verticals (high-end residential real estate vs artisanal bottled water vs boutique clothing).',
    solution: 'Developed custom typography treatments, bespoke color palettes, and structured grid templates in Adobe Illustrator that elevated customer engagement and brand prestige.',
    deliverables: [
      'Multi-Brand Social Media Carousels (60+ posts)',
      'Luxury Bottle Packaging Spec Sheet',
      'Real Estate Development Sales Brochure',
      'Vector Logo Marks & Brand Guidelines'
    ],
    techStack: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Vector Art'],
    stats: [
      { label: 'Impressions Generated', value: '450K+' },
      { label: 'Campaigns Delivered', value: '25+' },
      { label: 'Average Engagement', value: '+42%' }
    ],
    featured: true
  },
  {
    id: 'sundown-studio',
    title: 'Sundown Studio — Spatial Web Experience',
    subtitle: 'Experimental creative studio website featuring kinetic typography and locomotive scroll animations',
    category: 'web-dev',
    categoryLabel: 'Creative Web Development',
    year: '2023',
    client: 'Sundown Studio',
    image: SUNDOWN_IMAGE,
    tags: ['Creative Coding', 'WebGL', 'Canvas', 'GSAP', 'Locomotive'],
    overview: 'An avant-garde portfolio experience built to push the envelope of browser animation. Highlights kinetic text, 3D cursor interaction, and sculptural canvas shaders.',
    challenge: 'Rendering heavy video textures and interactive physics without degrading frame rates on mobile devices.',
    solution: 'Engineered GPU-accelerated canvas transforms and selective viewport observers to sustain a smooth 60fps across all devices.',
    deliverables: [
      'Custom Animation Pipeline',
      'Locomotive Smooth Scroll Integration',
      'Canvas Particle Effects',
      'Mobile Responsive Architecture'
    ],
    techStack: ['HTML5 Canvas', 'TypeScript', 'GSAP', 'Tailwind CSS'],
    stats: [
      { label: 'Frame Rate', value: '60 FPS' },
      { label: 'Lighthouse Score', value: '98/100' },
      { label: 'Average Dwell Time', value: '3m 40s' }
    ],
    featured: false
  },
  {
    id: 'prime-hostel',
    title: 'Prime Hostel — Coliving Booking Platform',
    subtitle: 'Modern student accommodation and shared living reservation portal with room customizer',
    category: 'app-dev',
    categoryLabel: 'App & Web Development',
    year: '2023',
    client: 'Prime Living',
    image: PRIME_IMAGE,
    tags: ['Full-Stack', 'Booking Engine', 'UI/UX', 'Node.js', 'Mobile Web'],
    overview: 'A digital booking platform for modern student coliving. Features interactive room configuration, instant amenity upgrades, resident KYC verification, and automated recurring billing.',
    challenge: 'Traditional hostel admissions required manual paperwork and offline room checks, resulting in long queues during college admission seasons.',
    solution: 'Built an intuitive 3-step online reservation flow with floorplan selector, automated deposit receipts, and a resident dashboard.',
    deliverables: [
      'Interactive Room Selection Flow',
      'Resident Onboarding Web Portal',
      'Payment Gateway Integration',
      'Admin Property Management Tool'
    ],
    techStack: ['React', 'Node.js', 'Express', 'Tailwind CSS', 'Stripe'],
    stats: [
      { label: 'Booking Time', value: '<2 mins' },
      { label: 'Direct Bookings', value: '+180%' },
      { label: 'Administrative Savings', value: '75%' }
    ],
    featured: false
  }
];

export const TIMELINE: TimelineItem[] = [];

export const PHOTOS: PhotoItem[] = [
  {
    id: 'p1',
    title: 'Monolithic Architectural Angles',
    location: 'Ahmedabad, India',
    year: '2024',
    category: 'architecture',
    image: HERO_IMAGE,
    exif: {
      camera: 'Sony A7 IV',
      lens: 'FE 35mm F1.4 GM',
      shutter: '1/800s',
      aperture: 'f/4.0',
      iso: '100'
    }
  },
  {
    id: 'p2',
    title: 'Studio Workspace & Leica 35mm Grain',
    location: 'Studio Setup',
    year: '2024',
    category: 'street',
    image: SUNDOWN_IMAGE,
    exif: {
      camera: 'Sony A7 IV',
      lens: 'FE 50mm F1.2 GM',
      shutter: '1/250s',
      aperture: 'f/2.0',
      iso: '200'
    }
  },
  {
    id: 'p3',
    title: 'Concrete Horizons & Natural Illumination',
    location: 'Gandhinagar, India',
    year: '2023',
    category: 'architecture',
    image: PRIME_IMAGE,
    exif: {
      camera: 'Sony A7 IV',
      lens: 'FE 24-70mm F2.8 GM II',
      shutter: '1/500s',
      aperture: 'f/5.6',
      iso: '160'
    }
  },
  {
    id: 'p4',
    title: 'Night Shadows & Trading Glow',
    location: 'Desk Setup',
    year: '2024',
    category: 'street',
    image: ZERODHA_IMAGE,
    exif: {
      camera: 'Sony A7 IV',
      lens: 'FE 85mm F1.8',
      shutter: '1/160s',
      aperture: 'f/2.8',
      iso: '400'
    }
  },
  {
    id: 'p5',
    title: 'Minimalist Editorial Monograph',
    location: 'Design Studio',
    year: '2023',
    category: 'architecture',
    image: HIMSPRING_IMAGE,
    exif: {
      camera: 'Sony A7 IV',
      lens: 'FE 35mm F1.4 GM',
      shutter: '1/400s',
      aperture: 'f/2.8',
      iso: '100'
    }
  },
  {
    id: 'p6',
    title: 'Fintech Analytics at High Density',
    location: 'Product Lab',
    year: '2024',
    category: 'street',
    image: QUICKO_IMAGE,
    exif: {
      camera: 'Sony A7 IV',
      lens: 'FE 50mm F1.2 GM',
      shutter: '1/320s',
      aperture: 'f/2.0',
      iso: '160'
    }
  }
];

export const ABOUT_DETAILS = {
  name: 'Rishi Thakor',
  title: 'Independent Freelance Developer, UI/UX Designer & Photographer',
  location: 'Gujarat, India (Working Worldwide)',
  timezone: 'IST (UTC+5:30)',
  email: 'rishithakor218@gmail.com',
  phone: '+91 9723765444',
  socials: {
    github: 'https://github.com/rishithakor',
    linkedin: 'https://www.linkedin.com/in/rishi-thakor/',
    instagram: 'https://instagram.com/therishithakor',
    twitter: 'https://twitter.com/therishithakor'
  },
  bioParagraphs: [
    "Aman Computer is a premier cyber cafe, digital service center, and citizen facilitation hub dedicated to reliable online services, government documentation, and citizen empowerment.",
    "Serving hundreds of students, job aspirants, and citizens every month with transparent guidance, fast processing, and dependable assistance for all online needs.",
    "Our Journey chronicles the continuous growth, service expansions, and community milestones of Aman Computer."
  ],
  skills: [
    { category: 'Frontend Engineering', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'HTML5/CSS3', 'Vite'] },
    { category: 'UI/UX & Product Design', items: ['Figma', 'Framer', 'Design Systems', 'Interactive Prototyping', 'Wireframing', 'Responsive UX'] },
    { category: 'Backend & Tools', items: ['Node.js', 'Express', 'REST APIs', 'PostgreSQL', 'Git / GitHub', 'Vercel / Cloud Run'] },
    { category: 'Creative & Lens', items: ['Adobe Illustrator', 'Photoshop', 'Lightroom Classic', 'Architectural Photography', 'Color Grading'] }
  ]
};


export const SERVICES = [
  {
    id: 'web-dev',
    number: '01',
    title: 'Web & App Development',
    tagline: 'High-performance, scalable web applications built with modern frontend and backend architecture.',
    description: 'From interactive fintech tools and SaaS portals to custom animated brand experiences, I write clean, modular, and maintainable code optimized for sub-second speeds and search engines.',
    deliverables: [
      'Custom React & Next.js Web Applications',
      'Fluid Animations & Micro-Interactions',
      'API Integration & Server-Side Logic',
      'Technical SEO, Core Web Vitals & Speed Optimization',
      'Responsive Mobile & Cross-Browser Precision'
    ],
    tools: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Framer Motion', 'Git']
  },
  {
    id: 'ui-ux',
    number: '02',
    title: 'UI/UX & Product Design',
    tagline: 'Intuitive user experiences and systematic design libraries rooted in real user behavioral patterns.',
    description: 'Transforming complex product logic into effortless, visually compelling interfaces. I design wireframes, high-fidelity prototypes, and cohesive design systems in Figma.',
    deliverables: [
      'User Journey Mapping & Information Architecture',
      'Wireframing & Interactive Figma Prototypes',
      'Comprehensive Design Systems & Component Tokens',
      'Responsive Mobile App & Web App UI',
      'Usability Audits & Conversion Optimization'
    ],
    tools: ['Figma', 'Framer', 'FigJam', 'Design Tokens', 'Prototyping', 'User Research']
  },
  {
    id: 'graphic-design',
    number: '03',
    title: 'Graphic Design & Brand Identity',
    tagline: 'Distinctive visual identities, curated typography palettes, and memorable brand collateral.',
    description: 'Crafting brand languages that cut through digital noise. Managed visual identities, pitch decks, luxury packaging, and social media carousels for client brands.',
    deliverables: [
      'Logo Marks & Monogram Systems',
      'Color, Typography & Brand Guidelines',
      'Pitch Decks & Investor Presentations',
      'Social Media Campaigns & Marketing Assets',
      'Print Collateral & Packaging Guidelines'
    ],
    tools: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Vector Art', 'Typography']
  },
  {
    id: 'photography',
    number: '04',
    title: 'Creative Photography & Lenswork',
    tagline: 'Visual storytelling through editorial composition, architectural geometry, and natural light.',
    description: 'Capturing moments with cinematic depth and deliberate composition. Specialized in architectural documentation, tech product showcases, live music events, and authentic portraiture.',
    deliverables: [
      'Architectural & Spatial Documentation',
      'Commercial & Tech Product Photography',
      'Concert & Event Visual Storytelling',
      'High-Resolution Post-Production & Color Grading'
    ],
    tools: ['Sony Alpha Series', 'Prime Glass (35mm/50mm/85mm)', 'Lightroom Classic', 'Capture One']
  }
];

export const WORK_PROCESS = [
  {
    step: '01',
    name: 'Discovery & Scope',
    duration: 'Week 1',
    description: 'Deep dive into your product vision, target audience, business goals, and visual aesthetic requirements. We define clear milestones and technical deliverables.'
  },
  {
    step: '02',
    name: 'Wireframes & Architecture',
    duration: 'Week 2',
    description: 'Mapping out user journeys, site maps, and layout blueprints. Interactive wireframes test usability and validate structure before visual skinning.'
  },
  {
    step: '03',
    name: 'High-Fidelity Design',
    duration: 'Week 3–4',
    description: 'Crafting pixel-perfect screens, establishing typography scales, interaction states, color palettes, and responsive behavior in Figma.'
  },
  {
    step: '04',
    name: 'Clean Engineering & Build',
    duration: 'Week 4–6',
    description: 'Developing with clean TypeScript, modern frameworks, and responsive CSS. Rigorous cross-browser testing, accessibility compliance, and performance tuning.'
  },
  {
    step: '05',
    name: 'Launch & Handover',
    duration: 'Week 6+',
    description: 'Deployment to production hosting, DNS configuration, Core Web Vitals audit, and complete documentation handover for effortless future scaling.'
  }
];

export const TESTIMONIALS = [
  {
    id: '1',
    quote: 'Rishi delivered pnl.page with astounding attention to detail. The terminal feel is crisp, the calculations are rock-solid, and our Zerodha trading community uses it daily without a hitch.',
    author: 'Aditya Mehta',
    role: 'Lead Community Engineer',
    company: 'FinTech Guild',
    location: 'Mumbai, India',
    verifiedMetric: '+18,500 Active Traders'
  },
  {
    id: '2',
    quote: 'Finding someone who bridges the gap between sophisticated UI design and robust modern frontend code is rare. Rishi designed Cliq’s entire interface from scratch and hit every milestone.',
    author: 'Marcus Vance',
    role: 'Head of Product',
    company: 'Cliq Software',
    location: 'London, UK',
    verifiedMetric: '3.4x Faster Creator Onboarding'
  },
  {
    id: '3',
    quote: 'Working across time zones was seamless. Rishi communicates with clarity, pushes visual boundaries, and builds sites that load instantly. Highest recommendation.',
    author: 'Elena Rostova',
    role: 'Creative Director',
    company: 'Forma Studio',
    location: 'New York, USA',
    verifiedMetric: '98/100 Mobile Performance'
  }
];

