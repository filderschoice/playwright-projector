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

### playwright-projectorを動かしてみましょう。

playwright-projectorはコンフィグファイルとシナリオファイルの2つのyamlファイルによって動作します。  
コンフィグファイルとシナリオファイルは以下のファイル名がデフォルトとなります。

#### 基本ファイル
|ファイル種別|ファイル名|ファイル概要|
|-|-|-|
|コンフィグファイル|plConfig.yaml|Playwright, playwright-projecotrを動かす際の定義ファイル|
|シナリオファイル|plScenarios.yaml|playwright-projectorで実行する動作をまとめた定義ファイル|

confフォルダ内にそれぞれのサンプルファイルがあります。サンプルファイルをコピーして、デフォルトの基本ファイルを作成してください。  
実行前の準備はこれだけです。confフォルダ内にauthフォルダがありますが、これはProxy環境下でplaywright-projectorを実行する場合に必要になります。[後述]を参考に必要に応じて準備してください。

playwright-projectorを以下のコマンドで実行します。

```
> npm start
```

playwright-projectorが動作し、PlaywrightのGithubと公式HPに対するアクセスが自動操作されるのが確認できましたか？  
確認できたらplaywright-projectorの動作確認は終了です。  
ちなみに実行したときの実行ログがプロンプト上に表示されていると思います。  
このようにplaywright-projectorで実行したシナリオ内容をプロンプト上で確認することも可能です。

#### playwright-projectorの実行ログ
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

### playwright-projectorの基本ファイル構成

playwright-projectorを動かすことができたら、基本ファイルの内容が気になってくるところです。  
先述したとおり、playwright-projectorはコンフィグファイルとシナリオファイルの2つのyamlファイルが基本ファイルになります。  

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

Playwrightをご存じの方なら分かるとおり、コンフィグファイルの内容は[playwright.config](https://playwright.dev/docs/test-configuration)に近い構成となっています。  
同様のパラメータ値を使用しているため、気になったら確認してください。  
なお、今後のアップデートでコンフィグファイル内のパラメータは必要に応じて追加していく予定です。

|パラメータ|型|説明|設定値例|
|-|-|-|-|
|browserType|String|Playwrightで操作するブラウザ種別|chromium|
|headless|Boolean|ヘッドレスブラウザでの起動有無|false|
|timeout|Number|Playwrightで操作するシナリオのタイムアウト値(ms)|30000|
|slowMo|Number|ブラウザ操作の遅延値(ms)|10|
|local|String|ブラウザのロケール|ja-JP|
|proxyInfo|Array|Proxy情報, browserArgsで設定する内容を配列指定|[ '--proxy-server=プロキシのURL:ポート番号' ]|
|auth|Object|httpCredentialsで設定するauth情報, plAuth.yamlに分離可|{ 'username': 'hogehoge', 'password': 'fugafuga' }|
|page.timeout|Number|page setDefaultTimeout設定値(ms)|30000|
|screenshot.dir|String|スクリーンショット画像の保存先ディレクトリパス|./result/ss|
|screenshot.type|String|スクリーンショット画像の保存ファイル形式|jpeg|
|screenshot.quality|Number|スクリーンショット画像の保存品質|70|
|video.file|String|ブラウザ操作ビデオの保存ファイル名, 'result/videos/'直下に保存|'record-video'|

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

playwright-projectorのシナリオファイルはyaml形式の配列にて処理操作を定義します。  
シナリオで使用可能なtypeに応じて、付属する操作パラメータを設定することでPlaywrightの操作を簡易に指定することが可能です。  
なお、今後のアップデートでシナリオファイル内のパラメータは必要に応じて追加していく予定です。

|Scenario Type|操作パラメータ|説明|
|-|-|-|
|goto|arg1: url|page.goto()によるURL遷移処理|
|input|arg1: selector, arg2: value|page.$$([selector])によるbind, page.keyboard.insertText([value])による入力処理|
|submit|arg1: selector|page.$$([selector])によるbind, selector.click()による実行処理|
|screenshot|no arg|表示ページのスクリーンショット処理|
|wait|arg1: time(ms)|[time]時間のwait処理|
|conditions|arg1: subType, arg2: selector, arg3: selectorIndex|[selector]が複数存在する場合の特定処理を実施, [subType]はclickのみ対応|
|pageChange|arg1: pageIndex, arg2: useStack|複数ページ(タブ)がある場合のページ切替処理, Contextの再利用を行う場合は[useStack]を実施(Contextの再利用はcontext保持が必要)|
|page.operator|arg1: subeType, arg2: args, arg3: isStack|Playwright Pageのラッパー関数, [subType]でPageのAPIを指定し、[args]でAPIにおけるargs情報を指定。取得したデータを[isStack]により保持判定|


#### Authファイル(plAuth.yaml)

```
# Playwright Auth Options
auth:
  username: 'test'
  password: 'test123'
```

playwright-projectorではProxy環境におけるAuth情報をコンフィグファイルにて指定することが可能ですが、コンフィグファイルとAuth情報を切り離すためのAuthファイルを使用することが可能です  
パラメータの指定方法はコンフィグファイルと同様です。  
必要に応じて使用してください。  
