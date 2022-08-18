const { chromium, firefox, webkit } = require('playwright')
const plUtil = require('../utils/plUtil')

// Playwright基底関数
const PlaywrightCores = {}

/**
 * 定数
 */
// ブラウザ起動パラメータ
PlaywrightCores.browserType = chromium
PlaywrightCores.browserArgs = [
  // flag追加
  // フラグ参考： https://peter.sh/experiments/chromium-command-line-switches/
  '--allow-external-pages',
  '--allow-http-background-page',
  '--allow-http-screen-capture',
  '--allow-insecure-localhost',
  '--disble-gpu',
  '--disble-dev-shm-usage',
  '--disble-setuid-sandbox',
  '--no-first-run',
  '--no-sandbox',
  '--no-zygote',
  '--mute-audio',
  '--js-flags=--expose-gc',
  '--lang=ja',
  '--window-size=1390,840',
  '-wait-for-browser'
]

// page viewport表示域
PlaywrightCores.defaultViewport = { width: 1366, height: 700 }
// page SS情報
PlaywrightCores.ssFilename = 'pl-reader'
PlaywrightCores.ssNumber = 0

/**
 * Browser type設定
 * @param type ブラウザ種別
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
 * Browser args取得
 * @param proxyInfo proxy情報
 */
PlaywrightCores.getArgs = function (proxyInfo = []) {
  let ret = PlaywrightCores.browserArgs
  if (proxyInfo.length == 0) {
    // No Proxy
    ret.push('--no-proxy-server')
  } else {
    // Proxy Setting
    proxyInfo.forEach(proxy => {
      ret.push(proxy)
    })
  }
  return ret
}

/**
 * browserServer起動
 * @param headless headlessフラグ
 * @param timeout browserタイムアウト値
 * @param args browser起動引数
 * @param slowMo 遅延値
 * @returns browser情報
 */
PlaywrightCores.launchServer = async function (headless = false, timeout = 60000, args = [], slowMo = 10) {
  // browserServer起動
  let browserServer = await PlaywrightCores.browserType.launchServer({
    headless,
    timeout,
    args,
    slowMo
  })

  // browserServer返却
  return browserServer
}

/**
 * endpoint情報取得
 * @param browserServer browserServer
 * @returns endpoint
 */
PlaywrightCores.getEndpoint = async function (browserServer) {
  // endpoint情報取得
  let wsEndpoint = await browserServer.wsEndpoint()

  // endpoint情報返却
  return wsEndpoint
}

/**
 * browser接続
 * @param wsEndpoint endpoint
 * @returns browser情報
 */
PlaywrightCores.connectBrowser = async function (wsEndpoint) {
  // browser接続
  let browser = await PlaywrightCores.browserType.connect({
    wsEndpoint
  })

  // browser情報返却
  return browser
}

/**
 * Context情報作成
 * @param browser browser情報
 * @param locale locale情報
 * @returns context情報
 */
PlaywrightCores.newContext = async function (browser, locale = 'ja-JP', auth = null) {
  // option情報作成
  const option = {
    ignoreHTTPSErrors: true,
    locale: locale
  }
  if (auth != null) {
    // 認証情報あり
    option.httpCredentials = { username: auth.username, password: auth.password }
  }
  // Context情報作成
  const context = await browser.newContext(option)
  // Context情報返却
  return context
}

/**
 * Playwright終了
 */
PlaywrightCores.close = async function (browserServer) {
  // wait
  await new Promise((resolve) => setTimeout(resolve, 1000))
  try {
    // browserServerクローズ
    await browserServer.close()
  } catch (e) {
    // 例外発生時
    console.log('playwright ended.')
  }
}

/**
 * Pageパラメータ設定
 * @param page page情報
 * @param param pageパラメータ情報
 */
PlaywrightCores.setPageParameter = async function (page, param) {
  // タイムアウト値変更
  await page.setDefaultTimeout(param.timeout)
}

/**
 * 操作page情報取得
 * @param browser browser情報
 * @returns page情報
 */
PlaywrightCores.getOperatePage = async function (context) {
  let pages = await context.pages()
  let page = null
  if (pages.length === 0) {
    // page未表示の場合、新規ページオープン
    page = await context.newPage()
  } else {
    // 表示中のpageから対象pageを特定
    let usePageIdx = 0
    for (let idx = 0; idx < pages.length; idx++) {
      const page = pages[idx]
      if (page.url() !== 'about:brank') {
        // 使用中page情報保持
        usePageIdx = idx
        break
      }
    }
    // page情報を保持
    page = pages[usePageIdx]
  }
  return page
}

/**
 * Screenshotナンバー取得
 * @return Screenshotナンバー
 */
PlaywrightCores.getSsNumber = function () {
  let ret = this.ssNumber
  // インクリメント
  this.ssNumber++
  return ret
}

/**
 * Screenshotファイルパス取得
 * @param page page情報
 * @param scenario scenario情報
 */
PlaywrightCores.mkSsPath = function (baseFileName, number = 0, type = 'jpeg') {
  // 桁数
  let len = 3
  return baseFileName + '_' + (Array(len).join('0') + number).slice(-len) + '.' + type
}

/**
 * page操作処理
 * @param page page情報
 * @param scenario scenario情報
 */
PlaywrightCores.execOperationPage = async function (page, scenario, options) {
  if (plUtil.isEmpty(scenario.type)) {
    // 処理なし
    return
  }
  switch(scenario.type) {
    case 'goto':
      // page.goto
      await page.goto(scenario.url)
      break
    case 'screenshot':
      // page.screenshot
      const ssOption = plUtil.isNotEmpty(scenario.options) ? scenario.options : options.screenshot
      ssOption.path = this.mkSsPath(plUtil.pathJoin(ssOption.dir, this.ssFilename), this.getSsNumber(), ssOption.type)
      await page.screenshot(ssOption)
      break
    case 'wait':
      // wait
      await new Promise((resolve) => setTimeout(resolve, scenario.time))
      break
    default:
      // その他
      break
  }
}

module.exports = PlaywrightCores