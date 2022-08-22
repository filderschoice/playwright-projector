const runPl = require('./runPlaywright')
const plUtil = require('./utils/plUtil')
const cmd = require('commander')
const pkg = require('./package.json')

// cli args
cmd
  .version(pkg.version)
  .option('-c, --config <configFile>', 'Use pl-projector Config File', './conf/plConfig.yaml')
  .option('-s, --scenario <scenarioFile>', 'Use pl-projector Scenarios File', './conf/plScenarios.yaml')
  .parse(process.argv)
const option = cmd.opts()

plUtil.logInfo('pl-projector start')
plUtil.logInfo('  - config: ' + option.config)
plUtil.logInfo('  - scenario: ' + option.scenario)
// Scenario Read
const plScenarios = plUtil.readFileSync(option.scenario, 'yaml')
// Config Read
const plOption = plUtil.readFileSync(option.config, 'yaml')

// main
const main = async function () {
  await runPl.exec(plScenarios, plOption)
}

// exec main
main()
