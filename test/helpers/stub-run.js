// index.js を子プロセスで検証するための preload(node -r で読み込む)
// src/runPlaywright.js をスタブへ差し替え、ブラウザを起動せずに exec へ渡された値を標準出力へ出す
// 環境変数 PL_TEST_STUB_MODE=throw のとき exec で例外を投げる
const path = require('path')

const rootDir = path.resolve(__dirname, '..', '..')
const runPath = require.resolve(path.join(rootDir, 'src', 'runPlaywright.js'))

require.cache[runPath] = {
  id: runPath,
  filename: runPath,
  loaded: true,
  exports: {
    exec: async (scenarios, options) => {
      console.log('STUB_EXEC ' + JSON.stringify({ scenarios, options }))
      if (process.env.PL_TEST_STUB_MODE === 'throw') {
        throw new Error('stub runtime error')
      }
    }
  }
}
