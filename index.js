// require
global.reqlib = require('app-root-path').require
const cmd = require('commander')
// require by app-root-path
const runPl = reqlib('/src/runPlaywright')
const plUtil = reqlib('/src/utils/plUtil')
const pkg = reqlib('/package.json')

// cli args
cmd
  .version(pkg.version)
  .option('-a, --auth <authFile>', 'Use playwright-projector Auth File', './conf/auth/plAuth.yaml')
  .option('-c, --config <configFile>', 'Use playwright-projector Config File', './conf/plConfig.yaml')
  .option('-s, --scenario <scenarioFile>', 'Use playwright-projector Scenarios File', './conf/plScenarios.yaml')
  .parse(process.argv)
const option = cmd.opts()

plUtil.logInfo('playwright-projector start')
plUtil.logInfo('  - config: ' + option.config)
plUtil.logInfo('  - auth: ' + option.auth)
plUtil.logInfo('  - scenario: ' + option.scenario)
// Scenario Read
const plScenarios = plUtil.readFileSync(option.scenario, 'yaml')
// Config Read
const plConfig = plUtil.readFileSync(option.config, 'yaml')
// Auth Read
const plAuth = plUtil.readFileSync(option.auth, 'yaml')
// Option Merge
const plOption = { ...plConfig, ...plAuth }

// main
const main = async function () {
  await runPl.exec(plScenarios, plOption)
}

// exec main
main()
