import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { preview } from '@vitest/browser-preview'
import { provider } from 'std-env'
import { defineConfig } from 'vitest/config'
import { customPreview } from './custom-preview-provider'

const browserProvider = provider === 'stackblitz'
  ? preview()
  : process.env.BROWSER_PROVIDER === 'playwright'
    ? playwright()
    : customPreview()

const instances = process.env.BROWSER || provider === 'stackblitz'
  ? [{ browser: process.env.BROWSER || (process.env.BROWSER_PROVIDER === 'playwright' ? 'chromium' : 'chrome') }]
  : [{ browser: process.env.BROWSER_PROVIDER === 'playwright' ? 'chromium' : 'chrome' }, { browser: 'firefox' }]

export default defineConfig({
  plugins: [vue()],
  test: {
    reporters: ['default', 'hanging-process'],
    browser: {
      enabled: true,
      provider: browserProvider,
      instances,
    },
  },
})
