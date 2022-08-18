const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const yaml = require('js-yaml')

// 共通関数
const plUtil = {}

/**
 * 設定値判定
 * @param target 検査対象
 * @returns 判定結果
 */
plUtil.isNotEmpty = function (target) {
  return !plUtil.isEmpty(target)
}

/**
 * 空値判定
 * @param target 検査対象
 * @returns 判定結果
 */
plUtil.isEmpty = function (target) {
  // 初期値は空値以外
  var ret = false
  if (typeof target === 'undefined' || target === null) {
    // 空値
    ret = true
  } else {
    // その他有効クラス判定
    var className = Object.prototype.toString.call(target)
    var matches = className.match(/^\[object\s(.*)\]$/)
    if (matches.length > 0) {
      switch (matches[1]) {
        case 'String': // 文字列
          ret = !target && target.length === 0
          break
        case 'Number': // 数値
          ret = Number.isNaN(target)
          break
        case 'Array': // 配列
          ret = target.length === 0
          break
        case 'Boolean': // Boolean
          ret = !target
          break
        case 'Object': // オブジェクト
          ret = Object.keys(target).length === 0
          break
        default:
          // その他型は全て空値以外
          ret = false
          break
      }
    } else {
      // 判定不能のため、空値
      ret = true
    }
  }
  return ret
}

/**
 * ログ出力処理（日付なし）
 * @param params 可変長引数
 */
plUtil.logInfo = function (...params) {
  // ログ出力処理
  plUtil.logOutput(0, params)
}

/**
 * ログ出力処理（日付あり）
 * @param params 可変長引数
 */
plUtil.logDebug = function (...params) {
  // ログ出力処理
  plUtil.logOutput(1, params)
}

/**
 * ログ出力処理
 * @param logType ログ種別(0: 標準出力, 1: 出力日時＋標準出力)
 * @param params 可変長引数
 */
plUtil.logOutput = function (logType = 0, ...params) {
  let logMsg = ''
  if (logType > 0) {
    // 出力日時付与
    let date = new Date()
    logMsg += date.toLocaleString('ja')
    logMsg += ' - '
  }

  // paramsデータ付与
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
  // ログメッセージ整形
  logMsg += tmpMsg

  // ログ出力
  console.log(logMsg)
}

/**
 * ファイルパス置換(Unixパス変換)
 * @param filePath 対象ファイルパス
 * @returns 変換後ファイルパス
 */
plUtil.replaceFilePath2Unix = function (filePath) {
  return filePath.split(path.sep).join('/')
}

/**
 * ファイル読込
 * @param filePath 削除対象パス
 * @param type 対象ファイル読込初期値
 * @param option 対象ファイル読込初期値
 * @returns ファイル読込結果
 */
plUtil.readFileSync = function (filePath, type = 'json', option = {}) {
  ret = option
  if (!filePath) {
    // path未指定時は処理なし
    return ret
  }
  if (fs.existsSync(filePath)) {
    ret = fs.readFileSync(filePath, 'utf-8')
    if (type === 'json') {
      // jsonデータの場合、parseを実行
      ret = JSON.parse(ret)
    } else if (type === 'yaml') {
      // YAML -> json変換
      ret = JSON.stringify(yaml.load(ret))
      // json parse実行
      ret = JSON.parse(ret)
    }
  }

  // ファイル読込情報返却
  return ret
}

/**
 * ファイル出力
 * @param filePath ファイル出力先パス
 * @param fileData ファイルデータ
 */
plUtil.writeFileSync = function (filePath, fileData) {
  // ファイル出力
  fs.writeFileSync(filePath, fileData)
}

/**
 * ファイル削除
 * @param filePath ファイル出力先パス
 */
plUtil.unlinkSync = function (filePath) {
  if (fs.existsSync(filePath)) {
    // ファイル削除
    fs.unlinkSync(filePath)
  }
}

/**
 * ディレクトリ作成
 * @param dirPath ディレクトリパス
 */
plUtil.mkdirSync = function (dirPath) {
  if (!fs.existsSync(dirPath)) {
    // 存在しない場合のみディレクトリ作成
    mkdirp.sync(dirPath)
  }
}

/**
 * ディレクトリ内容読込
 * @param dirPath ディレクトリパス
 * @param nestNum 探索階層数
 * @returns ディレクトリ内容
 */
plUtil.readdirSync = function (dirPath, nestNum = 99) {
  let results = []
  if (!fs.existsSync(dirPath)) {
    // 存在しない場合のみディレクトリ作成
    fs.mkdirSync(dirPath)
  } else {
    let list = fs.readdirSync(dirPath)
    // 再帰呼び出しでサブディレクトリ配下の内容を取得
    list.forEach((file) => {
      file = path.resolve(dirPath, file)
      let stat = fs.statSync(file)
      if (stat && stat.isDirectory()) {
        // 探索階層数減少
        nestNum--
        if (nestNum > 0) {
          results = results.concat(plUtil.readdirSync(file, nestNum))
        } else {
          // dir情報保持
          results.push(file)
        }
      } else {
        // file情報保持
        results.push(file)
      }
    })
  }
  return results
}

/**
 * ディレクトリ削除共通処理(再帰)
 * @param targetPath 削除対象パス
 */
plUtil.rmdirRecursiveDir = function (targetPath) {
  if (!targetPath) {
    // path未指定時は処理なし
    return
  }
  if (fs.existsSync(targetPath)) {
    // eslint-disable-next-line
    fs.readdirSync(targetPath).forEach(function(file, index) {
      var curPath = targetPath + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        // ディレクトリの場合、再帰呼び出し
        plUtil.rmdirRecursiveDir(curPath)
      } else {
        // ファイルの場合、ファイル削除
        fs.unlinkSync(curPath)
      }
    })
    // ファイル全削除後、ディレクトリ削除
    fs.rmdirSync(targetPath)
  }
}

/**
 * ファイルパス生成
 * @param rootDir ベースディレクトリ
 * @param filePath 対象ファイルパス情報
 * @returns ファイルパス情報
 */
plUtil.pathJoin = function (rootDir = './', filePath = '') {
  // worker envファイルパス返却
  return path.join(rootDir, filePath)
}

/**
 * ファイル名取得
 * @param filePath 対象ファイルパス情報
 * @returns ファイル名情報
 */
plUtil.pathBasename = function (filePath) {
  // ファイル名返却
  return path.basename(filePath)
}

/**
 * 相対パス情報取得
 * @param targetPath 対象パス
 * @param rootPath 基準パス
 * @returns 相対パス情報
 */
plUtil.pathRelative = function (targetPath, rootPath = '.') {
  // 相対パス情報返却
  return path.relative(rootPath, targetPath)
}

/**
 * 指定パス情報取得
 * @param targetPath 対象パス
 * @param targetKey 指定キー情報
 * @returns 指定パス情報
 */
plUtil.getTargetKeyPath = function (targetPath, targetKey = null) {
  let result = []
  let wkPath = targetPath.split(path.sep)
  for (const pathStr of wkPath) {
    result.push(pathStr)
    if (targetKey && pathStr === targetKey) {
      break
    }
  }
  // 指定パス情報返却
  return result.join(path.sep)
}

module.exports = plUtil