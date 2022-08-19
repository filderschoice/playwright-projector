// Util
const plUtil = require('./utils/plUtil')
// Playwright Core
const plCore = require('./core/plCore')

const runPlaywright = {}
runPlaywright.exec = async (scenarios = [], options = {}) => {
  // output begin log
  plUtil.logInfo('runPlaywright.exec begin')
  // get browserArgs
  const browserArgs = plCore.getArgs(options.proxyInfo)
  // Setup Playwright
  const browserServer = await plCore.launchServer(options.headless, options.timeout, browserArgs, options.slowMo)
  const wsEndpoint = await plCore.getEndpoint(browserServer)
  const browser = await plCore.connectBrowser(wsEndpoint)
  const context = await plCore.newContext(browser, options.locale, options.auth)
  const page = await plCore.getOperatePage(context)

  if (plUtil.isNotEmpty(scenarios)) {
    // Run Playwright Scenarios
    for (let scenario of scenarios) {
      // output scenario log
      plUtil.logDebug(scenario)
      // execute scenario action
      await plCore.execOperationPage(page, scenario, options)
      // wait
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  // End Playwright
  await page.close()
  await context.close()
  await plCore.close(browserServer)
  // output end log
  plUtil.logInfo('runPlaywright.exec end')
}

module.exports = runPlaywright
