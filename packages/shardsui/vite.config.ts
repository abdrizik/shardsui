import { svelte } from '@sveltejs/vite-plugin-svelte'
import { playwright } from '@vitest/browser-playwright'
import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

const SUPPORTED_BROWSERS = ['chromium', 'firefox', 'webkit'] as const
type SupportedBrowser = (typeof SUPPORTED_BROWSERS)[number]

const environment = process.env.VITEST_ENV

function browserInstances() {
  if (environment === 'all-browsers') {
    return SUPPORTED_BROWSERS.map((browser) => ({ browser }))
  }
  if (SUPPORTED_BROWSERS.includes(environment as SupportedBrowser)) {
    return [{ browser: environment as SupportedBrowser }]
  }
  return null
}

// Chromium renders on the GPU by default; on Apple silicon a parallel run saturates it and the
// display flickers. Software rendering keeps the suite on the CPU.
const CHROMIUM_ARGS = ['--disable-gpu']

const MAX_WORKERS = Math.max(1, Math.floor(os.availableParallelism() / 2))

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
