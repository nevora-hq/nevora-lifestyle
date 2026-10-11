# run-local.js の self-test の停止の記録

## 今の状態

(記録なし)

## 状態

`node scripts/autonomy/run-local.js start`(`--revise`含む)は、入口の self-test(判定条件の自己テスト)が不合格になると、`overall: "中止"`で終了する。これはバグではなく、全記事見直し・ルール改修の期間中の意図的な状態である。

## 不合格の内容

(記録なし)

## 原因

self-testの期待値(`scripts/autonomy/self-test.js`・`self-test-fixtures/`)は、`verify-article.js`側の仕様変更(項目の「廃止・永久欠番」化、「参考(非ブロッキング)」への移設など)に追随して更新する必要がある。追随していないと、「注入した違反が発火するはず」という期待と実装が食い違い、self-testが不合格になる。

## 再開条件

全記事見直し・ルール改修の期間が終わり、`run-local.js`(`start`・`--revise`とも)を記事の生成・修正の入口として再び使う際は、その前に以下を行う:

1. `scripts/autonomy/self-test.js`・`self-test-fixtures/`の期待値を、現在の`verify-article.js`の仕様(項目6=参考情報・項目8/22=廃止永久欠番)に合わせて更新する
2. 更新後、`node scripts/autonomy/run-local.js start --revise <既存記事のパス>`等でself-testが合格することを確認する

この2点が完了するまで、`run-local.js`経由での記事の生成・修正(自己テストを含む入口)は実行できない。2点がそろっても、`run-local.js` 経由の記事の生成・修正を再び使うかどうかは、依頼者が決める(合格の確認は、使えるようにする決定ではない)。この期間中の記事修正は「全記事見直し」の手順(`docs/pipeline/autonomy/FULL-REWRITE-PROCEDURE.md`、依頼者の目視確認+`scripts/ledger-add-visual-check.js`)を使う。

## 参照

- `docs/CONTRIBUTING.md` 40節
