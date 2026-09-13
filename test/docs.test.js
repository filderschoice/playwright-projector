// 実装と README・サンプルの整合テスト
// 共通規約「シナリオ種別・設定キーを追加・変更したら両 README の表と conf/*.sample.yaml を同時に更新する」の更新漏れを検出する
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const { rootDir, freshRequire } = require('./helpers/setup')

const plUtil = freshRequire('/src/utils/plUtil')

// サンプルに意図的に含める未知の種別(黙って無視される挙動の例)
const IGNORED_SAMPLE_TYPES = ['dummy']

const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8')

/**
 * plCore.execOperationPage の switch から case ラベルを取得する
 * @param indent case 行のインデント(シナリオ種別は4、conditions の subType は8)
 * @param from 抽出開始の目印
 * @param to 抽出終了の目印
 */
const caseLabels = function (indent, from, to) {
  const src = read('src/core/plCore.js')
  const start = src.indexOf(from)
  const end = src.indexOf(to, start + from.length)
  assert.ok(start >= 0 && end > start, 'plCore.js の抽出範囲が見つからない: ' + from)
  const re = new RegExp('^' + ' '.repeat(indent) + "case '([^']+)':", 'gm')
  return [...src.slice(start, end).matchAll(re)].map((m) => m[1]).sort()
}

/**
 * README の表から、指定した見出しで始まる表の1列目を取得する
 * @param rel README のパス
 * @param header 1列目の見出し
 */
const tableFirstColumn = function (rel, header) {
  const lines = read(rel).split(/\r?\n/)
  const start = lines.findIndex((l) => new RegExp('^\\|\\s*' + header + '\\s*\\|').test(l))
  assert.ok(start >= 0, rel + ' に表「' + header + '」が見つからない')
  const values = []
  // 見出し行と区切り行の次から、表が終わるまで
  for (let i = start + 2; i < lines.length && lines[i].startsWith('|'); i++) {
    values.push(lines[i].split('|')[1].trim())
  }
  return values.sort()
}

/**
 * 設定オブジェクトのキーを「親.子」形式で平坦化する(値が空でないオブジェクトのみ展開する)
 * @param obj 設定オブジェクト
 * @param prefix 親キー
 */
const flattenKeys = function (obj, prefix = '') {
  return Object.entries(obj)
    .flatMap(([key, value]) =>
      plUtil.isObject(value) && plUtil.isNotEmpty(value) ? flattenKeys(value, prefix + key + '.') : [prefix + key]
    )
    .sort()
}

const scenarioTypes = caseLabels(4, 'PlaywrightCores.execOperationPage', 'module.exports')
const conditionSubTypes = caseLabels(8, "case 'conditions':", "case 'goto':")

describe('シナリオ種別の整合', () => {
  it('実装のシナリオ種別を取得できる', () => {
    assert.ok(scenarioTypes.includes('goto'), JSON.stringify(scenarioTypes))
  })

  for (const readme of ['README_ja.md', 'README.md']) {
    it(readme + ' の Scenario Type 表が実装の種別と一致する', () => {
      assert.deepEqual(tableFirstColumn(readme, 'Scenario Type'), scenarioTypes)
    })
    it(readme + ' に conditions の subType(' + conditionSubTypes.join('/') + ')がすべて記載されている', () => {
      const row = read(readme)
        .split(/\r?\n/)
        .find((l) => /^\|\s*conditions\s*\|/.test(l))
      for (const subType of conditionSubTypes) {
        assert.ok(row.includes('`' + subType + '`'), readme + ' の conditions 行に ' + subType + ' が無い')
      }
    })
  }

  it('サンプルシナリオの種別は実装済み、または意図的な未知種別(許容リスト)のみ', () => {
    const { data } = plUtil.readYamlFile(path.join(rootDir, 'conf/plScenarios.sample.yaml'))
    for (const scenario of data) {
      assert.ok(
        scenarioTypes.includes(scenario.type) || IGNORED_SAMPLE_TYPES.includes(scenario.type),
        'サンプルの未対応種別: ' + scenario.type
      )
      if (scenario.type === 'conditions') {
        assert.ok(conditionSubTypes.includes(scenario.subType), 'サンプルの未対応 subType: ' + scenario.subType)
      }
    }
  })

  it('許容リストの未知種別は実装されていない(実装したら許容リストから外す)', () => {
    for (const type of IGNORED_SAMPLE_TYPES) {
      assert.equal(scenarioTypes.includes(type), false)
    }
  })
})

describe('サンプルファイルと設定キーの整合', () => {
  it('サンプル3ファイルが index.js の期待する形(シナリオは配列、コンフィグ・Auth はマッピング)で読み込める', () => {
    const scenarios = plUtil.readYamlFile(path.join(rootDir, 'conf/plScenarios.sample.yaml'))
    const config = plUtil.readYamlFile(path.join(rootDir, 'conf/plConfig.sample.yaml'))
    const auth = plUtil.readYamlFile(path.join(rootDir, 'conf/auth/plAuth.sample.yaml'))
    for (const r of [scenarios, config, auth]) {
      assert.equal(r.error, undefined)
    }
    assert.ok(Array.isArray(scenarios.data) && scenarios.data.length > 0)
    assert.equal(plUtil.isObject(config.data), true)
    assert.equal(plUtil.isObject(auth.data), true)
  })

  for (const [readme, header] of [
    ['README_ja.md', 'パラメータ'],
    ['README.md', 'Parameter']
  ]) {
    it(readme + ' のパラメータ表がサンプルコンフィグのキーと一致する', () => {
      const { data } = plUtil.readYamlFile(path.join(rootDir, 'conf/plConfig.sample.yaml'))
      assert.deepEqual(tableFirstColumn(readme, header), flattenKeys(data))
    })
  }
})
