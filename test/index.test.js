// index.js(CLI)の単体テスト
// runPlaywright をスタブへ差し替えた子プロセスを一時ディレクトリで実行する
// (リポジトリの conf/ 配下の実ファイルは読まない。設定値はすべてダミー)
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const { rootDir, makeTempDir } = require('./helpers/setup')

const indexJs = path.join(rootDir, 'index.js')
const stubRun = path.join(__dirname, 'helpers', 'stub-run.js')

const SCENARIOS = "- type: 'goto'\n  url: 'https://example.invalid/'\n- type: 'wait'\n  time: 10\n"
const CONFIG = "headless: true\nlocale: 'ja-JP'\nauth:\n  username: 'config-user'\n  password: 'config-pass'\n"
const AUTH = "auth:\n  username: 'dummy-user'\n  password: 'dummy-pass'\nheadless: false\n"

/**
 * 一時ディレクトリへファイルを配置する
 * @param dir 一時ディレクトリ
 * @param files { 相対パス: 内容 }
 */
const writeFiles = function (dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(dir, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
}

/**
 * CLI を実行する
 * @param t テストコンテキスト
 * @param files 配置するファイル
 * @param args CLI 引数
 * @param env 追加の環境変数
 * @returns { status, stdout, stderr, lines, exec } exec はスタブが受け取った値(呼ばれなければ undefined)
 */
const runCli = function (t, files, args = [], env = {}) {
  const cwd = makeTempDir(t)
  writeFiles(cwd, files)
  const result = spawnSync(process.execPath, ['-r', stubRun, indexJs, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    timeout: 30000
  })
  const lines = result.stdout.split(/\r?\n/).filter((l) => l !== '')
  const execLine = lines.find((l) => l.startsWith('STUB_EXEC '))
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    lines,
    exec: execLine ? JSON.parse(execLine.slice('STUB_EXEC '.length)) : undefined
  }
}

const defaultFiles = {
  'conf/plScenarios.yaml': SCENARIOS,
  'conf/plConfig.yaml': CONFIG,
  'conf/auth/plAuth.yaml': AUTH
}

describe('index.js 引数と既定パス (FR-01)', () => {
  it('引数なしで conf/ 配下の既定ファイルを読み、読込先をログに出す', (t) => {
    const r = runCli(t, defaultFiles)
    assert.equal(r.status, 0, r.stdout + r.stderr)
    assert.deepEqual(r.lines.slice(0, 4), [
      'playwright-projector start',
      '  - config: ./conf/plConfig.yaml',
      '  - auth: ./conf/auth/plAuth.yaml',
      '  - scenario: ./conf/plScenarios.yaml'
    ])
    assert.deepEqual(r.exec.scenarios, [
      { type: 'goto', url: 'https://example.invalid/' },
      { type: 'wait', time: 10 }
    ])
  })

  it('-c / -s / -a と --config / --scenario / --auth で読込先を指定できる', (t) => {
    const files = { 'x/s.yaml': SCENARIOS, 'x/c.yaml': 'locale: en-US\n', 'x/a.yaml': AUTH }
    for (const args of [
      ['-c', 'x/c.yaml', '-s', 'x/s.yaml', '-a', 'x/a.yaml'],
      ['--config', 'x/c.yaml', '--scenario', 'x/s.yaml', '--auth', 'x/a.yaml']
    ]) {
      const r = runCli(t, files, args)
      assert.equal(r.status, 0, r.stdout + r.stderr)
      assert.equal(r.exec.options.locale, 'en-US')
      assert.equal(r.exec.scenarios.length, 2)
    }
  })

  it('--version は package.json の version を出力する', (t) => {
    const r = runCli(t, {}, ['--version'])
    assert.equal(r.status, 0)
    assert.equal(r.stdout.trim(), require(path.join(rootDir, 'package.json')).version)
    assert.equal(r.exec, undefined)
  })
})

describe('index.js 設定のマージ (FR-02)', () => {
  it('コンフィグと Auth を浅くマージし、同じキーは Auth を優先する', (t) => {
    const r = runCli(t, defaultFiles)
    assert.equal(r.status, 0, r.stdout + r.stderr)
    assert.deepEqual(r.exec.options, {
      headless: false,
      locale: 'ja-JP',
      auth: { username: 'dummy-user', password: 'dummy-pass' }
    })
  })
})

