import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/bundler-plugins/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite doesn't put .env values on process.env for the config itself.
  const env = loadEnv(mode, process.cwd(), '')
  // Set in CI / the hosting provider only; never commit it.
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Last, as Sentry recommends. Production builds with SENTRY_AUTH_TOKEN create a
      // release (named after the git commit on Vercel / Netlify) and upload source maps,
      // so stack traces from real users point at the original TypeScript.
      sentryVitePlugin({
        org: 'savemyvote',
        project: 'savemyvote-frontend',
        authToken: sentryAuthToken,
        disable: !sentryAuthToken,
        telemetry: false,
        sourcemaps: {
          // Uploaded to Sentry, then removed so the source isn't served publicly.
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
      }),
    ],
    build: {
      // "hidden" leaves no sourceMappingURL comment in the bundles.
      sourcemap: sentryAuthToken ? 'hidden' : false,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      // In development the API is reached through Vite, so the auth cookie is first-party.
      proxy: {
        '/api': {
          target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
          changeOrigin: false,
        },
      },
    },
  }
})
