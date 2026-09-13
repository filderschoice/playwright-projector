<!-- Copilot専用未対応事項記録ファイル（ユーザ編集禁止） -->
<!-- このファイルはCopilotがプロンプト指示の処理実行時のみ自動更新します。 -->
<!-- schema: records.backlog.v1 -->

<!-- COPILOT_RECORDS:BEGIN -->
<!-- markdownlint-disable-next-line MD041 -->
```yaml
- id: BL-038
  区分: 品質ゲート
  タスク内容: >-
    導入完了チェックリスト（docs/guidelines/ADOPTION.md 第8節）の未解消項目を解消するか判断する。
    .github/CODEOWNERS（1行目・3行目）が実在しない @your-org/ai-platform 等を指し、
    templates/app-guardrail-template.yaml に replace-me が5件、templates/model-risk-register-template.csv に2件残っている
  優先度: P3
  状態: ブロック
  担当: ユーザー
  完了条件: >-
    レビュー担当（CODEOWNERS）の実在チーム・個人と、テンプレートの採否（本リポジトリは生成AIアプリではないため不要とするか）を
    ユーザーが決定し、決定内容に基づいてファイルが更新または削除されている
  依存: []
  根拠: >-
    CODEOWNERS はレビュー承認の統制に、テンプレートは組織のリスク判断に関わり、エージェントが既定値で埋めると
    実在しない承認者や根拠の無いリスク登録を作ってしまうため、自律ループでは起票のみとする
- id: BL-037
  区分: 品質ゲート
  タスク内容: >-
    docs/guidelines/ADOPTION.md の立ち位置の誤りを直す。3行目「本リポジトリで管理している…ルール」、54行目「配布元では」、
    93行目「配布元（本リポジトリ）」が本リポジトリを配布元として書いているが、本リポジトリ（playwright-projector）は
    ルールの配布先である。あわせて導入資産一覧（第1節）に docs/guidelines/README.md と .markdownlint-cli2.yaml
    （CLAUDE.md の品質ゲートが前提とする設定）が無い
  優先度: P3
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    ADOPTION.md が配布元リポジトリと配布先（本リポジトリ）を取り違えずに記述され、導入資産一覧に上記2ファイルが載っている。
    配布元由来の汎用記述（手順・チェックリスト）の意味は変えない。markdownlint が 0 issues
  依存: []
- id: BL-036
  区分: 品質ゲート
  タスク内容: >-
    開発者向け・エージェント向け文書の実装との乖離と不整合を直す。
    (1) .github/copilot-instructions.md「変更時の制約」の「ブラウザ引数（getArgs が配列へ追記する）をモジュール変数で持つ」が、
    getArgs は複製へ追記しモジュール変数を変更しない現行実装（src/core/plCore.js の getArgs）と異なる。
    (2) CONTRIBUTING.md「変更手順」2が「ルールファイルを追加または更新」のみで、アプリ本体の変更時のテスト・README 同時更新が無い。
    (3) CONTRIBUTING.md 101行目「導入可否は BACKLOG で判断待ち」が時点情報。
    (4) CONTRIBUTING.md「ドキュメント構成」表に README.md / README_ja.md、.claude/skills/、templates/ が無い。
    (5) CONTRIBUTING.md 29行目はPR説明へ目的・影響範囲・ロールバック方針を求めるが、正本の
    .github/instructions/pr.instructions.md の構成に影響範囲・ロールバック方針の欄が無く、
    .github/PULL_REQUEST_TEMPLATE.md は英語のコメント2行のみで構成を示していない
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    (1)〜(5) が解消し、PR説明の構成が pr.instructions.md を正本として CONTRIBUTING.md・PRテンプレートと矛盾しない。
    規範（禁止事項・承認要件）の追加・削除は行わない。markdownlint が 0 issues、npm test が成功
  依存: []
  根拠: >-
    (5) は CONTRIBUTING.md に既に定められたPR記載要件を正本の構成へ反映するもので、新しい規範の追加ではない。
    PRテンプレートは見出しのみを置き、各見出しの説明は正本（pr.instructions.md）への参照とすることで二重管理を避ける
- id: BL-035
  区分: 品質ゲート
  タスク内容: >-
    README.md / README_ja.md の実装との乖離と誤記を直す。
    (1) CLI オプション（index.js の -c/-s/-a/--version、DESIGN.md FR-01）の説明が無く、別名のファイルを使う方法が分からない。
    (2) README.md 16行目「playright」、両 README の「Github」の誤記。
    (3) README.md 43行目「[see below]」、README_ja.md 41行目「[後述]」がリンクになっておらず参照先が不明で、
    README.md には auth フォルダの説明文自体が無い。
    (4) 両 README のコンフィグ例の video.file の字下げが1文字で、conf/plConfig.sample.yaml（2文字）と異なる。
    (5) README.md 9〜10行目の英文が日本語版と意味が異なる（「because it's a simple way」の主語が曖昧で、本ツールが簡易な試用向けである旨が伝わらない）。
    (6) シナリオ内容（input の value 等）が実行ログへそのまま出力されること（src/runPlaywright.js の logDebug）と、
    スクリーンショット・動画の保存ファイル名（DESIGN.md FR-08・FR-10）が書かれていない
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    (1)〜(6) が両 README で解消し、日英の記載内容が一致している。既存の表の構成（test/docs.test.js が読む
    パラメータ表・Scenario Type 表の1列目）は維持し、npm test が成功、markdownlint が 0 issues
  依存: []
  根拠: >-
    (6) はマスク方式を決める BL-013（要確認）の判断を先取りせず、現行の挙動を利用者へ注意喚起するだけに留める
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
