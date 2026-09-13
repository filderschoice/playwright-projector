# CLAUDE.md

Claude Code が本リポジトリ（playwright-projector: YAMLのコンフィグとシナリオで Playwright を操作する
Node.js 製CLI）で作業するときの実行ルールです。セッション開始時に自動読み込みされます。

**共通規約の正本は [`.github/copilot-instructions.md`](.github/copilot-instructions.md) です**（全エージェント共通。
コードベースの前提・実行コマンド・変更時の制約も同ファイル）。下記 `@import` で同時に読み込まれます。
本ファイルには Claude Code 固有の差分と追加規約のみを置き、共通規約と矛盾する場合は本ファイルを優先します。

@rules/guardrails-unified.v1.md
@.github/copilot-instructions.md

その他の文書は常時読み込みせず、共通規約「参照するドキュメント」の表に従って必要時に読みます。

## 共通規約に対する Claude Code 固有の差分（MUST）

| 項目 | 共通規約 | Claude Code での差分 |
| --- | --- | --- |
| git操作 | エージェントは実行せず、コマンド例のみ提示する | 「自律ループ実行モード」中の作業ブランチへの `git add` / `git commit` のみ例外。`git push` は常にユーザーが実行する |
| 1ブランチ1目的の例外 | `BACKLOG.md` の複数項目の一括対応のみ | 「自律ループ実行モード」も例外。対象タスクの `id` をブランチ名・コミット本文・PR説明へ列挙する |
| 指示参照の優先順位 1位 | エージェントのシステム指示 | Claude Code ハーネスのシステムプロンプト |
| PR説明文・コードレビュー | `.github/instructions/pr.instructions.md` に従う | 自動適用の機構が無いため、生成時に**同ファイルを明示的に読んでから**従う |
| 記録ファイルの編集権限 | 規定なし | `.claude/settings.json` の `permissions.allow` で権限プロンプトなしに反映される（下記） |

## 本リポジトリの品質ゲート定義（MUST）

共通規約「品質ゲート」の具体コマンドと合否基準です。**全エージェント共通の正本**で、自律ループ実行モードでは
各イテレーションで実行して記録へ残します。ESLint / Prettier は事前に `npm ci` が必要です。

| ゲート | コマンド | 合否基準 |
| --- | --- | --- |
| 静的解析（JavaScript） | `npx --no-install eslint index.js src` | 終了コード0 |
| フォーマット（JavaScript） | `npx --no-install prettier --check index.js src` | 終了コード0 |
| 静的解析（Markdown） | `npx markdownlint-cli2 "**/*.md" ".claude/**/*.md" ".github/**/*.md" "#node_modules"` | `Summary: 0 issues` |
| 記録ファイルのYAML検証 | `docs/records/spec/FORMAT.md`「YAMLとしての体裁」に従いマーカー内を `yaml.safe_load` へ通す | 例外なく読み込めること |
| 脆弱性チェック | `npm audit --omit=dev` | 判定基準は未定義（未確認）。結果と件数を記録し、新規の high 以上は `BACKLOG.md` へ起票する |
| 単体テスト | (対象外) | テストが存在しない（`npm test` はプレースホルダで必ず失敗する）。テストを追加した場合は本表を更新する |
| 実行確認 | `npm start` | 自動ゲートに含めない。実ブラウザ起動と外部サイトへのアクセスを伴うため人手検証とする |

- `--no-install` を外さないこと。未インストール時に npx が最新版（ESLint 9 以降）を取得し、
  `.eslintrc.js`（ESLint 8 形式）を読まずに誤判定する。
- `**/*.md` はドット始まりのディレクトリを拾わないため、`.claude/` と `.github/` を明示している。
- `区分: 人手検証` のBACKLOGタスクは自動品質ゲートの合否判定から除外する。

## 記録ファイルの権限設定（MUST）

`docs/records/managed/` 配下の3ファイルは `.claude/settings.json` の `permissions.allow` により権限プロンプトなしで
編集できます。記録ファイルは人手編集を前提とせず、妥当性はコミット前の差分確認と `FORMAT.md` 準拠で担保するためです。
それ以外（ルールファイル・`.github/`・`FORMAT.md`・ソースコード）の編集は従来どおり確認を挟みます。

## 自律ループ実行モード（Loop Engineering）

ユーザーの明示指示により、人の応答を待たずに複数イテレーションを連続実行する Claude Code 固有のモードです
（Copilot は対象外）。統制要件（許可・禁止操作、停止条件、秘密情報）は `rules/guardrails-unified.v1.md`
セクション12、ブランチ・コミット規約は `CONTRIBUTING.md` の同名節が正本です。

- **適用条件（MUST）**: ユーザーが開始を明示的に指示し、その指示のスコープ内に限る。ループ終了で通常の対話モードへ
  戻る。満たさない場合は `git add` / `git commit` を実行してはならない。
- **起動方法（MUST）**: Skill `autonomous-loop` を起動し、その手順に従う。手順を記憶や推測で代用しない。
- **本リポジトリでの読み替え（MUST）**: `npm start` による実行確認と `conf/auth/plAuth.yaml` の実資格情報を使う検証は
  `区分: 人手検証` として記録し、ループ内で実行しない（guardrails 12.5）。

## 保守

共通規約の変更は `.github/copilot-instructions.md` へ、Claude Code 固有の変更は本ファイルへ反映します
（役割分担の正本は `CONTRIBUTING.md`「エージェント指示ファイルの構成規約」）。
