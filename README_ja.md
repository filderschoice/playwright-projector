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
locale: 'jp-JP'
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
