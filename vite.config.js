import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env': env
    },
    plugins: [
      react(),
      {
        name: 'telegram-webapp-csp',
        transformIndexHtml() {
          // Only apply CSP in production
          if (mode === 'production') {
            return [
              {
                tag: 'meta',
                attrs: {
                  'http-equiv': 'Content-Security-Policy',
                  content: `
                    default-src 'self' data: telegram.org *.telegram.org;
                    script-src 'self' 'unsafe-inline' 'unsafe-eval' telegram.org *.telegram.org;
                    style-src 'self' 'unsafe-inline' telegram.org *.telegram.org;
                    img-src 'self' data: blob: telegram.org *.telegram.org;
                    connect-src 'self' telegram.org *.telegram.org ${env.VITE_API_BASE_URL || ''};
                    frame-src 'self' telegram.org *.telegram.org;
                  `.replace(/\s+/g, ' ').trim(),
                },
                injectTo: 'head-prepend',
              },
            ];
          }
          return [];
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.test.{js,jsx}',
          '**/*.spec.{js,jsx}',
          '**/*.d.ts',
        ],
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            twa: ['@twa-dev/sdk'],
          },
        },
      },
    },
  };
});
