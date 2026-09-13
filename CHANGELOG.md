# 変更履歴

このリポジトリの主要な変更は本ファイルに記録します。

## 2026-09-13（自律ループによる全体レビュー）

ソースコード（`index.js`・`src/`）と設定（lint・Prettier・`.gitignore`・`conf/*.sample.yaml`・`package.json`）を
全体レビューし、指摘事項を `docs/records/managed/BACKLOG.md` へ起票しました。コード修正を伴う対応は
`docs/records/managed/EXECUTE.md` に記録します。

- `BACKLOG.md`: レビュー指摘として BL-003〜BL-020 を起票（不具合8件、品質ゲート6件、人手検証3件、要確認1件、
  ブロック1件）。既存の BL-002 を js-yaml（BL-002）と playwright（BL-018、実行確認は BL-019）に分割
- `.gitignore`（BL-012）: `conf/` 直下・`conf/auth/`・`conf/custom/` の `*.yaml` / `*.yml` をサンプル（`*.sample.yaml`）以外
  すべて除外するよう拡大。`-a` / `-c` で別名の認証ファイルを使った場合もコミット対象にならない。
  検証は `git check-ignore --no-index`（別名6件が除外、サンプル3件と `.gitkeep` が追跡可能）と
  `git ls-files -ci --exclude-standard conf`（除外に該当する追跡済みファイルが0件）で実施
- `README.md` / `README_ja.md`（BL-001）: markdownlint の既存指摘38件を解消（長い行の折り返し、コードブロックの言語指定、
  見出し末尾の句読点、`README.md` の `# # Installation` を `## Installation` へ修正、区切り行の列数が合わず表として
  解釈されていなかったコンフィグパラメータ表の修正）。記載内容は変更していない。Markdown 静的解析が `Summary: 0 issues` になった

## 2026-09-13（エージェント指示の本リポジトリ向け最適化）

規範（禁止事項・承認要件）そのものの追加・削除はありません。配布元テンプレート由来の記述を本リポジトリの実態へ合わせ、
重複を削減しました。

- `CLAUDE.md`: 品質ゲートを本リポジトリ（Node.js CLI）向けに再定義（ESLint・Prettier・Markdownlint・記録ファイルYAML・
  `npm audit`。存在しない `scripts/package-rules.ps1` と「実行コードを持たない」前提を削除）。自律ループ実行モードの節を
  圧縮し、`npm start` と実資格情報を使う検証を人手検証とする読み替えを追加
- `.github/copilot-instructions.md`: 「本リポジトリの前提」節を新設（構成の入口、コマンド、`reqlib` によるモジュール解決、
  モジュールスコープの状態、シナリオ種別・設定キー追加時の README / サンプル同時更新、Authファイルの秘密情報、外部通信）。
  `FORMAT.md` と重複する記録ファイル規約、guardrails セクション11と重複する注記を削除
- `.claude/settings.json`: `CLAUDE.md` が前提としていた記録ファイル3件の編集許可を新規作成
- `CONTRIBUTING.md`: 存在しないワークフロー（`markdown-quality.yml.disabled`・`lychee-action`）と共有されていない
  `.vscode/` 設定への言及を実態に合わせて修正
- 常時読み込み量（`CLAUDE.md` + `@import` 2ファイル + skill description）: 31,743 → 33,756 bytes。
  `CLAUDE.md` は 6,609 → 5,764 bytes に減ったが、コードベース前提（従来は全く無かった）を共通規約へ追加したため合計は増加
