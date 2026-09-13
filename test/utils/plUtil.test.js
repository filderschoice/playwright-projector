// src/utils/plUtil.js の単体テスト
// 対象は実行経路で使う関数のみ(未使用関数は BL-014 で削除判断待ちのため対象外)
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const { freshRequire, makeTempDir, captureLog } = require('../helpers/setup')

const plUtil = freshRequire('/src/utils/plUtil')

describe('plUtil.isEmpty / isNotEmpty', () => {
  const cases = [
    ['undefined', undefined, true],
    ['null', null, true],
    ['空文字', '', true],
    ['文字列', 'a', false],
    ['NaN', NaN, true],
    ['0', 0, false],
    ['数値', 1, false],
    ['空配列', [], true],
    ['配列', [1], false],
    ['false', false, true],
    ['true', true, false],
    ['空オブジェクト', {}, true],
    ['オブジェクト', { a: 1 }, false],
    ['関数', () => {}, false]
  ]
  for (const [label, value, expected] of cases) {
    it(label + ' は isEmpty=' + expected, () => {
      assert.equal(plUtil.isEmpty(value), expected)
      assert.equal(plUtil.isNotEmpty(value), !expected)
    })
  }
})

describe('plUtil.isFunction / isObject', () => {
  it('通常関数と async 関数を関数と判定する', () => {
    assert.equal(
      plUtil.isFunction(function () {}),
      true
    )
    assert.equal(
      plUtil.isFunction(async () => {}),
      true
    )
    assert.equal(plUtil.isFunction({}), false)
    assert.equal(plUtil.isFunction(undefined), false)
  })
  it('プレーンオブジェクトのみをオブジェクトと判定する', () => {
    assert.equal(plUtil.isObject({}), true)
    assert.equal(plUtil.isObject([]), false)
    assert.equal(plUtil.isObject(null), false)
    assert.equal(plUtil.isObject('a'), false)
  })
})

describe('plUtil.logInfo / logDebug', () => {
  it('logInfo は引数をカンマ区切りで出力し、オブジェクトは JSON にする', (t) => {
    const lines = captureLog(t)
    plUtil.logInfo('a', { b: 1 }, 2)
    assert.deepEqual(lines, ['a, {"b":1}, 2'])
  })
  it('logInfo の先頭がオブジェクトでも JSON にする', (t) => {
    const lines = captureLog(t)
    plUtil.logInfo({ type: 'goto' })
    assert.deepEqual(lines, ['{"type":"goto"}'])
  })
  it('logDebug は日時と区切り「 - 」を前置する', (t) => {
    const lines = captureLog(t)
    plUtil.logDebug({ type: 'wait' })
    assert.equal(lines.length, 1)
    assert.match(lines[0], /^.+ - \{"type":"wait"\}$/)
  })
})

describe('plUtil.readYamlFile', () => {
  it('ファイルが無い場合は exists=false で data・error は undefined', (t) => {
    const dir = makeTempDir(t)
    assert.deepEqual(plUtil.readYamlFile(path.join(dir, 'none.yaml')), {
      exists: false,
      data: undefined,
      error: undefined
    })
    assert.equal(plUtil.readYamlFile(undefined).exists, false)
  })
  it('空ファイルは exists=true で data は undefined', (t) => {
    const file = path.join(makeTempDir(t), 'empty.yaml')
    fs.writeFileSync(file, '')
    const result = plUtil.readYamlFile(file)
    assert.equal(result.exists, true)
    assert.equal(result.data, undefined)
    assert.equal(result.error, undefined)
  })
  it('正常な YAML を JSON 互換の値として返す', (t) => {
    const file = path.join(makeTempDir(t), 'ok.yaml')
    fs.writeFileSync(file, "- type: 'goto'\n  url: 'https://example.invalid/'\n- type: wait\n  time: 10\n")
    const result = plUtil.readYamlFile(file)
    assert.equal(result.error, undefined)
    assert.deepEqual(result.data, [
      { type: 'goto', url: 'https://example.invalid/' },
      { type: 'wait', time: 10 }
    ])
  })
  it('構文誤りは error を返し data は undefined', (t) => {
    const file = path.join(makeTempDir(t), 'broken.yaml')
    fs.writeFileSync(file, 'auth:\n  username: dummy\n password: [\n')
    const result = plUtil.readYamlFile(file)
    assert.equal(result.exists, true)
    assert.equal(result.data, undefined)
    assert.ok(result.error)
  })
})

