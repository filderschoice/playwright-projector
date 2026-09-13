// src/core/plCore.js の単体テスト(ブラウザは起動せず、Playwright のオブジェクトをモックで代替する)
const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')
const playwright = require('playwright')
const { freshRequire, skipTimers, captureLog } = require('../helpers/setup')
const { createElement, createPage, createContext, createBrowserType, names } = require('../helpers/mocks')

let plCore
beforeEach(() => {
  // モジュールスコープの状態(userPage・user・ssNumber・browserType)を初期化する
  plCore = freshRequire('/src/core/plCore')
})

describe('plCore.setBrowserType (FR-04)', () => {
  it('firefox / webkit を選択し、未指定・未知の値は chromium にする', () => {
    plCore.setBrowserType('firefox')
    assert.equal(plCore.browserType, playwright.firefox)
    plCore.setBrowserType('webkit')
    assert.equal(plCore.browserType, playwright.webkit)
    plCore.setBrowserType('unknown')
    assert.equal(plCore.browserType, playwright.chromium)
    plCore.setBrowserType('firefox')
    plCore.setBrowserType()
    assert.equal(plCore.browserType, playwright.chromium)
  })
})

describe('plCore.getArgs (FR-05)', () => {
  const fixedArgs = ['--lang=ja', '--window-size=1366,768', '-wait-for-browser']

  it('proxyInfo が空(未指定・null・空配列)なら --no-proxy-server を追加する', () => {
    for (const proxyInfo of [undefined, null, []]) {
      assert.deepEqual(plCore.getArgs(proxyInfo), [...fixedArgs, '--no-proxy-server'])
    }
  })
  it('proxyInfo の各要素を追加する', () => {
    const proxyInfo = ['--proxy-server=http://proxy.invalid:8080', '--proxy-bypass-list=localhost']
    assert.deepEqual(plCore.getArgs(proxyInfo), [...fixedArgs, ...proxyInfo])
  })
  it('繰り返し呼んでも引数が累積せず、モジュール変数を変更しない', () => {
    plCore.getArgs(['--a'])
    plCore.getArgs()
    assert.deepEqual(plCore.getArgs(), [...fixedArgs, '--no-proxy-server'])
    assert.deepEqual(plCore.browserArgs, fixedArgs)
  })
})

describe('plCore.launchServer / getEndpoint / connectBrowser (FR-04)', () => {
  it('launchServer に headless・timeout・args を渡し、slowMo は渡さない', async () => {
    const calls = []
    plCore.browserType = createBrowserType(calls)
    await plCore.launchServer(true, 1234, ['--x'])
    assert.deepEqual(calls[0], {
      name: 'browserType.launchServer',
      args: [{ headless: true, timeout: 1234, args: ['--x'] }]
    })
  })
  it('launchServer の既定値は headless=false・timeout=60000・args=[]', async () => {
    const calls = []
    plCore.browserType = createBrowserType(calls)
    await plCore.launchServer()
    assert.deepEqual(calls[0].args, [{ headless: false, timeout: 60000, args: [] }])
  })
  it('getEndpoint は wsEndpoint を返す', async () => {
    const server = await createBrowserType([]).launchServer()
    assert.equal(await plCore.getEndpoint(server), 'ws://mock-endpoint')
  })
  it('connectBrowser は connect(wsEndpoint, { slowMo }) を呼び、slowMo の既定値は10', async () => {
    const calls = []
    plCore.browserType = createBrowserType(calls)
    await plCore.connectBrowser('ws://a', 250)
    await plCore.connectBrowser('ws://b')
    assert.deepEqual(calls[0].args, ['ws://a', { slowMo: 250 }])
    assert.deepEqual(calls[1].args, ['ws://b', { slowMo: 10 }])
  })
})

describe('plCore.newContext (FR-06)', () => {
  const newContextOption = async (options) => {
    const calls = []
    const browser = await createBrowserType(calls).connect()
    await plCore.newContext(browser, options)
    return calls.find((c) => c.name === 'browser.newContext').args[0]
  }

  it('既定は ignoreHTTPSErrors=true・locale=ja-JP', async () => {
    assert.deepEqual(await newContextOption(), { ignoreHTTPSErrors: true, locale: 'ja-JP' })
  })
  it('locale・auth・video を指定するとオプションへ反映する', async () => {
    const option = await newContextOption({
      locale: 'en-US',
      auth: { username: 'dummy-user', password: 'dummy-pass' },
      video: { file: 'record' }
    })
    assert.deepEqual(option, {
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      httpCredentials: { username: 'dummy-user', password: 'dummy-pass' },
      recordVideo: { dir: 'result/videos/' }
    })
  })
  it('auth・video が null の場合は追加しない', async () => {
    assert.deepEqual(await newContextOption({ auth: null, video: null }), { ignoreHTTPSErrors: true, locale: 'ja-JP' })
  })
})

