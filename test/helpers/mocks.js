// Playwright の Page / BrowserContext / BrowserType を模したモック
// 呼び出し内容は共有の calls 配列へ { name, args } で記録する

/**
 * ElementHandle のモック
 * @param calls 呼び出し記録
 * @param label 要素の識別名
 */
const createElement = function (calls, label = 'el') {
  return {
    label,
    click: async (...args) => calls.push({ name: label + '.click', args }),
    focus: async (...args) => calls.push({ name: label + '.focus', args })
  }
}

/**
 * Page のモック
 * @param calls 呼び出し記録
 * @param opts { url, elements: { selector: [element] }, context, label, download }
 */
const createPage = function (calls, opts = {}) {
  const label = opts.label || 'page'
  const page = {
    label,
    ctx: opts.context,
    url: () => opts.url || 'https://example.invalid/',
    context: () => page.ctx,
    $$: async (selector) => {
      calls.push({ name: label + '.$$', args: [selector] })
      return (opts.elements && opts.elements[selector]) || []
    },
    goto: async (...args) => calls.push({ name: label + '.goto', args }),
    screenshot: async (...args) => calls.push({ name: label + '.screenshot', args }),
    bringToFront: async (...args) => calls.push({ name: label + '.bringToFront', args }),
    setDefaultTimeout: (...args) => calls.push({ name: label + '.setDefaultTimeout', args }),
    waitForEvent: async (...args) => {
      calls.push({ name: label + '.waitForEvent', args })
      return {
        saveAs: async (...saveArgs) => calls.push({ name: 'download.saveAs', args: saveArgs })
      }
    },
    keyboard: {
      insertText: async (...args) => calls.push({ name: label + '.keyboard.insertText', args })
    }
  }
  return page
}

/**
 * BrowserContext のモック
 * @param calls 呼び出し記録
 * @param pages 既存ページの配列
 */
const createContext = function (calls, pages = []) {
  const context = {
    pages: () => pages,
    newPage: async () => {
      calls.push({ name: 'context.newPage', args: [] })
      const page = createPage(calls, { label: 'newPage', context })
      pages.push(page)
      return page
    },
    close: async () => calls.push({ name: 'context.close', args: [] })
  }
  for (const page of pages) {
    page.ctx = context
  }
  return context
}

/**
 * BrowserType のモック
 * @param calls 呼び出し記録
 * @param opts { closeError }
 */
const createBrowserType = function (calls, opts = {}) {
  return {
    launchServer: async (...args) => {
      calls.push({ name: 'browserType.launchServer', args })
      return {
        wsEndpoint: () => 'ws://mock-endpoint',
        close: async () => {
          calls.push({ name: 'browserServer.close', args: [] })
          if (opts.closeError) {
            throw opts.closeError
          }
        }
      }
    },
    connect: async (...args) => {
      calls.push({ name: 'browserType.connect', args })
      return {
        newContext: async (...ctxArgs) => {
          calls.push({ name: 'browser.newContext', args: ctxArgs })
          return createContext(calls)
        }
      }
    }
  }
}

/**
 * 記録から呼び出し名の一覧を取得する
 * @param calls 呼び出し記録
 */
const names = function (calls) {
  return calls.map((c) => c.name)
}

module.exports = { createElement, createPage, createContext, createBrowserType, names }
