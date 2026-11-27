import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';
import {collectBuildEnvReport} from './scripts/verify-build-env.mjs';

const SUBDIRS = [
  'web-developer',
  'app-developer',
  'ui-ux-designer',
  'graphic-designer',
  'icon-system',
  'legal',
  'privacy-policy',
  'terms-and-conditions',
];

function createRouteMiddleware(rootBaseDir: string, isPreview: boolean) {
  return (req: any, res: any, next: () => void) => {
    const urlPath = req.url ? req.url.split('?')[0] : '';

    if (!isPreview && urlPath.startsWith('/vendor/')) {
      const filePath = path.join(rootBaseDir, 'public', urlPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    if (req.method === 'POST') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end('OK');
      return;
    }

    if (
      urlPath === '/admin' ||
      urlPath === '/admin/' ||
      urlPath.startsWith('/admin/') ||
      urlPath === '/login' ||
      urlPath === '/login/' ||
      urlPath.startsWith('/login/')
    ) {
      req.url = '/admin.html';
      return next();
    }

    if (urlPath === '/home' || urlPath === '/home/') {
      req.url = '/';
      return next();
    }

    for (const dir of SUBDIRS) {
      if (urlPath === `/${dir}` || urlPath === `/${dir}/`) {
        req.url = `/${dir}/index.html`;
        return next();
      }
    }

    if (
      req.method === 'GET' &&
      urlPath !== '/' &&
      !urlPath.startsWith('/@') &&
      !urlPath.startsWith('/src/') &&
      !urlPath.startsWith('/node_modules/') &&
      !urlPath.startsWith('/assets/')
    ) {
      const staticRoot = isPreview ? rootBaseDir : path.join(rootBaseDir, 'public');
      const staticCandidate = path.join(staticRoot, urlPath);
      const rootCandidate = path.join(rootBaseDir, urlPath);
      const staticIndex = path.join(staticCandidate, 'index.html');
      const exists =
        (fs.existsSync(staticCandidate) && fs.statSync(staticCandidate).isFile()) ||
        (fs.existsSync(rootCandidate) && fs.statSync(rootCandidate).isFile()) ||
        (fs.existsSync(staticIndex) && fs.statSync(staticIndex).isFile());

      if (!exists && (!path.extname(urlPath) || urlPath.endsWith('.html'))) {
        const notFoundFile = isPreview
          ? path.join(rootBaseDir, '404.html')
          : path.join(rootBaseDir, 'public', '404.html');
        if (fs.existsSync(notFoundFile)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          fs.createReadStream(notFoundFile).pipe(res);
          return;
        }
      }
    }

    next();
  };
}

export default defineConfig(({mode}) => {
  const loadedEnv = loadEnv(mode, __dirname, '');
  const mergedEnv = {...loadedEnv, ...process.env};

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'route-rewrites',
        configureServer(server) {
          server.middlewares.use(createRouteMiddleware(__dirname, false));
        },
        configurePreviewServer(server) {
          server.middlewares.use(createRouteMiddleware(path.resolve(__dirname, 'dist'), true));
        },
      },
      {
        name: 'public-sync-doors',
        closeBundle() {
          const distDir = path.resolve(__dirname, 'dist');
          const publicDoorHtmls = [
            'web-developer/index.html',
            'app-developer/index.html',
            'ui-ux-designer/index.html',
            'graphic-designer/index.html',
            'home/index.html',
          ];
          for (const rel of publicDoorHtmls) {
            const target = path.join(distDir, rel);
            if (fs.existsSync(target)) {
              const html = fs.readFileSync(target, 'utf8');
              const updated = html.replace(
                /src="\/src\/lib\/publicSync\.ts"/g,
                'src="/assets/public-sync.js"'
              );
              if (updated !== html) {
                fs.writeFileSync(target, updated, 'utf8');
              }
            }
          }

          // Mirror built admin entrypoint to /login.html, /admin/index.html, and /login/index.html
          const adminDist = path.join(distDir, 'admin.html');
          if (fs.existsSync(adminDist)) {
            fs.copyFileSync(adminDist, path.join(distDir, 'login.html'));
            for (const sub of ['admin', 'login']) {
              const subDir = path.join(distDir, sub);
              fs.mkdirSync(subDir, {recursive: true});
              fs.copyFileSync(adminDist, path.join(subDir, 'index.html'));
            }
          }

          // Apply canonical APP_URL origin if configured at build time
          const appUrl = (mergedEnv.APP_URL || '').trim().replace(/\/+$/, '');
          if (appUrl && /^https?:\/\//i.test(appUrl)) {
            for (const seoFile of ['sitemap.xml', 'robots.txt']) {
              const filePath = path.join(distDir, seoFile);
              if (fs.existsSync(filePath)) {
                const text = fs.readFileSync(filePath, 'utf8');
                const updated = text.replace(/https:\/\/aman-computer\.example/g, appUrl);
                if (updated !== text) {
                  fs.writeFileSync(filePath, updated, 'utf8');
                }
              }
            }
          }

          // Safe build-time env validation (reports [SET]/[MISSING] only, never values)
          const envReport = collectBuildEnvReport(__dirname, mergedEnv);
          if (!envReport.allConfigured) {
            const missing = [...envReport.missingVite, ...envReport.missingSeo].join(', ');
            const msg = `[aman-computer] Build completed with missing production env vars: ${missing}`;
            if (process.env.STRICT_BUILD_ENV === '1') {
              throw new Error(msg);
            }
            console.warn(msg);
          }
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin.html'),
          publicSync: path.resolve(__dirname, 'src/lib/publicSync.ts'),
        },
        output: {
          entryFileNames: (chunkInfo) =>
            chunkInfo.name === 'publicSync'
              ? 'assets/public-sync.js'
              : 'assets/[name]-[hash].js',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
