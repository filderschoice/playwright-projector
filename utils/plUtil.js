const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const yaml = require('js-yaml')
const plUtil = {}

plUtil.isNotEmpty = function (target) {
  return !plUtil.isEmpty(target)
}

plUtil.isEmpty = function (target) {
  // default: false
  var ret = false
  if (typeof target === 'undefined' || target === null) {
    // empty: true
    ret = true
  } else {
    // check class
    var className = Object.prototype.toString.call(target)
    var matches = className.match(/^\[object\s(.*)\]$/)
    if (matches.length > 0) {
      switch (matches[1]) {
        case 'String':
          ret = !target && target.length === 0
          break
        case 'Number':
          ret = Number.isNaN(target)
          break
        case 'Array':
          ret = target.length === 0
          break
        case 'Boolean':
          ret = !target
          break
        case 'Object':
          ret = Object.keys(target).length === 0
          break
        default:
          // Other: false
          ret = false
          break
      }
    } else {
      // CheckError: true
      ret = true
    }
  }
  return ret
}

plUtil.logInfo = function (...params) {
  // Output Log
  plUtil.logOutput(0, params)
}
plUtil.logDebug = function (...params) {
  // Output Log
  plUtil.logOutput(1, params)
}
plUtil.logOutput = function (logType = 0, ...params) {
  let logMsg = ''
  if (logType > 0) {
    // add date
    let date = new Date()
    logMsg += date.toLocaleString('ja')
    logMsg += ' - '
  }

  // add param message
  let tmpMsg = ''
  if (Array.isArray(params) && this.isNotEmpty(params) && this.isNotEmpty(params[0])) {
    for (const param of params[0]) {
      if (plUtil.isEmpty(tmpMsg)) {
        if (typeof param === 'object') {
          tmpMsg = JSON.stringify(param)
        } else {
          tmpMsg = param
        }
      } else if (typeof param === 'object') {
        tmpMsg = tmpMsg + ', ' + JSON.stringify(param)
      } else {
        tmpMsg = tmpMsg + ', ' + param
      }
    }
  }
  // add log message
  logMsg += tmpMsg

  // output log
  console.log(logMsg)
}

plUtil.replaceFilePath2Unix = function (filePath) {
  // change separator Unix(/)
  return filePath.split(path.sep).join('/')
}

plUtil.readFileSync = function (filePath, type = 'json', option = {}) {
  let ret = option
  if (!filePath) {
    // cannot read file: option
    return ret
  }
  if (fs.existsSync(filePath)) {
    ret = fs.readFileSync(filePath, 'utf-8')
    try {
      if (type === 'json') {
        // read json file: JSON parse
        ret = JSON.parse(ret)
      } else if (type === 'yaml') {
        // read yaml file: YAML2JSON
        ret = JSON.stringify(yaml.load(ret))
        // JSON parse
        ret = JSON.parse(ret)
      } else {
        // other: option
      }
    } catch (e) {
      console.log(e)
    }
  }
  return ret
}

plUtil.writeFileSync = function (filePath, fileData) {
  // write File
  fs.writeFileSync(filePath, fileData)
}

plUtil.unlinkSync = function (filePath) {
  if (fs.existsSync(filePath)) {
    // exist file: unlink
    fs.unlinkSync(filePath)
  }
}

plUtil.mkdirSync = function (dirPath) {
  if (!fs.existsSync(dirPath)) {
    // Not exist dir: make dir
    mkdirp.sync(dirPath)
  }
}

plUtil.readdirSync = function (dirPath, nestNum = 99) {
  let results = []
  // chk dir
  this.mkdirSync(dirPath)
  // read file in dir
  let list = fs.readdirSync(dirPath)
  list.forEach((file) => {
    file = path.resolve(dirPath, file)
    let stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      // decrease search nest number
      nestNum--
      if (nestNum > 0) {
        // recursion: read sub dir
        results = results.concat(plUtil.readdirSync(file, nestNum))
      } else {
        // save file path
        results.push(file)
      }
    } else {
      // save file path
      results.push(file)
    }
  })

  return results
}

plUtil.rmdirRecursiveDir = function (targetPath) {
  if (!targetPath) {
    // not set filepath: return
    return
  }
  if (fs.existsSync(targetPath)) {
    fs.readdirSync(targetPath).forEach((file) => {
      var curPath = targetPath + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        // dir: recursion func call
        plUtil.rmdirRecursiveDir(curPath)
      } else {
        // file: unlink
        fs.unlinkSync(curPath)
      }
    })
    // all file unlink: rmdir
    fs.rmdirSync(targetPath)
  }
}

plUtil.pathJoin = function (rootDir = './', filePath = '') {
  // path.join
  return path.join(rootDir, filePath)
}

plUtil.pathBasename = function (filePath) {
  // path.basename
  return path.basename(filePath)
}

plUtil.pathRelative = function (targetPath, rootPath = '.') {
  // path.relative
  return path.relative(rootPath, targetPath)
}

plUtil.getTargetKeyPath = function (targetPath, targetKey = null) {
  let result = []
  // split filepath by separator
  let wkPath = targetPath.split(path.sep)
  for (const pathStr of wkPath) {
    // save nest path
    result.push(pathStr)
    if (targetKey && pathStr === targetKey) {
      break
    }
  }
  // join nest path by separator
  return result.join(path.sep)
}

module.exports = plUtil
