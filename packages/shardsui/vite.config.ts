import { svelte } from '@sveltejs/vite-plugin-svelte'
import { playwright } from '@vitest/browser-playwright'
import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

const SUPPORTED_BROWSERS = ['chromium', 'firefox', 'webkit'] as const

const environment = process.env.VITEST_ENV

function browserInstances() {
  if (environment === 'all-browsers') {
    return SUPPORTED_BROWSERS.map((browser) => ({ browser }))
  }
  const browser = SUPPORTED_BROWSERS.find((supported) => supported === environment)
  return browser ? [{ browser }] : null
}

const CHROMIUM_ARGS = [
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding'
]

const MAX_WORKERS = process.env.CI ? 1 : Math.max(1, Math.floor(os.availableParallelism() / 2))

const instances = browserInstances()?.map((instance) =>
  instance.browser === 'chromium' ? { ...instance, launch: { args: CHROMIUM_ARGS } } : instance
)

export default defineConfig({
  plugins: [svelte()],
  cacheDir: path.resolve(import.meta.dirname, 'node_modules/.vite'),
  resolve: {
    alias: {
      $lib: path.resolve(import.meta.dirname, 'src/lib')
    },
    conditions: ['browser', 'development']
  },
  test: {
    ...(instances
      ? {
          maxWorkers: MAX_WORKERS,
          browser: {
            enabled: true,
            provider: playwright(),
            screenshotFailures: false,
            headless: true,
            instances
          }
        }
      : { environment: 'jsdom' }),
    globals: true,
    // Avoid committing tests that influence their own retry
    retry: process.env.CI ? 1 : 0,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.ts']
  }
})
