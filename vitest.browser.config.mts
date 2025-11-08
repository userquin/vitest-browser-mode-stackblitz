import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { preview } from '@vitest/browser-preview'
import { provider } from 'std-env'
import { defineConfig } from 'vitest/config'
import { customPreview } from './custom-preview-provider'

const instances = process.env.BROWSER || provider === 'stackblitz'
  ? [{ browser: process.env.BROWSER || 'chrome' }]
  : [{ browser: 'chrome' }, { browser: 'firefox' }]

export default defineConfig({
  plugins: [vue()],
  test: {
    browser: {
      enabled: true,
      provider: provider === 'stackblitz' ? preview() : customPreview(),
      instances,
    },
  },
})
