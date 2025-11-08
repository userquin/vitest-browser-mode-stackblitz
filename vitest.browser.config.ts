import { defineConfig } from 'vitest/config'
import { preview } from '@vitest/browser-preview'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    browser: {
      enabled: true,
      provider: preview(),
      instances: [
      { browser: 'chrome' },
      ],
    },
  },
})
