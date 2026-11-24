import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_VITE_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
];

const REQUIRED_SEO_VARS = ['APP_URL'];

const parseDotEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const out = {};
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
};

export const collectBuildEnvReport = (rootDir = process.cwd(), envSource = process.env) => {
  const dotEnv = parseDotEnvFile(path.join(rootDir, '.env'));
  const dotEnvLocal = parseDotEnvFile(path.join(rootDir, '.env.local'));
  const merged = { ...dotEnv, ...dotEnvLocal, ...envSource };

  const statusOf = (name) => {
    const val = String(merged[name] || '').trim();
    return val.length > 0 ? 'SET' : 'MISSING';
  };

  const viteStatus = Object.fromEntries(REQUIRED_VITE_VARS.map((k) => [k, statusOf(k)]));
  const seoStatus = Object.fromEntries(REQUIRED_SEO_VARS.map((k) => [k, statusOf(k)]));

  const missingVite = REQUIRED_VITE_VARS.filter((k) => viteStatus[k] === 'MISSING');
  const missingSeo = REQUIRED_SEO_VARS.filter((k) => seoStatus[k] === 'MISSING');

  // Safe endpoint checks on built dist/ (boolean presence only — never exposes secrets)
  const distDir = path.join(rootDir, 'dist');
  const assetsDir = path.join(distDir, 'assets');
  let distChecked = false;
  let hasSupabaseEndpointInBundle = false;
  let hasFirebaseConfigInBundle = false;
  let hasLoginHtml = false;
  let hasAdminHtml = false;
  let hasSitemapPlaceholder = false;

  if (fs.existsSync(distDir)) {
    distChecked = true;
    hasLoginHtml =
      fs.existsSync(path.join(distDir, 'login.html')) &&
      fs.existsSync(path.join(distDir, 'login', 'index.html'));
    hasAdminHtml =
      fs.existsSync(path.join(distDir, 'admin.html')) &&
      fs.existsSync(path.join(distDir, 'admin', 'index.html'));

    if (fs.existsSync(assetsDir)) {
      const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
      const supaUrl = String(merged.VITE_SUPABASE_URL || '').trim();
      const fbAuthDomain = String(merged.VITE_FIREBASE_AUTH_DOMAIN || '').trim();
      for (const file of jsFiles) {
        const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
        if (supaUrl && content.includes(supaUrl)) {
          hasSupabaseEndpointInBundle = true;
        } else if (/\.supabase\.co/i.test(content)) {
          hasSupabaseEndpointInBundle = true;
        }
        if (fbAuthDomain && content.includes(fbAuthDomain)) {
          hasFirebaseConfigInBundle = true;
        } else if (/\.firebaseapp\.com/i.test(content)) {
          hasFirebaseConfigInBundle = true;
        }
      }
    }

    const sitemapPath = path.join(distDir, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      hasSitemapPlaceholder = fs
        .readFileSync(sitemapPath, 'utf8')
        .includes('https://aman-computer.example');
    }
  }

  return {
    viteStatus,
    seoStatus,
    missingVite,
    missingSeo,
    allConfigured: missingVite.length === 0 && missingSeo.length === 0,
    dist: {
      checked: distChecked,
      hasLoginHtml,
      hasAdminHtml,
      hasSupabaseEndpointInBundle,
      hasFirebaseConfigInBundle,
      hasSitemapPlaceholder,
    },
  };
};

const isDirectRun =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isDirectRun) {
  const strict = process.argv.includes('--strict') || process.env.STRICT_BUILD_ENV === '1';
  const report = collectBuildEnvReport();
  console.log('=== Aman Computer Build Environment Validation ===');
  for (const [k, v] of Object.entries(report.viteStatus)) {
    console.log(`  ${k}: ${v}`);
  }
  for (const [k, v] of Object.entries(report.seoStatus)) {
    console.log(`  ${k}: ${v}`);
  }
  if (report.dist.checked) {
    console.log('=== Production Bundle (dist/) Verification ===');
    console.log(`  dist/admin.html + dist/admin/index.html: ${report.dist.hasAdminHtml ? 'OK' : 'MISSING'}`);
    console.log(`  dist/login.html + dist/login/index.html: ${report.dist.hasLoginHtml ? 'OK' : 'MISSING'}`);
    console.log(`  Supabase endpoint bundled: ${report.dist.hasSupabaseEndpointInBundle ? 'YES' : 'NO (missing at build time)'}`);
    console.log(`  Firebase authDomain bundled: ${report.dist.hasFirebaseConfigInBundle ? 'YES' : 'NO (missing at build time)'}`);
    console.log(`  SEO sitemap placeholder remaining: ${report.dist.hasSitemapPlaceholder ? 'YES' : 'NO'}`);
  }
  if (!report.allConfigured) {
    const missingList = [...report.missingVite, ...report.missingSeo].join(', ');
    console.warn(`Missing production build variables: ${missingList}`);
    if (strict) {
      process.exitCode = 1;
    }
  }
}
