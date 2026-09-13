// src/runPlaywright.js の単体テスト(plCore の各関数をモックへ差し替え、起動から終了までの流れを検証する)
const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')
const { freshRequire, skipTimers, captureLog } = require('./helpers/setup')

let runPlaywright
let plCore
let calls

/**
 * plCore をモックへ差し替え、呼び出し名と引数を calls へ記録する
 * @param opts { failAt: 例外を投げる関数名, failScenario: 例外を投げるシナリオ type, cleanupError: 失敗させる後始末名 }
 */
const setupCore = function (opts = {}) {
  const record = (name, args) => {
    calls.push({ name, args })
    if (opts.failAt === name) {
      throw new Error(name + ' failed')
    }
  }
  const page = {
    close: async () => {
      record('page.close', [])
      if (opts.cleanupError === 'page.close') {
        throw new Error('page.close cleanup failed')
      }
    },
    video: () => ({
      saveAs: async (...args) => {
        record('video.saveAs', args)
        if (opts.cleanupError === 'video.saveAs') {
          throw new Error('video cleanup failed')
        }
      }
    })
  }
  const context = { close: async () => record('context.close', []) }
  plCore.getArgs = (...args) => {
    record('getArgs', args)
    return ['--mock-arg']
  }
  plCore.setBrowserType = (...args) => record('setBrowserType', args)
  plCore.launchServer = async (...args) => {
    record('launchServer', args)
    return 'server'
  }
  plCore.getEndpoint = async (...args) => {
    record('getEndpoint', args)
    return 'ws://mock'
  }
  plCore.connectBrowser = async (...args) => {
    record('connectBrowser', args)
    return 'browser'
  }
  plCore.newContext = async (...args) => {
    record('newContext', args)
    return context
  }
  plCore.getOperatePage = async (...args) => {
    record('getOperatePage', args)
    return page
  }
  plCore.setPageParameter = async (...args) => record('setPageParameter', args)
  plCore.execOperationPage = async (p, scenario, options) => {
    calls.push({ name: 'exec:' + scenario.type + ':start', args: [p, scenario, options] })
    // 次のシナリオが前のシナリオの完了を待つことを確認するため、非同期に完了させる
    await new Promise((resolve) => setImmediate(resolve))
    if (opts.failScenario === scenario.type) {
      throw new Error('scenario failed')
    }
    calls.push({ name: 'exec:' + scenario.type + ':end', args: [] })
  }
  plCore.close = async (...args) => record('close', args)
  return { page, context }
}

const names = () => calls.map((c) => c.name)

beforeEach(() => {
  runPlaywright = freshRequire('/src/runPlaywright')
  plCore = reqlib('/src/core/plCore')
  calls = []
})

