import type { BrowserProvider, BrowserProviderOption, TestProject } from 'vitest/node'
import path from 'node:path'
import { nextTick } from 'node:process'
import { defineBrowserProvider } from '@vitest/browser'
import { openBrowser as _openBrowser } from './openBrowser'

export function customPreview(): BrowserProviderOption {
  return defineBrowserProvider({
    name: 'preview',
    providerFactory(project) {
      return new CustomPreviewBrowserProvider(project)
    },
  })
}

class CustomPreviewBrowserProvider implements BrowserProvider {
  public name = 'preview' as const
  public supportsParallelism: boolean = false
  private project!: TestProject
  private open = false

  public initScripts: string[] = [
    path.resolve('./node_modules/@vitest/browser-preview/dist/locators.js').replace(/\\/g, '/'),
  ]

  constructor(project: TestProject) {
    this.project = project
    this.open = false
    if (project.config.browser.headless) {
      throw new Error(
        'You\'ve enabled headless mode for "preview" provider but it doesn\'t support it. Use "playwright" or "webdriverio" instead: https://vitest.dev/guide/browser/#configuration',
      )
    }
    nextTick(() => {
      project.vitest.logger.printBrowserBanner(project)
    })
  }

  isOpen(): boolean {
    return this.open
  }

  getCommandsContext() {
    return {}
  }

  private get server() {
    // return this.project.vite
    return this.project.browser!.vite
  }

  getServerUrlByHost(): string | undefined {
    const host = this.server.config.server.host
    const resolvedUrls = this.server.resolvedUrls
    if (typeof host === 'string') {
      const matchedUrl = [
        ...(resolvedUrls?.local ?? []),
        ...(resolvedUrls?.network ?? []),
      ].find(url => url.includes(host))
      if (matchedUrl) {
        return matchedUrl
      }
    }
    return resolvedUrls?.local[0] ?? resolvedUrls?.network[0]
  }

  private spinBrowser(open?: string) {
    const url = this.getServerUrlByHost()
    const resolvedOpen = open ?? this.server.config.server.open
    if (url) {
      const path
        = typeof resolvedOpen === 'string'
          ? new URL(resolvedOpen, url).href
          : url

      const browser = this.project.config.browser.name
      const browserInstances = this.project.config.browser.instances
      _openBrowser(path, browser ?? browserInstances?.[0]?.browser ?? true, this.server.config.logger)
    }
    else {
      this.server.config.logger.warn('No URL available to open in browser')
    }
  }

  async openPage(_sessionId: string, url: string): Promise<void> {
    this.open = true
    if (!this.project.browser) {
      throw new Error('Browser is not initialized')
    }
    // eslint-disable-next-line no-console
    console.log(`Launching ${this.project.config.browser.name}: ${url}`)
    this.spinBrowser(url)
    /* const options = this.project.browser.vite.config.server
    const _open = options.open
    options.open = url
    this.project.browser.vite.openBrowser()
    options.open = _open */
  }

  async close(): Promise<void> {}
}
