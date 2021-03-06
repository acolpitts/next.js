/* eslint-env jest */
/* global jasmine */
import webdriver from 'next-webdriver'
import { join } from 'path'
import {
  nextServer,
  runNextCommand,
  startApp,
  stopApp,
  waitFor
} from 'next-test-utils'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

const appDir = join(__dirname, '../')
let appPort
let server
let app

describe('Prefetching Links in viewport', () => {
  beforeAll(async () => {
    await runNextCommand(['build', appDir])

    app = nextServer({
      dir: join(__dirname, '../'),
      dev: false,
      quiet: true
    })

    server = await startApp(app)
    appPort = server.address().port
  })
  afterAll(() => stopApp(server))

  it('should prefetch with link in viewport onload', async () => {
    let browser
    try {
      browser = await webdriver(appPort, '/')
      const links = await browser.elementsByCss('link[rel=preload]')
      let found = false

      for (const link of links) {
        const href = await link.getAttribute('href')
        if (href.includes('first')) {
          found = true
          break
        }
      }
      expect(found).toBe(true)
    } finally {
      if (browser) await browser.close()
    }
  })

  it('should prefetch with link in viewport when href changes', async () => {
    let browser
    try {
      browser = await webdriver(appPort, '/')
      await browser.elementByCss('button').click()
      await waitFor(1000)

      const links = await browser.elementsByCss('link[rel=preload]')
      let foundFirst = false
      let foundAnother = false

      for (const link of links) {
        const href = await link.getAttribute('href')
        if (href.includes('another')) foundAnother = true
        if (href.includes('first')) foundFirst = true
      }
      expect(foundFirst).toBe(true)
      expect(foundAnother).toBe(true)
    } finally {
      if (browser) await browser.close()
    }
  })

  it('should prefetch with link in viewport onload', async () => {
    let browser
    try {
      browser = await webdriver(appPort, '/')
      await browser.elementByCss('#scroll-to-another').click()
      await waitFor(1000)

      const links = await browser.elementsByCss('link[rel=preload]')
      let found = false

      for (const link of links) {
        const href = await link.getAttribute('href')
        if (href.includes('first')) {
          found = true
          break
        }
      }
      expect(found).toBe(true)
    } finally {
      if (browser) await browser.close()
    }
  })
})
