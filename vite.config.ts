import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'route-rewrites',
        configureServer(server) {
          const subdirs = [
            'web-developer',
            'app-developer',
            'ui-ux-designer',
            'graphic-designer',
            'photographer',
            'legal',
            'ability-card',
            'privacy-policy',
            'terms-and-conditions',
          ];
          server.middlewares.use((req, res, next) => {
            const urlPath = req.url ? req.url.split('?')[0] : '';
            if (urlPath.startsWith('/vendor/')) {
              const filePath = path.join(__dirname, 'public', urlPath);
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
              urlPath === '/login/'
            ) {
              req.url = '/admin.html';
              return next();
            }
            if (urlPath === '/home' || urlPath === '/home/') {
              req.url = '/';
              return next();
            }
            for (const dir of subdirs) {
              if (urlPath === `/${dir}` || urlPath === `/${dir}/`) {
                req.url = `/${dir}/index.html`;
                return next();
              }
            }
            next();
          });
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
