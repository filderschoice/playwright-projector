<!-- markdownlint-disable-file MD041 -->
<!-- Copilot専用設計記録ファイル（ユーザ編集禁止） -->
<!-- このファイルはCopilotがプロンプト指示の処理実行時のみ自動更新します。 -->
<!-- schema: records.design.v1 -->

<!-- COPILOT_RECORDS:BEGIN -->
# 実装用プロンプト設計書

## 目的

- playwright-projector と同一の要件を、AIエージェントに再実装・追加実装させるための設計書（最新版）。
- 利用者向けの仕様（パラメータ表・Scenario Type 表）の正本は `README_ja.md` / `README.md` であり、本書は
  それを実装へ落とすための設計意図・制約・品質観点を補う。

## 対象システム概要

- 対象: YAML のコンフィグとシナリオで Playwright の Page 操作を宣言的に逐次実行する Node.js 製 CLI。
  利用者は Browser / Context を意識しない。
- 前提環境: Node.js 24 以上（Active LTS。`package.json` の `engines` を `>=24`、`.nvmrc` を `24` で宣言）、CommonJS。
  依存は playwright ^1.55.1・js-yaml ^4.3.2・commander ^9・app-root-path ^3・mkdirp ^1（mkdirp は未使用関数のみが参照）。
- ブラウザ本体は `npx playwright install` で別途導入する（playwright 1.55.1 は install script を持たない）。

## 実装済み機能要件

- FR-01 CLI 引数: `-c/--config`（既定 `./conf/plConfig.yaml`）、`-s/--scenario`（既定 `./conf/plScenarios.yaml`）、
  `-a/--auth`（既定 `./conf/auth/plAuth.yaml`）、`--version`（package.json の version）。
- FR-02 設定の読込とマージ: 3ファイルを YAML として読み、`{ ...plConfig, ...plAuth }` の浅いマージで Auth 側を優先する。
- FR-03 読込失敗時の扱い（`index.js` の `loadYaml`）:
  - シナリオが無い・空・構文エラー・配列でない場合は `[ERROR]` を出力し、ブラウザを起動せず終了コード1。
  - コンフィグ・Auth が構文エラー・マッピングでない場合も同様に終了コード1。
  - コンフィグが無い場合は `[WARN]` を出して `{}` で継続、Auth が無い・空の場合は無出力で `{}` として継続。
  - 構文エラーの表示は `plUtil.formatParseError` による理由と行・列のみ。js-yaml の `message` はファイル内容の抜粋を
    含み、Auth ファイルでは資格情報が出力されるため使わない。
- FR-04 ブラウザ起動: `browserType`（chromium / firefox / webkit、未知値は chromium）で `launchServer` し、
  `wsEndpoint` へ `connect` する。`timeout` はブラウザ起動待ち、`slowMo`・`headless` はそのまま渡す。
- FR-05 起動引数: 固定の `browserArgs`（`--lang=ja`・`--window-size=1366,768`・`-wait-for-browser`）の複製に、
  `proxyInfo` が空（null / undefined / []）なら `--no-proxy-server`、そうでなければ `proxyInfo` の各要素を追加する。
  ブラウザ種別による引数の出し分けはしない（firefox / webkit での可否は未確認、BL-015）。
- FR-06 コンテキスト: `ignoreHTTPSErrors: true`、`locale`（既定 `ja-JP`）、`auth` があれば `httpCredentials`、
  `video` があれば `recordVideo: { dir: 'result/videos/' }`。`page.timeout` があれば `setDefaultTimeout` に設定する。
- FR-07 シナリオ実行: 配列を先頭から逐次実行し、各シナリオの前に `logDebug` でシナリオ全体を JSON 出力、
  各シナリオの後に1秒待つ。`type` が空のシナリオと未知の `type` は何もしない（黙って無視）。
- FR-08 シナリオ種別（`plCore.execOperationPage`。操作対象は `PlaywrightCores.userPage`、初回は初期ページ）:
  - `goto`: `page.goto(url)`。
  - `input`: `$$(selector)` の先頭要素へ `type('')` でフォーカスし、`keyboard.insertText(value)`。要素が無ければ何もしない。
  - `submit`: `$$(selector)` の先頭要素を click。要素が無ければ何もしない。
  - `wait`: `time` ミリ秒待つ。
  - `screenshot`: `options`（シナリオ）があればそれを、無ければコンフィグの `screenshot` を**複製**して `path` を付与し保存。
    ファイル名は `<dir>/playwright-projector_<連番>.<type>`、連番は0始まりで3桁以上のゼロ埋め（1000以上は桁を増やす）。
    `pageIndex` 指定時は現在ページのコンテキストから該当ページを取得して保存する。いずれも await する。
  - `conditions`: `subType` が `click` なら `$$(selector)[selectorIndex]` を click、`download` なら
    `Promise.all([waitForEvent('download'), click()])` の後に `saveAs(savePath)`。`selectorIndex < 要素数` の場合のみ実行し、
    download の待機は click する場合にのみ開始する（待機 Promise を放置しない）。
  - `pageChange`: `useStack` が真なら `user.context`、偽なら現在ページの `context()` から `getOperatePage(context, pageIndex)`
    で操作対象を切り替え、切替後のページに `bringToFront` する。
  - `page.operator`: `page[subType]` が関数なら、`args` がオブジェクトの場合のみ引数として渡して呼び、戻り値を常に await する。
    `isStack` が真なら `user[subType]` に解決済みの値を保持する（`pageChange` の `useStack` は `user.context` を参照する）。
