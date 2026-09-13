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

/**
 * Load YAML file
 * @param filePath File Path
 * @param label File Label(for log)
 * @param expect Expected data type('array'/'object')
 * @param required true: missing file is an error
 * @returns data (undefined: load error)
 */
const loadYaml = function (filePath, label, expect, required) {
  const result = plUtil.readYamlFile(filePath)
  if (result.error) {
    // parse error (file contents are not logged)
    plUtil.logInfo('[ERROR] ' + label + ' file cannot be parsed: ' + filePath)
    plUtil.logInfo('  - ' + plUtil.formatParseError(result.error))
    return undefined
  }
  if (result.data === undefined) {
    if (required) {
      // missing or empty required file
      plUtil.logInfo('[ERROR] ' + label + ' file is not found or empty: ' + filePath)
      return undefined
    }
    if (!result.exists && label === 'config') {
      // missing config: continue with default values
      plUtil.logInfo('[WARN] ' + label + ' file is not found: ' + filePath)
    }
    return expect === 'array' ? [] : {}
  }
  const isValid = expect === 'array' ? Array.isArray(result.data) : plUtil.isObject(result.data)
  if (!isValid) {
    plUtil.logInfo('[ERROR] ' + label + ' file must be a YAML ' + expect + ': ' + filePath)
    return undefined
  }
  return result.data
}

plUtil.logInfo('playwright-projector start')
plUtil.logInfo('  - config: ' + option.config)
plUtil.logInfo('  - auth: ' + option.auth)
plUtil.logInfo('  - scenario: ' + option.scenario)
// Scenario Read
const plScenarios = loadYaml(option.scenario, 'scenario', 'array', true)
// Config Read
const plConfig = loadYaml(option.config, 'config', 'object', false)
// Auth Read
const plAuth = loadYaml(option.auth, 'auth', 'object', false)

// main
const main = async function () {
  if (plScenarios === undefined || plConfig === undefined || plAuth === undefined) {
    // load error: exit without launching browser
    process.exitCode = 1
    return
  }
  // Option Merge
  const plOption = { ...plConfig, ...plAuth }
  await runPl.exec(plScenarios, plOption)
}

// exec main
main()
