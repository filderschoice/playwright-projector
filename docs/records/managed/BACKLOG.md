<!-- Copilot専用未対応事項記録ファイル（ユーザ編集禁止） -->
<!-- このファイルはCopilotがプロンプト指示の処理実行時のみ自動更新します。 -->
<!-- schema: records.backlog.v1 -->

<!-- COPILOT_RECORDS:BEGIN -->
<!-- markdownlint-disable-next-line MD041 -->
```yaml
- id: BL-021
  区分: 品質ゲート
  タスク内容: >-
    開発依存（ESLint 8 系の間接依存）の npm audit 指摘 6件（high 4件 ajv・brace-expansion・cross-spawn・minimatch 等、
    moderate 2件）を、依存の削除・ダウングレードを伴わない範囲の更新で解消する
  優先度: P3
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    npm audit（dev含む）の high 以上が0件、または残存分に更新不可の理由が記録されており、
    品質ゲートの ESLint・Prettier が従来と同じ判定で成功する
  依存: []
  根拠: >-
    2026-09-13の BL-018 対応中に npm audit（dev含む）で検出。品質ゲートの対象は --omit=dev で、開発端末でのみ
    実行するツールの依存のため優先度はP3とした。ESLint 9 への移行は設定形式が変わるため本タスクの範囲外とする
- id: BL-019
  区分: 人手検証
  タスク内容: >-
    playwright 更新（BL-018）と不具合修正（BL-003〜BL-010）の後、npx playwright install でブラウザを導入し、
    npm start でサンプルシナリオが完走すること、result/ss と result/videos に成果物が出ることを確認する
  優先度: P2
  状態: 未着手
  担当: ユーザー
  完了条件: >-
    chromium でサンプルシナリオが例外なく完走し、スクリーンショット連番と動画ファイルが保存される。
    シナリオファイルの構文誤りを与えたとき終了コード1で停止する
  依存:
    - BL-018
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
