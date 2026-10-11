# NEVORA 公開済み記事ステータス一覧

`サイト運営/記事データ/公開済み` → (`npm run sync-content`) → `サイト運営/サイト本体/content/articles`
に存在する全記事について、専用実装(lib)・使用中のchart type・画像枚数・
`scripts/verify-article.js`による9項目検証の結果をまとめる。

- 生成日: (生成したら日付と、再生成した場合はその理由を書く)
- 対象: `content/articles/*.md` 全件(`npm run sync-content`実行直後の状態)
- 検証コマンド: `node scripts/verify-article.js <記事Markdownパス>`
- 表の並び順: frontmatterの`date`昇順(公開日が無い記事は先頭)

## 列の定義

- **専用libファイル**: その記事のためだけに作られた`lib/*.js`(記事名を含むコメントで
  「〇〇記事専用」と明記されているファイル)。汎用実装(`bar`/`stat`/`pie`・`donut`/
  `prosCons`/`quadrant`/`steps`/`checklist`/`summaryCard`/`compareCards`等、`lib/posts.js`
  本体に実装されている汎用chart type)のみを使う記事は「なし」
- **使用中のchart type**: frontmatterの`charts[].type`のユニーク一覧(重複除去、出現順)。
  `type`省略時はサイト側の実装で棒グラフとして描画されるため`bar`と表記する
- **画像枚数(サムネ/本文)**: `thumbnail`フィールドの有無(0/1)と、本文中の
  Markdown画像記法`![alt](path)`の出現数(HTMLコメント内は除外)
- **9項目検証の結果**: `Yes`=9項目すべて合格。`No(n,m,...)`=Noだった項目番号
  (項目の意味は下記「9項目の定義」を参照)

## 9項目の定義(`scripts/verify-article.js`)

| # | 項目名 |
|---|---|
| 1 | afterHeadingの見出し一致 |
| 2 | アコーディオンの本文重複 |
| 3 | chartsの数(2件以上) |
| 4 | 装飾要素の合計使用数(6件以上) |
| 5 | NEVORAポイントの文字数(80字以内) |
| 6 | NEVORAポイント内のハイライト |
| 7 | 連続プレーンテキストの上限(200字以内) |
| 8 | H2セクションごとの視覚要素 |
| 9 | 未変換の装飾記号(2026-08-09追加) |

---

## 記事一覧

| 記事slug | 公開日 | 専用libファイル | 使用中のchart type | 画像枚数(サムネ/本文) | 9項目検証の結果 |
|---|---|---|---|---|---|
(記録なし)

---

## 集計

- **専用lib実装の記事数**(記事名→専用libファイルの対応)
- **9項目すべてYesの記事数**(記事名の一覧)
- **No項目数ごとの記事数**
- **項目別No集計(該当記事数)**(最多の項目と、その内訳の傾向)

**注意**: `lib/posts.js`にslug固有のH2セクション背景交互化ラッパー(`wrapXxxSections`)を
持つ記事に、frontmatterの汎用`sectionAlternate: true`を追加すると二重ラップでHTML構造が
破綻する(詳細は`.claude/agents/writer.md`・`nevora-pipeline-verifier.md`参照)。sectionAlternate は使わない(writer.md の同じ決定)。
専用libの記事を記録するときは、このラッパーを持つかどうかもあわせて書く。

## 補足・既知の注意点

- 既知の欠陥を「修正しない・記録のみ」と決めた記事(例: `date`欠落)は、本表でも未修正のまま
  記録する(`date`欠落なら`(dateなし)`と表記する)。
- 本表作成時は`npm run sync-content`を実行して`content/articles/`を
  `記事データ/公開済み`と同期させたうえで集計する。`content/articles/`は
  生成物であり直接編集しないこと(`scripts/sync-content.js`のコメント参照)。
- 前回版がある場合は、前回版との差分(検証項目の変更・Yes/Noが変わった記事とその理由)を書く。