describe('plCore.close (FR-10)', () => {
  it('1秒待ってからブラウザサーバーを閉じる', async (t) => {
    const delays = skipTimers(t)
    const calls = []
    const server = await createBrowserType(calls).launchServer()
    await plCore.close(server)
    assert.deepEqual(delays, [1000])
    assert.ok(names(calls).includes('browserServer.close'))
  })
  it('close の例外は外へ投げずログのみ出力する', async (t) => {
    skipTimers(t)
    const lines = captureLog(t)
    const server = await createBrowserType([], { closeError: new Error('closed') }).launchServer()
    await plCore.close(server)
    assert.deepEqual(lines, ['playwright ended.'])
  })
})

describe('plCore.setPageParameter (FR-06)', () => {
  it('page.timeout を setDefaultTimeout に設定する', async () => {
    const calls = []
    await plCore.setPageParameter(createPage(calls), { timeout: 30000 })
    assert.deepEqual(calls, [{ name: 'page.setDefaultTimeout', args: [30000] }])
  })
})

describe('plCore.getOperatePage (FR-09)', () => {
  it('ページが無ければ newPage で作成する', async () => {
    const calls = []
    const page = await plCore.getOperatePage(createContext(calls))
    assert.equal(page.label, 'newPage')
    assert.deepEqual(names(calls), ['context.newPage'])
  })
  it('pageIndex 指定時はその位置のページを返す', async () => {
    const pages = [createPage([], { label: 'p0' }), createPage([], { label: 'p1' })]
    assert.equal((await plCore.getOperatePage(createContext([], pages), 1)).label, 'p1')
  })
  it('pageIndex 未指定時は about:blank でない最初のページを返す', async () => {
    const pages = [
      createPage([], { label: 'blank', url: 'about:blank' }),
      createPage([], { label: 'shown', url: 'https://example.invalid/' })
    ]
    assert.equal((await plCore.getOperatePage(createContext([], pages))).label, 'shown')
  })
  it('全ページが about:blank の場合は先頭を返す', async () => {
    const pages = [
      createPage([], { label: 'b0', url: 'about:blank' }),
      createPage([], { label: 'b1', url: 'about:blank' })
    ]
    assert.equal((await plCore.getOperatePage(createContext([], pages))).label, 'b0')
  })
})

describe('plCore.getSsNumber / mkSsFileName (FR-08 screenshot)', () => {
  it('連番は0から始まり呼ぶたびに増える', () => {
    assert.equal(plCore.getSsNumber(), 0)
    assert.equal(plCore.getSsNumber(), 1)
    assert.equal(plCore.getSsNumber(), 2)
  })
  it('3桁以上のゼロ埋めで、1000以上は桁を増やす(切り詰めない)', () => {
    assert.equal(plCore.mkSsFileName('a', 0), 'a_000.jpeg')
    assert.equal(plCore.mkSsFileName('a', 12, 'png'), 'a_012.png')
    assert.equal(plCore.mkSsFileName('a', 999, 'png'), 'a_999.png')
    assert.equal(plCore.mkSsFileName('a', 1000, 'png'), 'a_1000.png')
  })
})