describe('runPlaywright.exec 正常系 (FR-04・FR-06・FR-07・FR-10)', () => {
  it('起動・シナリオの逐次実行・終了を順に行い、各関数へ設定値を渡す', async (t) => {
    const delays = skipTimers(t)
    const lines = captureLog(t)
    const { page, context } = setupCore()
    const options = {
      browserType: 'firefox',
      headless: true,
      timeout: 1234,
      slowMo: 50,
      proxyInfo: ['--proxy-server=http://proxy.invalid:8080'],
      page: { timeout: 30000 },
      video: { file: 'record-video' }
    }
    const scenarios = [{ type: 'goto' }, { type: 'wait' }]
    await runPlaywright.exec(scenarios, options)

    assert.deepEqual(names(), [
      'getArgs',
      'setBrowserType',
      'launchServer',
      'getEndpoint',
      'connectBrowser',
      'newContext',
      'getOperatePage',
      'setPageParameter',
      'exec:goto:start',
      'exec:goto:end',
      'exec:wait:start',
      'exec:wait:end',
      'page.close',
      'context.close',
      'video.saveAs',
      'close'
    ])
    const argsOf = (name) => calls.find((c) => c.name === name).args
    assert.deepEqual(argsOf('getArgs'), [options.proxyInfo])
    assert.deepEqual(argsOf('setBrowserType'), ['firefox'])
    assert.deepEqual(argsOf('launchServer'), [true, 1234, ['--mock-arg']])
    assert.deepEqual(argsOf('getEndpoint'), ['server'])
    assert.deepEqual(argsOf('connectBrowser'), ['ws://mock', 50])
    assert.deepEqual(argsOf('newContext'), ['browser', options])
    assert.deepEqual(argsOf('getOperatePage'), [context])
    assert.deepEqual(argsOf('setPageParameter'), [page, { timeout: 30000 }])
    assert.deepEqual(argsOf('exec:goto:start'), [page, scenarios[0], options])
    assert.deepEqual(argsOf('video.saveAs'), [path.join('result/videos/', 'record-video.webm')])
    assert.deepEqual(argsOf('close'), ['server'])
    // 各シナリオの後に1秒待つ
    assert.deepEqual(delays, [1000, 1000])
    assert.equal(lines[0], 'runPlaywright.exec begin')
    assert.equal(lines[lines.length - 1], 'runPlaywright.exec end')
  })

  it('シナリオ・page・video が無い場合は該当処理を行わない', async (t) => {
    const delays = skipTimers(t)
    captureLog(t)
    setupCore()
    await runPlaywright.exec([], { video: { file: '' } })
    assert.deepEqual(names(), [
      'getArgs',
      'setBrowserType',
      'launchServer',
      'getEndpoint',
      'connectBrowser',
      'newContext',
      'getOperatePage',
      'page.close',
      'context.close',
      'close'
    ])
    assert.deepEqual(delays, [])
  })

  it('引数を省略しても既定値(シナリオ・オプションとも空)で実行できる', async (t) => {
    skipTimers(t)
    captureLog(t)
    setupCore()
    await runPlaywright.exec()
    assert.deepEqual(calls.find((c) => c.name === 'getArgs').args, [undefined])
  })
})

describe('runPlaywright.exec 異常系 (FR-10)', () => {
  it('シナリオの例外時も後始末(page・context の close、動画保存、サーバー close)を行い、例外を再送出する', async (t) => {
    skipTimers(t)
    const lines = captureLog(t)
    setupCore({ failScenario: 'goto' })
    const scenarios = [{ type: 'goto' }, { type: 'wait' }]
    await assert.rejects(runPlaywright.exec(scenarios, { video: { file: 'v' } }), { message: 'scenario failed' })
    const n = names()
    assert.deepEqual(n.slice(n.indexOf('exec:goto:start')), [
      'exec:goto:start',
      'page.close',
      'context.close',
      'video.saveAs',
      'close'
    ])
    assert.equal(lines.includes('runPlaywright.exec end'), false)
  })

  it('後始末の失敗は [WARN] を出して続行し、元の例外を隠さない', async (t) => {
    skipTimers(t)
    const lines = captureLog(t)
    setupCore({ failScenario: 'goto', cleanupError: 'page.close' })
    await assert.rejects(runPlaywright.exec([{ type: 'goto' }], { video: { file: 'v' } }), {
      message: 'scenario failed'
    })
    assert.ok(names().includes('context.close'))
    assert.ok(names().includes('close'))
    assert.ok(lines.includes('[WARN] page.close failed: page.close cleanup failed'))
  })

  it('正常終了時の後始末の失敗は例外にしない', async (t) => {
    skipTimers(t)
    const lines = captureLog(t)
    setupCore({ cleanupError: 'video.saveAs' })
    await runPlaywright.exec([], { video: { file: 'v' } })
    assert.ok(lines.includes('[WARN] video.saveAs failed: video cleanup failed'))
    assert.equal(lines[lines.length - 1], 'runPlaywright.exec end')
  })

  it('ブラウザ接続前後の例外ではページ・コンテキストの後始末をせず、サーバーのみ閉じる', async (t) => {
    skipTimers(t)
    captureLog(t)
    setupCore({ failAt: 'connectBrowser' })
    await assert.rejects(runPlaywright.exec([{ type: 'goto' }], { video: { file: 'v' } }), {
      message: 'connectBrowser failed'
    })
    assert.deepEqual(names().slice(-2), ['connectBrowser', 'close'])
  })

  it('launchServer の例外はそのまま送出する(閉じる対象が無い)', async (t) => {
    skipTimers(t)
    captureLog(t)
    setupCore({ failAt: 'launchServer' })
    await assert.rejects(runPlaywright.exec([], {}), { message: 'launchServer failed' })
    assert.equal(names().includes('close'), false)
  })
})
