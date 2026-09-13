<!-- Copilot専用未対応事項記録ファイル（ユーザ編集禁止） -->
<!-- このファイルはCopilotがプロンプト指示の処理実行時のみ自動更新します。 -->
<!-- schema: records.backlog.v1 -->

<!-- COPILOT_RECORDS:BEGIN -->
<!-- markdownlint-disable-next-line MD041 -->
```yaml
- id: BL-034
  区分: 品質ゲート
  タスク内容: >-
    npm test を含む品質ゲートをプルリクエストごとに自動実行する CI（GitHub Actions 等）を導入するか判断する
  優先度: P3
  状態: ブロック
  担当: ユーザー
  完了条件: CI を導入するかをユーザーが決定し、導入する場合はワークフロー定義を人が作成・レビューしている
  依存: []
  根拠: >-
    本リポジトリには CI が無く、テストはローカル実行に依存する。CI/CD 定義の変更は guardrails 12.2 で自律ループ内の実施が
    禁止されているため、ループでは起票のみとする
- id: BL-033
  区分: 品質ゲート
  タスク内容: >-
    単体テストを品質ゲートと更新規約へ組み込む。CLAUDE.md の品質ゲート定義に npm test を追加し、ESLint・Prettier の対象へ
    test を加える。共通規約・CONTRIBUTING.md・DESIGN.md の「自動テストは存在しない」を改め、挙動を変える変更ではテストを
    追加・更新することを規約化する
  優先度: P1
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    品質ゲート定義に単体テスト（npm test、終了コード0）があり、ESLint・Prettier のコマンドが test を含む。
    共通規約・CONTRIBUTING.md・DESIGN.md にテストの配置・実行方法・更新規約が記載され、「自動テストは存在しない」の記述が残っていない
  依存:
    - BL-029
    - BL-030
    - BL-031
    - BL-032
- id: BL-032
  区分: 品質ゲート
  タスク内容: >-
    ドキュメント整合テストを追加する。plCore.execOperationPage のシナリオ種別（case ラベル）と README_ja.md・README.md の
    Scenario Type 表、conf/plScenarios.sample.yaml の種別が一致すること、サンプル3ファイルが読み込めることを検証する
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: 種別の追加・削除時に README またはサンプルの更新漏れがあればテストが失敗する
  依存:
    - BL-028
  根拠: >-
    共通規約の「種別を追加・変更したら両 README の表とサンプルを同時に更新する」を機械的に検出するため。
    サンプルに意図的に含まれる未知種別 dummy は、黙って無視される挙動の例として許容リストで扱う
- id: BL-031
  区分: 品質ゲート
  タスク内容: >-
    index.js の単体テストを追加する。runPlaywright をスタブへ差し替えた子プロセスで CLI を実行し、既定パスとオプション指定、
    設定マージ（Auth 優先）、読込失敗時の終了コードと出力（ファイル内容を出さない）、実行時例外の終了コード1を検証する
  優先度: P1
  状態: 未着手
  担当: AIエージェント
  完了条件: DESIGN.md の FR-01〜FR-03 と FR-10 の例外時終了コードをテストで網羅し、npm test が成功する
  依存:
    - BL-028
- id: BL-030
  区分: 品質ゲート
  タスク内容: >-
    src/runPlaywright.js の単体テストを追加する。plCore をモックへ差し替え、起動から終了までの呼び出し順・引数、
    page パラメータ設定、シナリオの逐次実行、例外時の後始末（page・context の close、動画保存、サーバー close）と
    後始末失敗時に元の例外を隠さないことを検証する
  優先度: P1
  状態: 未着手
  担当: AIエージェント
  完了条件: DESIGN.md の FR-04・FR-06（page.timeout）・FR-07・FR-10 をテストで網羅し、npm test が成功する
  依存:
    - BL-028
- id: BL-029
  区分: 品質ゲート
  タスク内容: >-
    src/core/plCore.js の単体テストを追加する。Page・Context・BrowserType のモックで、ブラウザ種別選択、起動引数、
    launchServer・connect・newContext のオプション、getOperatePage、スクリーンショット連番とファイル名、
    execOperationPage の全シナリオ種別（goto・input・submit・wait・screenshot・conditions・pageChange・page.operator・未知種別）を検証する
  優先度: P1
  状態: 未着手
  担当: AIエージェント
  完了条件: DESIGN.md の FR-04〜FR-06・FR-08・FR-09 をテストで網羅し、npm test が成功する
  依存:
    - BL-028
- id: BL-028
  区分: 品質ゲート
  タスク内容: >-
    単体テストの基盤を追加する。Node.js 24 標準の node:test と node:assert を使い（依存追加なし）、npm test を
    test 配下の *.test.js を実行するよう変更し、reqlib の初期化などの共通ヘルパーを用意する。
    あわせて src/utils/plUtil.js のうち実行経路で使う関数（isEmpty 系・readYamlFile・readFileSync・formatParseError・
    logOutput・pathJoin）のテストを追加する
  優先度: P1
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    npm test がブラウザ導入・外部通信なしで成功し、失敗するテストがあれば終了コードが非0になる。
    テストコードが ESLint・Prettier を通過する
  依存: []
  根拠: >-
    テストフレームワークは既定値として node:test を選んだ。Node.js 24 を前提環境としたため標準で利用でき、依存パッケージの
    追加（供給網リスクと npm audit 対象の増加）が不要なため。@playwright/test は実ブラウザ前提で、本リポジトリのロジックの
    単体テストには過大。未使用関数（BL-014 で削除判断待ち）はテスト対象外とする
- id: BL-027
  区分: 品質ゲート
  タスク内容: >-
    Node.js 24 前提で他の依存のメジャー更新（commander 9→15、js-yaml 4→5、eslint 8→9、prettier 2→3、
    eslint-config-prettier 8→10）を行うか判断する
  優先度: P3
  状態: ブロック
  担当: ユーザー
  完了条件: 更新する依存と時期をユーザーが決定し、更新する場合は個別の実装タスクが起票されている
  依存: []
  根拠: >-
    いずれも Node.js 24 上で現行版のまま動作し、品質ゲートも成功するため必須ではない。eslint 9 は flat config への移行と
    CLAUDE.md の品質ゲート定義（ESLint 8 前提の注記）の変更を伴い、commander・js-yaml はCLI引数解釈とYAML読込の
    互換性確認が必要な破壊的変更を含むため、今回の依頼範囲（Node.js 24 と playwright 最新化）の外として人の判断に委ねる
- id: BL-019
  区分: 人手検証
  タスク内容: >-
    Node.js 24 と playwright 1.63.0 への更新（BL-023〜BL-026）の後、npx playwright install でブラウザを導入し、
    npm start でサンプルシナリオが完走すること、result/ss と result/videos に成果物が出ることを確認する
  優先度: P2
  状態: 未着手
  担当: ユーザー
  完了条件: >-
    chromium でサンプルシナリオが例外なく完走し、スクリーンショット連番と動画ファイルが保存される。
    slowMo を大きな値（例 500）にすると操作が遅くなる。input シナリオで検索欄へ文字が入力される。
    シナリオファイルの構文誤りを与えたとき終了コード1で停止する
  依存: []
  根拠: 実ブラウザ起動と外部サイトへのアクセスを伴うため、CLAUDE.md の定義により自律ループ内で実行しない
- id: BL-016
  区分: 人手検証
  タスク内容: >-
    conf/plScenarios.sample.yaml の Google 検索手順（input[type=text]、#res a）が現在のページ構造で動作するか確認し、
    動作しない場合はセレクタの見直しをBACKLOGへ起票する
  優先度: P3
  状態: 未着手
  担当: ユーザー
  完了条件: サンプルシナリオの各ステップで対象要素が見つかることを実ブラウザで確認している
  依存: []
  根拠: 外部サイトのDOMに依存し、自律ループ内では外部サイトへアクセスできないため人手検証とする
- id: BL-015
  区分: 人手検証
  タスク内容: >-
    browserType に firefox / webkit を指定したとき、chromium 専用の起動引数（--lang=ja、--window-size、
    -wait-for-browser、--no-proxy-server）が常に渡されても起動できるか確認する
  優先度: P3
  状態: 未着手
  担当: ユーザー
  完了条件: firefox と webkit でサンプルシナリオが起動する、または起動しない場合にブラウザ種別ごとの引数分離をBACKLOGへ起票している
  依存:
    - BL-019
  根拠: plCore.getArgs がブラウザ種別を問わず同一の引数を返すため。実ブラウザ起動が必要で自律ループ内では確認できない
- id: BL-014
  区分: 品質ゲート
  タスク内容: >-
    src/utils/plUtil.js の未使用関数（readdirSync・rmdirRecursiveDir・mkdirSync・unlinkSync・writeFileSync・
    getTargetKeyPath・pathBasename・pathRelative・replaceFilePath2Unix）と、それらだけが使う mkdirp 依存を削除するか判断する
  優先度: P3
  状態: ブロック
  担当: ユーザー
  完了条件: 削除するか維持するかをユーザーが決定し、削除する場合は依存パッケージの削除を人が実施している
  依存: []
  根拠: >-
    依存パッケージの削除は guardrails 12.2 で自律ループ内の実施が禁止されているためブロックとする。
    未使用関数は実行時の害がないので、依存とあわせて人の判断で整理する
- id: BL-013
  区分: 品質ゲート
  タスク内容: >-
    runPlaywright がシナリオ全体を logDebug で平文出力するため、input の value や page.operator の args に
    パスワード等を書いたとき標準出力へ露出する。マスク方式（全 value をマスク／secret フラグ指定時のみマスク等）を決める
  優先度: P2
  状態: 要確認
  担当: ユーザー
  完了条件: マスク対象と方式をユーザーが決定し、決定内容に基づく実装タスクが起票されている
  依存: []
  根拠: >-
    秘密情報の取り扱いに関わり、README の実行ログ例（value を表示）という既存仕様の変更も伴うため、
    guardrails 12.4 に従い自己解決せず要確認とする
```

<!-- COPILOT_RECORDS:END -->
