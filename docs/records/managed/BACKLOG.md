<!-- Copilot専用未対応事項記録ファイル（ユーザ編集禁止） -->
<!-- このファイルはCopilotがプロンプト指示の処理実行時のみ自動更新します。 -->
<!-- schema: records.backlog.v1 -->

<!-- COPILOT_RECORDS:BEGIN -->
<!-- markdownlint-disable-next-line MD041 -->
```yaml
- id: BL-020
  区分: 品質ゲート
  タスク内容: DESIGN.md が空のため、本ループで修正した挙動を含む現行実装の再実装用プロンプト設計書を作成する
  優先度: P3
  状態: 未着手
  担当: AIエージェント
  完了条件: DESIGN.md が FORMAT.md 推奨テンプレートの各節を持ち、src/ と conf/*.sample.yaml の現行挙動と一致している
  依存:
    - BL-003
    - BL-004
    - BL-005
    - BL-006
    - BL-007
    - BL-008
    - BL-009
    - BL-010
  根拠: 2026-09-13の全体レビューで検出。自律ループの完了条件「DESIGN.md が実施済み内容と整合している」を満たすため
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
- id: BL-018
  区分: 品質ゲート
  タスク内容: playwright を npm audit の high（GHSA-7mvr-c777-76hp）が解消するバージョンへ更新する
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    npm audit --omit=dev で playwright の指摘が0件になり、ESLint・Prettier が成功する。
    実行確認は BL-019 へ分離する
  依存:
    - BL-002
  根拠: >-
    BL-002 から分割。1.29 系から 1.5x 系への追従で、ブラウザバイナリの再導入（npx playwright install）が必要になる。
    ElementHandle.type などの非推奨APIは存続しているため、コードはそのままで動作する想定だが未確認であり、BL-019 で確認する
- id: BL-017
  区分: 品質ゲート
  タスク内容: >-
    README.md / README_ja.md の記載と実装の乖離を修正する（パラメータ名 local は locale の誤り、timeout は
    ブラウザ起動のタイムアウトでありシナリオのタイムアウトではない、screenshot の pageIndex・options と
    download の savePath が未記載、実行ログ例のバージョン表記が古い）
  優先度: P3
  状態: 未着手
  担当: AIエージェント
  完了条件: 両READMEのパラメータ表とScenario Type表が src/ の実装と一致し、Markdown 静的解析が成功する
  依存:
    - BL-001
  根拠: 2026-09-13の全体レビューで検出。記載の誤りのみを直し、挙動の仕様は変更しない
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
- id: BL-012
  区分: 品質ゲート
  タスク内容: >-
    .gitignore が conf/auth/plAuth.yaml と conf/plConfig.yaml などの既定ファイル名しか除外しておらず、-a / -c で
    別名の認証ファイルを使うとコミット対象になる。conf/auth 配下と conf 直下の yaml / yml をサンプル以外除外する
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: git check-ignore で conf/auth/任意名.yaml と conf/任意名.yml が除外され、*.sample.yaml が除外されないことを確認している
  依存: []
  根拠: 2026-09-13の全体レビューで検出。除外範囲を広げる方向の変更で、既存の追跡ファイル（サンプル）には影響しない
- id: BL-011
  区分: 品質ゲート
  タスク内容: >-
    .eslintrc.js で no-undef を無効化しているため未定義変数を検出できない（reqlib のためと推測）。reqlib を globals に
    宣言して no-undef を有効化し、CommonJS に合わせ sourceType を script にする。.prettierrc.js の未知オプション
    skipStrings（Prettier が警告を出す）を削除する
  優先度: P3
  状態: 未着手
  担当: AIエージェント
  完了条件: ESLint が no-undef 有効で終了コード0、Prettier の check が警告なしで終了コード0
  依存: []
  根拠: 2026-09-13の全体レビューで検出。lint設定の変更で CI/CD 定義ではないため自律ループ内で対応可能
- id: BL-010
  区分: 不具合
  タスク内容: >-
    runPlaywright.exec と index.js に例外処理がなく、シナリオ実行中の例外でブラウザ・コンテキストを閉じずに
    未処理の Promise rejection として終了し、動画も保存されない。try/finally で後始末し、エラーを記録して終了コード1にする
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: 例外発生時もブラウザサーバーを閉じ、エラー内容をログ出力して process.exitCode が1になる実装になっている
  依存: []
  根拠: 2026-09-13の全体レビューで検出。正常系の挙動は変更しない
- id: BL-009
  区分: 不具合
  タスク内容: >-
    plCore.getArgs がモジュール変数 browserArgs へ直接 push するため呼び出しごとに引数が累積する。また proxyInfo に
    null（YAMLで proxyInfo の値を空にした場合）を与えると length 参照で例外になる。配列を複製し、空判定を isEmpty で行う
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: getArgs を2回呼んでも同一の引数配列が返り、proxyInfo が null / undefined / [] のとき --no-proxy-server が付く
  依存: []
  根拠: 2026-09-13の全体レビューで検出。1プロセス1実行の現行運用では累積は顕在化しないが、null による例外は設定次第で発生する
- id: BL-008
  区分: 不具合
  タスク内容: >-
    plUtil.readFileSync が YAML の構文エラー時にファイル内容の文字列をそのまま返し、空ファイルでは空文字列を返す。
    文字列がコンフィグへ展開（1文字ずつのキー）され、シナリオは1文字ずつ無視されて何も実行されない。
    読込失敗時は既定値を返し、index.js はシナリオファイルが無い・壊れている場合にエラーで終了する
  優先度: P2
  状態: 未着手
  担当: AIエージェント
  完了条件: >-
    YAML構文エラー・空ファイル・ファイル無しの各ケースで readFileSync が既定値を返し、index.js がシナリオ読込失敗時に
    エラーを出力して終了コード1でブラウザを起動せず終了する
  依存: []
  根拠: >-
    既定値の選択として、コンフィグとAuthのファイル無しは従来どおり継続（Authは任意ファイルのため）、構文エラーは
    設定ミスを黙って無視しないよう終了とする。ブラウザを起動しない方向の変更で外部影響はない
- id: BL-003
  区分: 品質ゲート
  タスク内容: >-
    page.operator は関数の型名に async を含む場合のみ await する。Playwright の実装形態（async 関数か、Promise を返す
    通常関数か）に依存し、通常関数で Promise を返すAPIでは未完了のまま次へ進み isStack に Promise が保持される
  優先度: P3
  状態: 未着手
  担当: AIエージェント
  完了条件: page.operator の戻り値を常に await し、isStack で解決済みの値を保持する
  依存: []
  根拠: >-
    起票時は不具合P1としたが、playwright 1.29.1 の Page.prototype を確認した結果、Promise を返すメソッドはすべて
    AsyncFunction で現状は await されていたため、依存ライブラリの実装変更への堅牢化としてP3へ訂正した。
    同期関数の戻り値に await しても値は変わらないため、既存シナリオへの互換性影響はない
- id: BL-001
  区分: 品質ゲート
  タスク内容: README.md と README_ja.md の既存 markdownlint 指摘（計38件、MD013/MD040/MD026/MD025）を解消する
  優先度: P3
  状態: 未着手
  担当: AIエージェント
  完了条件: CLAUDE.md「本リポジトリの品質ゲート定義」の Markdown 静的解析が Summary 0 issues で終了する
  依存: []
  根拠: >-
    品質ゲートを本リポジトリ向けに定義した時点で、main に既存の README 2ファイルのみが不合格だったため。
    利用者向け文書の書式修正はルール整備と目的が異なるので別ブランチで対応する
```

<!-- COPILOT_RECORDS:END -->
