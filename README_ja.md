# playwright-projector

## [English](./README.md) | [Japanese](./README_ja.md)

playwright-projector は [Playwright](https://github.com/microsoft/playwright) を簡略的に利用するためのツールです。 Playwright を使用する場合における Browser/Context 等のロジックを意識せず、Page Class の操作をコンフィグとシナリオを用いることでプロジェクター的に使用することが可能になります。

あくまで簡略的に Playwright を試したい場合のツールとなるため、Playwright の Core API 群を用いて高レベルな Web テストを実装したい場合は、Playwright を使用することをお勧めします。

## インストール方法

playwright-projector を Clone して、依存パッケージのインストールを行います。

```
> git clone https://github.com/filderschoice/playwright-projector.git
> cd playwright-projector
> npm ci
```

## 始めにやること

### playwright-projector を動かしてみましょう。

playwright-projector はコンフィグファイルとシナリオファイルの 2 つの yaml ファイルによって動作します。  
コンフィグファイルとシナリオファイルは以下のファイル名がデフォルトとなります。

#### 基本ファイル

| ファイル種別       | ファイル名       | ファイル概要                                              |
| ------------------ | ---------------- | --------------------------------------------------------- |
| コンフィグファイル | plConfig.yaml    | Playwright, playwright-projector を動かす際の定義ファイル |
| シナリオファイル   | plScenarios.yaml | playwright-projector で実行する動作をまとめた定義ファイル |

conf フォルダ内にそれぞれのサンプルファイルがあります。サンプルファイルをコピーして、デフォルトの基本ファイルを作成してください。  
実行前の準備はこれだけです。conf フォルダ内に auth フォルダがありますが、これは Proxy 環境下で playwright-projector を実行する場合に必要になります。[後述]を参考に必要に応じて準備してください。

playwright-projector を以下のコマンドで実行します。

```
> npm start
```

playwright-projector が動作し、Playwright の Github と公式 HP に対するアクセスが自動操作されるのが確認できましたか？  
確認できたら playwright-projector の動作確認は終了です。  
ちなみに実行したときの実行ログがプロンプト上に表示されていると思います。  
このように playwright-projector で実行したシナリオ内容をプロンプト上で確認することも可能です。

#### playwright-projector の実行ログ

```
$ npm start

> playwright-projector@0.0.1 start
> node index.js

playwright-projector start
  - config: ./conf/plConfig.yaml
  - auth: ./conf/auth/plAuth.yaml
  - scenario: ./conf/plScenarios.yaml
runPlaywright.exec begin
yyyy/mm/dd HH:MM:ss - {"type":"goto","url":"https://www.google.com/?hl=ja"}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot"}
yyyy/mm/dd HH:MM:ss - {"type":"wait","time":1000}
yyyy/mm/dd HH:MM:ss - {"type":"input","selector":"input[type=text]","value":"github playwright"}
yyyy/mm/dd HH:MM:ss - {"type":"submit","selector":"input[type=submit]"}
yyyy/mm/dd HH:MM:ss - {"type":"wait","time":1000}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot"}
yyyy/mm/dd HH:MM:ss - {"type":"conditions","subType":"click","selector":"#res a","selectorIndex":0}
yyyy/mm/dd HH:MM:ss - {"type":"wait","time":1000}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot"}
yyyy/mm/dd HH:MM:ss - {"type":"conditions","subType":"click","selector":".Layout-sidebar a.text-bold","selectorIndex":0}
yyyy/mm/dd HH:MM:ss - {"type":"pageChange","pageIndex":0,"useStack":false,"args":null}
yyyy/mm/dd HH:MM:ss - {"type":"wait","time":1000}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot","pageIndex":1}
yyyy/mm/dd HH:MM:ss - {"type":"screenshot"}
yyyy/mm/dd HH:MM:ss - {"type":"dummy","sample":"test"}
runPlaywright.exec end
```

### playwright-projector の基本ファイル構成

playwright-projector を動かすことができたら、基本ファイルの内容が気になってくるところです。  
先述したとおり、playwright-projector はコンフィグファイルとシナリオファイルの 2 つの yaml ファイルが基本ファイルになります。

#### コンフィグファイル(plConfig.yaml)

```
# Playwright Options
browserType: 'chromium'
headless: false
timeout: 30000
slowMo: 10
locale: 'ja-JP'
# proxy settings
proxyInfo: []
auth: null
# page option
page:
  timeout: 30000
# save scenario screenshot
screenshot:
  dir: './result/ss'
  type: 'jpeg'
  quality: 70
# save scenario video
video:
 file: 'record-video'
```

Playwright をご存じの方なら分かるとおり、コンフィグファイルの内容は[playwright.config](https://playwright.dev/docs/test-configuration)に近い構成となっています。  
同様のパラメータ値を使用しているため、気になったら確認してください。  
なお、今後のアップデートでコンフィグファイル内のパラメータは必要に応じて追加していく予定です。

| パラメータ         | 型      | 説明                                                           | 設定値例                                           |
| ------------------ | ------- | -------------------------------------------------------------- | -------------------------------------------------- |
| browserType        | String  | Playwright で操作するブラウザ種別                              | chromium                                           |
| headless           | Boolean | ヘッドレスブラウザでの起動有無                                 | false                                              |
| timeout            | Number  | Playwright で操作するシナリオのタイムアウト値(ms)              | 30000                                              |
| slowMo             | Number  | ブラウザ操作の遅延値(ms)                                       | 10                                                 |
| local              | String  | ブラウザのロケール                                             | ja-JP                                              |
| proxyInfo          | Array   | Proxy 情報, browserArgs で設定する内容を配列指定               | [ '--proxy-server=プロキシの URL:ポート番号' ]     |
| auth               | Object  | httpCredentials で設定する auth 情報, plAuth.yaml に分離可     | { 'username': 'hogehoge', 'password': 'fugafuga' } |
| page.timeout       | Number  | page setDefaultTimeout 設定値(ms)                              | 30000                                              |
| screenshot.dir     | String  | スクリーンショット画像の保存先ディレクトリパス                 | ./result/ss                                        |
| screenshot.type    | String  | スクリーンショット画像の保存ファイル形式                       | jpeg                                               |
| screenshot.quality | Number  | スクリーンショット画像の保存品質                               | 70                                                 |
| video.file         | String  | ブラウザ操作ビデオの保存ファイル名, 'result/videos/'直下に保存 | 'record-video'                                     |

#### シナリオファイル(plScenario.yaml)

```
#######################
# Playwright Operation Scenarios
#######################
- # Scenario
  type: 'goto'
  url: 'https://www.google.com/?hl=ja'
- # Scenario
  type: 'screenshot'
- # Scenario
  type: 'wait'
  time: 1000
- # Scenario
  type: 'input'
  selector: 'input[type=text]'
  value: 'github playwright'
・・・省略
```

playwright-projector のシナリオファイルは yaml 形式の配列にて処理操作を定義します。  
シナリオで使用可能な type に応じて、付属する操作パラメータを設定することで Playwright の操作を簡易に指定することが可能です。  
なお、今後のアップデートでシナリオファイル内のパラメータは必要に応じて追加していく予定です。

| Scenario Type | 操作パラメータ                                                                    | 説明                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| goto          | arg1: url                                                                         | page.goto([url])による URL 遷移処理                                                                                                              |
| input         | arg1: selector, arg2: value                                                       | page.$$([selector])による bind, page.keyboard.insertText([value])による入力処理                                                                  |
| submit        | arg1: selector                                                                    | page.$$([selector])による bind, selector.click()による実行処理                                                                                   |
| screenshot    | no arg                                                                            | 表示ページのスクリーンショット処理                                                                                                               |
| wait          | arg1: time(ms)                                                                    | [time]時間の wait 処理                                                                                                                           |
| conditions    | arg1: subType, arg2: selector, arg3: selectorIndex, arg4: savePath(download のみ) | [selector]が複数存在する場合の特定処理を実施, [subType]は `click`/`download` のみ対応                                                            |
| pageChange    | arg1: pageIndex, arg2: useStack                                                   | 複数ページ(タブ)がある場合のページ切替処理, Context の再利用を行う場合は[useStack]を実施(Context の再利用は context 保持が必要)                  |
| page.operator | arg1: subType, arg2: args, arg3: isStack                                          | Playwright Page のラッパー関数, [subType]で Page の API を指定し、[args]で API における args 情報を指定。取得したデータを[isStack]により保持判定 |

#### Auth ファイル(plAuth.yaml)

```
# Playwright Auth Options
auth:
  username: 'test'
  password: 'test123'
```

playwright-projector では Proxy 環境における Auth 情報をコンフィグファイルにて指定することが可能ですが、コンフィグファイルと Auth 情報を切り離すための Auth ファイルを使用することが可能です  
パラメータの指定方法はコンフィグファイルと同様です。  
必要に応じて使用してください。
