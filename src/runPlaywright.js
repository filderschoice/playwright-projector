// require by app-root-path
const plCore = reqlib('/src/core/plCore')
const plUtil = reqlib('/src/utils/plUtil')

/**
 * Run cleanup step (errors are logged and do not hide the original error)
 * @param label Step Label(for log)
 * @param fn Cleanup Function
 */
const cleanup = async function (label, fn) {
  try {
    await fn()
  } catch (e) {
    plUtil.logInfo('[WARN] ' + label + ' failed: ' + (e && e.message ? e.message : e))
  }
}

const runPlaywright = {}
runPlaywright.exec = async (scenarios = [], options = {}) => {
  // output begin log
  plUtil.logInfo('runPlaywright.exec begin')
  // get browserArgs
  const browserArgs = plCore.getArgs(options.proxyInfo)
  // Setup Playwright
  plCore.setBrowserType(options.browserType)
  const browserServer = await plCore.launchServer(options.headless, options.timeout, browserArgs, options.slowMo)
  let context
  let page
  try {
    const wsEndpoint = await plCore.getEndpoint(browserServer)
    const browser = await plCore.connectBrowser(wsEndpoint)
    context = await plCore.newContext(browser, options)
    page = await plCore.getOperatePage(context)
    if (plUtil.isNotEmpty(options.page)) {
      // Playwright page setting
      await plCore.setPageParameter(page, options.page)
    }

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
  } finally {
    // End Playwright (also when a scenario fails)
    if (page) {
      await cleanup('page.close', () => page.close())
    }
    if (context) {
      await cleanup('context.close', () => context.close())
    }
    if (page && plUtil.isNotEmpty(options.video) && plUtil.isNotEmpty(options.video.file)) {
      // video保存
      await cleanup('video.saveAs', () =>
        page.video().saveAs(plUtil.pathJoin('result/videos/', options.video.file + '.webm'))
      )
    }
    await plCore.close(browserServer)
  }
  // output end log
  plUtil.logInfo('runPlaywright.exec end')
}

module.exports = runPlaywright
