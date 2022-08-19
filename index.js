// Run Playwright
const runPl = require('./runPlaywright')
// Util
const plUtil = require('./utils/plUtil')

// Scenario Read
const plScenarios = plUtil.readFileSync('./conf/plScenarios.yaml', 'yaml')
// Config Read
const plOption = plUtil.readFileSync('./conf/plConfig.yaml', 'yaml')

// main
const main = async function () {
  await runPl.exec(plScenarios, plOption)
}

// exec main
main()
