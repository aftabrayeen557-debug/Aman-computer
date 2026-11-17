# Aman Computer — Cyber Cafe & Digital Center

Web platform and Admin CMS for **Aman Computer**, a Cyber Cafe & Digital Services Center in Varanasi, Uttar Pradesh.

## Core Modules

- **Public Storefront (`/` & `/home/`)**:
  - Four interactive service doors (`Three.js` 3D canvases + Lenis smooth scroll):
    - `/web-developer/` — Online Forms, Sarkari Result & Latest Notifications
    - `/app-developer/` — PAN Card, Aadhaar, Passport & Identity Services
    - `/ui-ux-designer/` — High-Speed Printing, Scanning, Lamination & Photo Studio
    - `/graphic-designer/` — IRCTC Train Tickets, Flight Bookings & Travel
  - Live service catalog, Government Schemes (`#schemes`), Cyber Cafe Workflow (`#how-it-works`), Customer Enquiry Form (`#enquiry`), FAQs (`#faqs`), dark/light mode toggle, and legal pages (`/legal/`, `/privacy-policy/`, `/terms-and-conditions/`).
- **Admin Studio (`/admin` & `/login`)**:
  - Firebase Authentication + custom claim verification with Supabase Edge Function (`verify-admin`) and Row Level Security.
  - Manage Services, Enquiries, Documents Guide, Latest Updates, Government Schemes, Shop Journey, Photo Gallery, Brand & Theme settings, SEO Metadata, Hero typography & limits, Business Profile, and FAQs.

## Environment Variables

See `.env.example` for required environment keys (all client-exposed keys use the `VITE_` prefix):

- `APP_URL`: Production origin URL used at build time to stamp `sitemap.xml` and `robots.txt`.
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: Supabase project URL and anon key.
- `VITE_FIREBASE_*`: Firebase project configuration (authentication).
- `VITE_ADMIN_EMAIL`: Configured admin email address for console authorization.

Never commit `.env` or secret credentials to version control.

## Scripts

```bash
npm install        # Install dependencies
npm run dev        # Start local Vite dev server (port 3000)
npm run build      # Build production bundle into dist/
npm run lint       # Type-check with TypeScript (tsc --noEmit)
npm test           # Run backend/CMS/security verification suite
```