describe('plUtil.formatParseError', () => {
  it('YAML の構文誤りは理由と行・列のみを返し、ファイル内容を含めない', (t) => {
    const file = path.join(makeTempDir(t), 'broken.yaml')
    fs.writeFileSync(file, 'auth:\n  username: dummy-user\n password: [dummy-secret\n')
    const { error } = plUtil.readYamlFile(file)
    const msg = plUtil.formatParseError(error)
    assert.match(msg, /\(line \d+, column \d+\)$/)
    assert.doesNotMatch(msg, /dummy-secret|dummy-user/)
  })
  it('mark の無いエラーは名前、エラーが無い場合は既定文言を返す', () => {
    assert.equal(plUtil.formatParseError(new SyntaxError('secret text')), 'SyntaxError')
    assert.equal(plUtil.formatParseError(undefined), 'parse error')
  })
})

describe('plUtil.readFileSync', () => {
  it('ファイルが無い場合は既定値を返す', (t) => {
    const dir = makeTempDir(t)
    assert.deepEqual(plUtil.readFileSync(path.join(dir, 'none.json'), 'json', { d: 1 }), { d: 1 })
  })
  it('yaml は読み込んだ値を、空ファイルは既定値を返す', (t) => {
    const dir = makeTempDir(t)
    const ok = path.join(dir, 'ok.yaml')
    const empty = path.join(dir, 'empty.yaml')
    fs.writeFileSync(ok, 'a: 1\n')
    fs.writeFileSync(empty, '')
    assert.deepEqual(plUtil.readFileSync(ok, 'yaml'), { a: 1 })
    assert.deepEqual(plUtil.readFileSync(empty, 'yaml', { d: 1 }), { d: 1 })
  })
  it('yaml の構文誤りは既定値を返し、ファイル内容を出力しない', (t) => {
    const lines = captureLog(t)
    const file = path.join(makeTempDir(t), 'broken.yaml')
    fs.writeFileSync(file, 'a:\n  b: dummy-secret\n c: [\n')
    assert.deepEqual(plUtil.readFileSync(file, 'yaml', { d: 1 }), { d: 1 })
    assert.equal(lines.length, 1)
    assert.doesNotMatch(lines[0], /dummy-secret/)
  })
  it('json は解析結果を、構文誤りは既定値を返す', (t) => {
    captureLog(t)
    const dir = makeTempDir(t)
    const ok = path.join(dir, 'ok.json')
    const broken = path.join(dir, 'broken.json')
    fs.writeFileSync(ok, '{"a":1}')
    fs.writeFileSync(broken, '{"a":')
    assert.deepEqual(plUtil.readFileSync(ok), { a: 1 })
    assert.deepEqual(plUtil.readFileSync(broken, 'json', { d: 1 }), { d: 1 })
  })
  it('json・yaml 以外は文字列をそのまま返す', (t) => {
    const file = path.join(makeTempDir(t), 'a.txt')
    fs.writeFileSync(file, 'text')
    assert.equal(plUtil.readFileSync(file, 'text'), 'text')
  })
})

describe('plUtil.pathJoin', () => {
  it('path.join と同じ結果を返す', () => {
    assert.equal(plUtil.pathJoin('result/videos/', 'a.webm'), path.join('result/videos/', 'a.webm'))
    assert.equal(plUtil.pathJoin(undefined, 'a'), path.join('./', 'a'))
  })
})
