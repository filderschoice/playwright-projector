const { chromium, firefox, webkit } = require('playwright')
const plUtil = require('../utils/plUtil')
const PlaywrightCores = {}

/**
 * Variable
 */
// Browser Info
PlaywrightCores.browserType = chromium
PlaywrightCores.browserArgs = [
  // flag reference: https://peter.sh/experiments/chromium-command-line-switches/
  // '--allow-external-pages',
  // '--allow-http-background-page',
  // '--allow-http-screen-capture',
  // '--allow-insecure-localhost',
  // '--disble-gpu',
  // '--disble-dev-shm-usage',
  // '--disble-setuid-sandbox',
  // '--no-first-run',
  // '--no-sandbox',
  // '--no-zygote',
  // '--mute-audio',
  // '--js-flags=--expose-gc',
  '--lang=ja',
  '--window-size=1390,840',
  '-wait-for-browser'
]

// Page Info
PlaywrightCores.defaultViewport = { width: 1366, height: 700 }
PlaywrightCores.ssFilename = 'playwright-projector'
PlaywrightCores.ssNumber = 0

/**
 * Setting Browser type
 * @param type Browser type(chromium/firefox/webkit)
 */
PlaywrightCores.setBrowserType = function (type = 'chromium') {
  switch (type) {
    case 'firefox':
      PlaywrightCores.browserType = firefox
      break
    case 'webkit':
      PlaywrightCores.browserType = webkit
      break
    case 'chromium':
    default:
      PlaywrightCores.browserType = chromium
      break
  }
}

/**
 * Getting Browser args
 * @param proxyInfo Proxy Info
 */
PlaywrightCores.getArgs = function (proxyInfo = []) {
  let ret = PlaywrightCores.browserArgs
  // Set Proxy
  if (proxyInfo.length == 0) {
    // No Proxy
    ret.push('--no-proxy-server')
  } else {
    // Add Proxy
    proxyInfo.forEach((proxy) => {
      ret.push(proxy)
    })
  }
  return ret
}

/**
 * Launch Server
 * @param headless Headless Flag
 * @param timeout Browser Timeout
 * @param args Browser args
 * @param slowMo SlowMo
 * @returns browserServer
 */
PlaywrightCores.launchServer = async function (headless = false, timeout = 60000, args = [], slowMo = 10) {
  // launch browserServer
  let browserServer = await PlaywrightCores.browserType.launchServer({
    headless,
    timeout,
    args,
    slowMo
  })
  return browserServer
}

/**
 * Getting BrowserServer Endpoint
 * @param browserServer BrowserServer
 * @returns endpoint
 */
PlaywrightCores.getEndpoint = async function (browserServer) {
  // get endpoint
  let wsEndpoint = await browserServer.wsEndpoint()
  return wsEndpoint
}

/**
 * Connecting Browser
 * @param wsEndpoint Endpoint
 * @returns browser
 */
PlaywrightCores.connectBrowser = async function (wsEndpoint) {
  // connect Browser
  let browser = await PlaywrightCores.browserType.connect({
    wsEndpoint
  })
  return browser
}

/**
 * Create New Context
 * @param browser Browser
 * @param options options
 * @returns context
 */
PlaywrightCores.newContext = async function (browser, options = {}) {
  // set optionInfo
  const option = {
    ignoreHTTPSErrors: true,
    locale: options.locale || 'jp-JP'
  }
  // set auth
  if (plUtil.isNotEmpty(options.auth)) {
    // add httpCredentials
    option.httpCredentials = {
      username: options.auth.username,
      password: options.auth.password
    }
  }
  // set video
  if (plUtil.isNotEmpty(options.video)) {
    // add video
    option.recordVideo = { dir: 'videos/' }
  }
  // Create Context
  const context = await browser.newContext(option)
  return context
}

/**
 * Close BrowserServer
 * @param browserServer BrowserServer
 */
PlaywrightCores.close = async function (browserServer) {
  // wait
  await new Promise((resolve) => setTimeout(resolve, 1000))
  try {
    // close browserServer
    await browserServer.close()
  } catch (e) {
    // catch exception
    console.log('playwright ended.')
  }
}

/**
 * Setting Page Params
 * @param page Page
 * @param param Page Params
 */
PlaywrightCores.setPageParameter = async function (page, param) {
  // set defaultTimeout
  await page.setDefaultTimeout(param.timeout)
}

/**
 * Getting OperatePage
 * @param browser Browser
 * @returns page
 */
PlaywrightCores.getOperatePage = async function (context) {
  // get pages
  let pages = await context.pages()
  let page = null
  if (pages.length === 0) {
    // no pages: set newPage
    page = await context.newPage()
  } else {
    // page exist: get firstPage
    let usePageIdx = 0
    for (let idx = 0; idx < pages.length; idx++) {
      const page = pages[idx]
      if (page.url() !== 'about:brank') {
        // get operation page
        usePageIdx = idx
        break
      }
    }
    // set oparatePage
    page = pages[usePageIdx]
  }
  return page
}

/**
 * Getting Screenshot Number
 * @return screenshot number
 */
PlaywrightCores.getSsNumber = function () {
  let ret = this.ssNumber
  // increment screenshot number
  this.ssNumber++
  return ret
}

/**
 * Getting Screenshot FileName
 * @param baseFileName BaseFileName
 * @param number Screenshot Number
 * @param type File Ext Type
 * @return screenshot fileName
 */
PlaywrightCores.mkSsFileName = function (baseFileName, number = 0, type = 'jpeg') {
  // offset
  let len = 3
  return baseFileName + '_' + (Array(len).join('0') + number).slice(-len) + '.' + type
}

/**
 * Execute Operation Page
 * @param page Page
 * @param scenario Scenario
 * @param options Options
 */
PlaywrightCores.execOperationPage = async function (page, scenario, options) {
  if (plUtil.isEmpty(scenario.type)) {
    // Not Operation type
    return
  }
  switch (scenario.type) {
    case 'conditions':
      let condSelector
      switch (scenario.subType) {
        case 'click':
          condSelector = await page.$$(scenario.selector)
          if (plUtil.isNotEmpty(condSelector) && scenario.selectorIndex <= condSelector.length) {
            // exist selector: click
            await condSelector[scenario.selectorIndex].click()
          }
          break
        default:
          break
      }
      break
    case 'goto':
      // page.goto
      await page.goto(scenario.url)
      break
    case 'input':
      // check selector
      let inputSelector = await page.$$(scenario.selector)
      if (plUtil.isNotEmpty(inputSelector)) {
        // exist selector: type/insertText
        await inputSelector[0].type('')
        await page.keyboard.insertText(scenario.value)
      }
      break
    case 'submit':
      // check selector
      let submitSelector = await page.$$(scenario.selector)
      if (plUtil.isNotEmpty(submitSelector)) {
        // exist selector: click
        await submitSelector[0].click()
      }
      break
    case 'screenshot':
      // page.screenshot
      const ssOption = plUtil.isNotEmpty(scenario.options) ? scenario.options : options.screenshot
      ssOption.path = this.mkSsFileName(
        plUtil.pathJoin(ssOption.dir, this.ssFilename),
        this.getSsNumber(),
        ssOption.type
      )
      await page.screenshot(ssOption)
      break
    case 'wait':
      // wait
      await new Promise((resolve) => setTimeout(resolve, scenario.time))
      break
    case 'waitForURL':
      // waitForURL
      await page.waitForURL(scenario.url)
      break
    default:
      // other
      break
  }
}

module.exports = PlaywrightCores