describe('plCore.execOperationPage (FR-08)', () => {
  it('type が空・未知の種別は何もしない', async () => {
    const calls = []
    const page = createPage(calls)
    await plCore.execOperationPage(page, {}, {})
    await plCore.execOperationPage(page, { type: '' }, {})
    await plCore.execOperationPage(page, { type: 'dummy', sample: 'test' }, {})
    assert.deepEqual(calls, [])
  })

  it('goto は page.goto(url) を呼ぶ', async () => {
    const calls = []
    await plCore.execOperationPage(createPage(calls), { type: 'goto', url: 'https://example.invalid/' }, {})
    assert.deepEqual(calls, [{ name: 'page.goto', args: ['https://example.invalid/'] }])
  })

  it('input は先頭要素へフォーカスしてから insertText する', async () => {
    const calls = []
    const elements = { 'input.q': [createElement(calls, 'el0'), createElement(calls, 'el1')] }
    await plCore.execOperationPage(
      createPage(calls, { elements }),
      { type: 'input', selector: 'input.q', value: 'abc' },
      {}
    )
    assert.deepEqual(names(calls), ['page.$$', 'el0.focus', 'page.keyboard.insertText'])
    assert.deepEqual(calls[2].args, ['abc'])
  })
  it('input は要素が無ければ何も入力しない', async () => {
    const calls = []
    await plCore.execOperationPage(createPage(calls), { type: 'input', selector: 'none', value: 'abc' }, {})
    assert.deepEqual(names(calls), ['page.$$'])
  })

  it('submit は先頭要素をクリックし、要素が無ければ何もしない', async () => {
    const calls = []
    const elements = { 'button[type=submit]': [createElement(calls, 'el0'), createElement(calls, 'el1')] }
    const page = createPage(calls, { elements })
    await plCore.execOperationPage(page, { type: 'submit', selector: 'button[type=submit]' }, {})
    await plCore.execOperationPage(page, { type: 'submit', selector: 'none' }, {})
    assert.deepEqual(names(calls), ['page.$$', 'el0.click', 'page.$$'])
  })

  it('wait は time ミリ秒待つ', async (t) => {
    const delays = skipTimers(t)
    await plCore.execOperationPage(createPage([]), { type: 'wait', time: 1500 }, {})
    assert.deepEqual(delays, [1500])
  })

  describe('screenshot', () => {
    it('コンフィグの screenshot を複製して path を付け、連番で保存する(共有設定は変更しない)', async () => {
      const calls = []
      const page = createPage(calls)
      const options = { screenshot: { dir: './result/ss', type: 'jpeg', quality: 70 } }
      await plCore.execOperationPage(page, { type: 'screenshot' }, options)
      await plCore.execOperationPage(page, { type: 'screenshot' }, options)
      assert.deepEqual(calls[0].args, [
        {
          dir: './result/ss',
          type: 'jpeg',
          quality: 70,
          path: path.join('./result/ss', 'playwright-projector') + '_000.jpeg'
        }
      ])
      assert.equal(calls[1].args[0].path, path.join('./result/ss', 'playwright-projector') + '_001.jpeg')
      assert.deepEqual(options.screenshot, { dir: './result/ss', type: 'jpeg', quality: 70 })
    })
    it('シナリオの options があればコンフィグより優先する', async () => {
      const calls = []
      const options = { screenshot: { dir: './result/ss', type: 'jpeg' } }
      await plCore.execOperationPage(
        createPage(calls),
        { type: 'screenshot', options: { dir: 'other', type: 'png' } },
        options
      )
      assert.deepEqual(calls[0].args, [
        { dir: 'other', type: 'png', path: path.join('other', 'playwright-projector') + '_000.png' }
      ])
    })
    it('コンフィグに screenshot が無くても例外にならない', async () => {
      const calls = []
      await plCore.execOperationPage(createPage(calls), { type: 'screenshot' }, {})
      assert.deepEqual(calls[0].args, [{ path: path.join('./', 'playwright-projector') + '_000.jpeg' }])
    })
    it('pageIndex 指定時は現在ページのコンテキストから該当ページを保存する', async () => {
      const calls = []
      const pages = [createPage(calls, { label: 'p0' }), createPage(calls, { label: 'p1' })]
      createContext(calls, pages)
      await plCore.execOperationPage(pages[0], { type: 'screenshot', pageIndex: 1 }, { screenshot: { dir: 'd' } })
      assert.deepEqual(names(calls), ['p1.screenshot'])
    })
  })

  describe('conditions', () => {
    it('click は selectorIndex の要素をクリックし、範囲外(要素数以上)なら何もしない', async () => {
      const calls = []
      const elements = { a: [createElement(calls, 'el0'), createElement(calls, 'el1')] }
      const page = createPage(calls, { elements })
      await plCore.execOperationPage(
        page,
        { type: 'conditions', subType: 'click', selector: 'a', selectorIndex: 1 },
        {}
      )
      await plCore.execOperationPage(
        page,
        { type: 'conditions', subType: 'click', selector: 'a', selectorIndex: 2 },
        {}
      )
      await plCore.execOperationPage(
        page,
        { type: 'conditions', subType: 'click', selector: 'none', selectorIndex: 0 },
        {}
      )
      assert.deepEqual(names(calls), ['page.$$', 'el1.click', 'page.$$', 'page.$$'])
    })
    it('download はクリックと同時にダウンロードを待ち、savePath へ保存する', async () => {
      const calls = []
      const elements = { a: [createElement(calls, 'el0')] }
      const scenario = {
        type: 'conditions',
        subType: 'download',
        selector: 'a',
        selectorIndex: 0,
        savePath: 'result/a.zip'
      }
      await plCore.execOperationPage(createPage(calls, { elements }), scenario, {})
      assert.deepEqual(names(calls), ['page.$$', 'page.waitForEvent', 'el0.click', 'download.saveAs'])
      assert.deepEqual(calls[1].args, ['download'])
      assert.deepEqual(calls[3].args, ['result/a.zip'])
    })
    it('download は要素が無い・範囲外なら待機を開始しない', async () => {
      const calls = []
      const page = createPage(calls, { elements: { a: [createElement(calls, 'el0')] } })
      const base = { type: 'conditions', subType: 'download', savePath: 'x' }
      await plCore.execOperationPage(page, { ...base, selector: 'none', selectorIndex: 0 }, {})
      await plCore.execOperationPage(page, { ...base, selector: 'a', selectorIndex: 1 }, {})
      assert.deepEqual(names(calls), ['page.$$', 'page.$$'])
    })
    it('未知の subType は何もしない', async () => {
      const calls = []
      await plCore.execOperationPage(createPage(calls), { type: 'conditions', subType: 'hover', selector: 'a' }, {})
      assert.deepEqual(calls, [])
    })
  })

  describe('pageChange と操作対象ページ', () => {
    it('現在ページのコンテキストから pageIndex のページへ切り替え、前面表示し、以降の操作対象にする', async () => {
      const calls = []
      const pages = [createPage(calls, { label: 'p0' }), createPage(calls, { label: 'p1' })]
      createContext(calls, pages)
      await plCore.execOperationPage(pages[0], { type: 'pageChange', pageIndex: 1, useStack: false }, {})
      assert.equal(plCore.userPage.label, 'p1')
      // 以降は初期ページを渡しても切替後のページを操作する
      await plCore.execOperationPage(pages[0], { type: 'goto', url: 'https://example.invalid/' }, {})
      assert.deepEqual(names(calls), ['p1.bringToFront', 'p1.goto'])
    })
    it('useStack が真なら page.operator で保持した context から切り替える', async () => {
      const calls = []
      const stacked = [createPage(calls, { label: 's0' }), createPage(calls, { label: 's1' })]
      const stackedContext = createContext(calls, stacked)
      const first = createPage(calls, { label: 'first', context: createContext(calls, []) })
      first.context = () => stackedContext
      await plCore.execOperationPage(first, { type: 'page.operator', subType: 'context', isStack: true }, {})
      assert.equal(plCore.user.context, stackedContext)
      await plCore.execOperationPage(first, { type: 'pageChange', pageIndex: 0, useStack: true }, {})
      assert.equal(plCore.userPage.label, 's0')
      assert.deepEqual(names(calls), ['s0.bringToFront'])
    })
  })

  describe('page.operator', () => {
    it('args がオブジェクトなら引数として渡し、Promise を await して isStack で解決値を保持する', async () => {
      const page = createPage([])
      const received = []
      page.title = (...args) => {
        received.push(args)
        return Promise.resolve('resolved-title')
      }
      await plCore.execOperationPage(
        page,
        { type: 'page.operator', subType: 'title', args: { a: 1 }, isStack: true },
        {}
      )
      assert.deepEqual(received, [[{ a: 1 }]])
      assert.equal(plCore.user.title, 'resolved-title')
    })
    it('args がオブジェクトでなければ undefined を渡し、isStack が偽なら保持しない', async () => {
      const page = createPage([])
      const received = []
      page.reload = async (...args) => received.push(args)
      await plCore.execOperationPage(page, { type: 'page.operator', subType: 'reload', args: 'text' }, {})
      assert.deepEqual(received, [[undefined]])
      assert.equal('reload' in plCore.user, false)
    })
    it('subType が関数でない・存在しない場合は何もしない', async () => {
      const page = createPage([])
      page.notFunction = 'value'
      await plCore.execOperationPage(page, { type: 'page.operator', subType: 'notFunction', isStack: true }, {})
      await plCore.execOperationPage(page, { type: 'page.operator', subType: 'missing', isStack: true }, {})
      assert.deepEqual(plCore.user, {})
    })
  })
})