describe('index.js 読込失敗時の扱い (FR-03)', () => {
  it('コンフィグが無い場合は [WARN] を出して既定値で継続する', (t) => {
    const r = runCli(t, { 'conf/plScenarios.yaml': SCENARIOS })
    assert.equal(r.status, 0, r.stdout + r.stderr)
    assert.ok(r.lines.includes('[WARN] config file is not found: ./conf/plConfig.yaml'))
    assert.deepEqual(r.exec.options, {})
  })

  it('Auth が無い・空の場合は出力なしで継続する', (t) => {
    for (const files of [
      { 'conf/plScenarios.yaml': SCENARIOS, 'conf/plConfig.yaml': CONFIG },
      { 'conf/plScenarios.yaml': SCENARIOS, 'conf/plConfig.yaml': CONFIG, 'conf/auth/plAuth.yaml': '' }
    ]) {
      const r = runCli(t, files)
      assert.equal(r.status, 0, r.stdout + r.stderr)
      assert.equal(
        r.lines.some((l) => l.startsWith('[')),
        false
      )
      assert.equal(r.exec.options.auth.username, 'config-user')
    }
  })

  const failureCases = [
    ['シナリオが無い', {}, '[ERROR] scenario file is not found or empty: ./conf/plScenarios.yaml'],
    [
      'シナリオが空',
      { 'conf/plScenarios.yaml': '' },
      '[ERROR] scenario file is not found or empty: ./conf/plScenarios.yaml'
    ],
    [
      'シナリオが配列でない',
      { 'conf/plScenarios.yaml': 'type: goto\n' },
      '[ERROR] scenario file must be a YAML array: ./conf/plScenarios.yaml'
    ],
    [
      'シナリオの構文誤り',
      { 'conf/plScenarios.yaml': '- type: [goto\n' },
      '[ERROR] scenario file cannot be parsed: ./conf/plScenarios.yaml'
    ],
    [
      'コンフィグの構文誤り',
      { 'conf/plScenarios.yaml': SCENARIOS, 'conf/plConfig.yaml': 'a:\n  b: 1\n c: [\n' },
      '[ERROR] config file cannot be parsed: ./conf/plConfig.yaml'
    ],
    [
      'コンフィグがマッピングでない',
      { 'conf/plScenarios.yaml': SCENARIOS, 'conf/plConfig.yaml': '- a\n' },
      '[ERROR] config file must be a YAML object: ./conf/plConfig.yaml'
    ],
    [
      'Auth がマッピングでない',
      { 'conf/plScenarios.yaml': SCENARIOS, 'conf/auth/plAuth.yaml': 'just-text\n' },
      '[ERROR] auth file must be a YAML object: ./conf/auth/plAuth.yaml'
    ]
  ]
  for (const [label, files, message] of failureCases) {
    it(label + '場合はエラーを出し、ブラウザを起動せず終了コード1', (t) => {
      const r = runCli(t, files)
      assert.equal(r.status, 1, r.stdout + r.stderr)
      assert.ok(r.lines.includes(message), r.stdout)
      assert.equal(r.exec, undefined)
    })
  }

  it('Auth の構文誤りは理由と行・列のみを出し、ファイル内容(資格情報)を出力しない', (t) => {
    const r = runCli(t, {
      'conf/plScenarios.yaml': SCENARIOS,
      'conf/auth/plAuth.yaml': "auth:\n  username: 'dummy-user'\n password: [dummy-secret\n"
    })
    assert.equal(r.status, 1)
    assert.ok(r.lines.includes('[ERROR] auth file cannot be parsed: ./conf/auth/plAuth.yaml'))
    assert.match(
      r.lines[r.lines.indexOf('[ERROR] auth file cannot be parsed: ./conf/auth/plAuth.yaml') + 1],
      /\(line \d+, column \d+\)$/
    )
    assert.doesNotMatch(r.stdout + r.stderr, /dummy-secret|dummy-user/)
    assert.equal(r.exec, undefined)
  })
})

describe('index.js 実行時例外 (FR-10)', () => {
  it('exec の例外はエラーとスタックを出力して終了コード1', (t) => {
    const r = runCli(t, defaultFiles, [], { PL_TEST_STUB_MODE: 'throw' })
    assert.equal(r.status, 1)
    assert.ok(r.lines.includes('[ERROR] playwright-projector failed'))
    assert.ok(r.lines.some((l) => l.startsWith('Error: stub runtime error')))
  })
})