- FR-09 ページ取得（`getOperatePage`）: ページが無ければ `newPage`。`pageIndex` 指定時はその位置、未指定時は
  `about:blank` でない最初のページ、全て空白なら先頭。
- FR-10 終了処理（`runPlaywright.exec` の finally）: シナリオの例外時も、初期ページの close → コンテキストの close →
  `video.file` があれば初期ページの動画を `result/videos/<file>.webm` へ保存 → 1秒待ってブラウザサーバーを close。
  各後始末の失敗は `[WARN]` のみで元の例外を隠さない。例外は `index.js` で捕捉し、スタックを出力して終了コード1。

## 設計方針

- アーキテクチャ方針: `index.js`（引数・読込・マージ・終了コード）→ `src/runPlaywright.js`（起動から終了までの流れ）→
  `src/core/plCore.js`（Playwright 操作）の3層。汎用関数は `src/utils/plUtil.js`。`src/` 間は `global.reqlib`
  （app-root-path）で参照するため、`src/` のファイルは単体 `require` できない（検証時は `global.reqlib` を先に定義する）。
- データ設計方針: シナリオ・設定はファイルから読んだ JSON 互換値（YAML を JSON シリアライズで正規化）。
  状態はモジュールスコープ（`userPage`・`user`・`ssNumber`）に保持し、1プロセス1実行を前提とする。
  再実行や並列化を導入する場合はこれらの初期化を設計に含める。`browserArgs` と共有設定は破壊的に変更しない。
- 仕様追加時の同時更新: シナリオ種別・パラメータ・設定キーを追加・変更したら、両 README の表と `conf/*.sample.yaml` を更新する。

## 非機能要件

- 性能: 各シナリオ後に固定1秒、終了時に固定1秒待つ（安定性優先。短縮する場合は既存シナリオへの影響を確認する）。
- 信頼性: 例外時もブラウザを後始末し、非0の終了コードで失敗を呼び出し元へ伝える。設定ファイルの誤りは黙って無視せず
  起動前に停止する。待機 Promise を放置して未処理 rejection を起こさない。
- セキュリティ/プライバシー:
  - `conf/` 直下・`conf/auth/`・`conf/custom/` の yaml / yml はサンプル（`*.sample.yaml`）以外 Git 管理外。サンプルはダミー値のみ。
  - 読込エラーの出力にファイル内容を含めない。
  - 既知の未解決事項: `logDebug` がシナリオ全体を平文出力するため、`input.value` 等の資格情報が標準出力へ出る（BL-013、要確認）。

## 実装制約

- 技術制約: CommonJS、Prettier（セミコロンなし・シングルクォート・120桁・末尾カンマなし）、ESLint 8 形式
  （`no-undef` 有効、`reqlib` は globals）。自動テストは存在しない。
- 運用制約: `npm start` は実ブラウザを起動し外部サイトへアクセスするため人手検証とする。出力先 `result/ss/`・
  `result/videos/` は Git 管理外。依存更新時はブラウザの再導入（`npx playwright install`）が必要。

## エージェント実装指示

- 初回実装時の出力要件: 上記3層構成と FR-01〜FR-10 を満たす完全なコード、`conf/*.sample.yaml`、両 README、
  セットアップ（`npm ci` と `npx playwright install`）と実行手順を提示する。
- 追加実装時の出力要件: 変更対象ファイル一覧と差分、影響する FR 番号、README / サンプルの同時更新の有無、
  既存シナリオへの互換性影響を示す。明示されていない要件は既存仕様（本書の FR）を維持する。
- 要件トレーサビリティ要件: 自動テストが無いため、挙動を変える変更ではブラウザを起動しないモック（`global.reqlib` を
  定義し、`page` / `context` を模したオブジェクトで `plCore` を呼ぶ、または `require.cache` で `plCore` /
  `runPlaywright` を差し替えて `index.js` を実行する）で修正前後の差を確認し、実ブラウザでの確認は人手検証として記録する。
<!-- COPILOT_RECORDS:END -->
