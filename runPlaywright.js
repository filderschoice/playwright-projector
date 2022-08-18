
// 共通関数
const plUtil = require('./utils/plUtil')
// Playwright基底関数
const plCore = require('./core/plCore')

// Playwright実行
const runPlaywright = {}

runPlaywright.exec = async (scenarios = [],options = {}) => {
  // 実行処理ログ
  plUtil.logInfo('runPlaywright.exec begin')
  // browserArgs取得
  const browserArgs = plCore.getArgs(options.proxyInfo)
  // Playwright起動
  const browserServer = await plCore.launchServer(options.headless, options.timeout, browserArgs, options.slowMo)
  const wsEndpoint = await plCore.getEndpoint(browserServer)
  const browser = await plCore.connectBrowser(wsEndpoint)
  const context = await plCore.newContext(browser, options.locale, options.auth)
  const page = await plCore.getOperatePage(context)

  if (plUtil.isNotEmpty(scenarios)) {
    for (let scenario of scenarios) {
      // 実行処理ログ
      plUtil.logDebug(scenario)
      // page処理実行
      await plCore.execOperationPage(page, scenario, options)
      // wait
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  // Playwright終了
  await page.close()
  await context.close()
  await plCore.close(browserServer)
  // 実行処理ログ
  plUtil.logInfo('runPlaywright.exec end')
}

module.exports = runPlaywright