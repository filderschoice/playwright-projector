<!-- Copilot専用未対応事項記録ファイル（ユーザ編集禁止） -->
<!-- このファイルはCopilotがプロンプト指示の処理実行時のみ自動更新します。 -->
<!-- schema: records.backlog.v1 -->

<!-- COPILOT_RECORDS:BEGIN -->
<!-- markdownlint-disable-next-line MD041 -->
```yaml
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
- id: BL-026
  区分: 品質ゲート
  タスク内容: >-
    playwright 1.63.0 で非推奨（@deprecated）の ElementHandle.type を input シナリオのフォーカス目的で使っているため、
    非推奨でない ElementHandle.focus へ置き換える
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    src/ 配下で非推奨APIを呼んでいない。input シナリオが従来どおり先頭要素へフォーカスしてから insertText することをモックで確認している
  依存: []
  根拠: >-
    type('') は空文字の入力でキー操作を行わず、実質はフォーカスのみのため focus() で挙動を維持できる。
    page.$$（ElementHandle）は非推奨ではなく「推奨されない」扱いで、Locator への移行は待機・厳格モードの挙動が変わるため対象外とする
- id: BL-025
  区分: 不具合
  タスク内容: >-
    コンフィグの slowMo を BrowserType.launchServer へ渡しているが、launchServer は slowMo オプションを持たないため
    無視されている（1.55.1 でも同様）。BrowserType.connect のオプションとして渡し、README の説明どおり操作を遅延させる
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    connect に slowMo が渡り、launchServer には渡らないことをモックで確認している。未指定時の既定値（10ms）は維持している
  依存: []
  根拠: >-
    README の slowMo は「ブラウザ操作の遅延値」と記載されており、playwright の型定義では slowMo は launch と connect の
    オプションである。記載どおりに動作させる修正で、既定値10msの遅延が実際に入るようになる影響は軽微と判断した
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
    slowMo を大きな値（例 500）にすると操作が遅くなる。シナリオファイルの構文誤りを与えたとき終了コード1で停止する
  依存:
    - BL-025
    - BL-026
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
