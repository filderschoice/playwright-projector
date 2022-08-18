// Playwright実行
const runPl = require('./runPlaywright')
// 共通関数
const plUtil = require('./utils/plUtil')

// Config Read
const plScenarios = plUtil.readFileSync('./conf/plScenarios.yaml', 'yaml')
const plOption = plUtil.readFileSync('./conf/plConfig.yaml', 'yaml')

// main関数
const main = async function() {
  await runPl.exec(plScenarios, plOption)
}

// 処理開始
main()
