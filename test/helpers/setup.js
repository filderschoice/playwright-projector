// 単体テスト共通ヘルパー
// src/ 配下は index.js が定義する global.reqlib で相互参照するため、テストでも先に定義する
const path = require('path')
const fs = require('fs')
const os = require('os')

const rootDir = path.resolve(__dirname, '..', '..')
if (typeof global.reqlib !== 'function') {
  global.reqlib = require('app-root-path').require
}

/**
 * src/ 配下のモジュールをキャッシュから外して読み込み直す
 * (plCore などはモジュールスコープに状態を持つため、テストごとに初期状態から始める)
 * @param modulePath ルートからのパス(例 '/src/core/plCore')
 * @returns module
 */
const freshRequire = function (modulePath) {
  const srcDir = path.join(rootDir, 'src') + path.sep
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(srcDir)) {
      delete require.cache[key]
    }
  }
  return reqlib(modulePath)
}

/**
 * テスト用の一時ディレクトリを作成する
 * @param t node:test のテストコンテキスト(終了時に削除する)
 * @returns directory path
 */
const makeTempDir = function (t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pl-projector-test-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  return dir
}

/**
 * setTimeout を即時実行へ差し替える(固定待機を含む処理のテスト時間を短縮する)
 * @param t node:test のテストコンテキスト(終了時に元へ戻る)
 * @returns 呼ばれた待機時間(ms)の配列
 */
const skipTimers = function (t) {
  const delays = []
  t.mock.method(global, 'setTimeout', (fn, ms) => {
    delays.push(ms)
    fn()
    return 0
  })
  return delays
}

/**
 * console.log の出力を取得する
 * @param t node:test のテストコンテキスト(終了時に元へ戻る)
 * @returns 出力行の配列
 */
const captureLog = function (t) {
  const lines = []
  t.mock.method(console, 'log', (...args) => {
    lines.push(args.join(' '))
  })
  return lines
}

module.exports = { rootDir, freshRequire, makeTempDir, skipTimers, captureLog }
