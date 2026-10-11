# サイトレベル整合性監査

対象: `サイト運営/サイト本体/`
方針: 検出・一覧化のみ。コード編集は行わない。

## 1. ユーザー動線チェック(index → posts/[slug] → about → contact)

確認観点:
- `pages/index.js`: トップページから出ているリンク(`/worry`・`/worry/[slug]`・`/about`・`/ranking`・`/category`・`/category/[name]` など)が、すべて実在するページ/動的ルートに対応しているか。
- `pages/posts/[slug].js`: `/`・`/category/[category]`・`/about`・`/posts/[slug]`(次の記事・関連記事)・`/worry/[slug]` などへのリンクがすべて実在するか。`getWorryHref`経由のリンクが`pages/worry/[slug].js`に対応しているか。
- `pages/about.js` → `/contact`・`/terms`・`/privacy-policy` へのリンクがすべて実在するか。
- `pages/contact.js`: 外部送信APIを使わず`mailto:`リンクで連絡する設計なら、リンク切れの概念自体がない。

判定: 導線が矛盾なく閉じているか。

## 2. ヘッダー/フッター/共通コンポーネントの全内部リンク生存確認

確認観点:
- `components/Header.js`: `/`・`/category/[name]`(動的)・`/ranking`・`/compare`・`/search` などが、すべて`pages/`配下に実在するか。
- `components/Footer.js`: `/about`・`/privacy-policy`・`/terms`・`/contact` がすべて実在するか。
- `components/AdminLayout.js`: 管理画面メニュー(`/admin` と `pages/admin/` 配下の各ページ)が各ファイルと一致するか。管理画面は`noindex, nofollow`設定になっているか。
- `components/Sidebar.js`・`PostCard.js`・`ImageSlider.js` など、動的リンクを出す部品: `/posts/[slug]`・`/category/[name]`・`/worry`・`/worry/[slug]`への動的リンクに対応する動的ルートファイルが存在するか。
- 記事専用の本文差し替え部品(`components/` 等)があれば、本文中の記事間の直リンクのスラッグが`公開済み`フォルダに実在するか。
- 外部リンク:
  - `ArticleSources.js`の`source.url`(記事ごとの出典URL、動的・記事データ側で管理)
  - `ArticleToc.js`のアンカーリンク(`#id`、内部ページ内リンクのため対象外)
  - 部品の中に直接書かれた外部URL(`nofollow noopener noreferrer`付きか。件数が少なければ個別の生存確認は軽微扱い)

判定: 内部リンクがすべて生存しているか。

## 3. 404ページの品質確認 (`pages/404.js`)

- (a) 誘導リンク: トップページ・カテゴリ一覧(動的生成)・人気記事・検索ページへのリンクを備えるか。主要導線への誘導が十分か。
- (b) デザイン・文言: 「404」表示+状況説明+誘導セクションがあり、最低限の品質を満たすか。
- (c) noindex: `<Layout ... noindex ...>`で明示的に設定されているか。

## 4. 旧ドメイン表記(vercel.app)の残存確認

独自ドメインへ移行したあとに行う確認。このサイトは今は独自ドメインを持たず `https://nevora-lifestyle.vercel.app/` で公開しているので、移行するときに行う(移行の手順は`docs/domain-migration-plan.md`)。

Grep範囲: `pages/`・`components/`・`lib/`・`記事データ/公開済み`・`記事データ/公開待ち`・`next.config.js`・`pages/robots.txt.js`・`sitemap.xml.js`・`scripts/`・環境変数ファイル(キー名のみ)。

確認観点と判定の目安:

| ファイル | 内容 | 判定の目安 |
|---|---|---|
| `サイト運営/サイト本体/lib/siteLinks.js` | 姉妹サイトと自サイトの`vercel.app`URL | 姉妹サイトのURLは**問題なし**(当サイトの移行とは無関係。姉妹サイト側が独自ドメインに切替済みでない限り現状のURLが正しい)。ただし自サイト(nevora-lifestyle)の行は、移行時に新ドメインへ直す |
| `サイト運営/サイト本体/.env.local.example` | コメント例としての`NEXT_PUBLIC_SITE_URL`の値 | **軽微**(ローカル開発用のサンプル値。本番`.env.local`/Vercel環境変数には影響しないが、移行完了後は新ドメインに更新した方が紛らわしくない) |
| 記事データ配下の調査メモ(キーワード調査など) | リサーチメモ内の記載 | **対象外**(公開記事ではなく調査メモ。`公開済み`配下にあれば要修正) |
| 移行作業の記録・手順書(`docs/domain-migration-plan.md` 等) | 移行作業の記録・手順書としての記述 | **対象外**(ドキュメント内での言及は移行履歴として正当) |
| `サイト運営/実務/配信者/メモ/*.md` | 過去の公開作業メモ | **対象外**(作業ログ、コード・記事本文ではない) |
| `.env.example` | コメント例としての`your-site.vercel.app`(汎用プレースホルダー) | **対象外**(実際のドメイン名ではなく汎用例) |

**公開記事本文(公開済み配下)にvercel.app表記が残っていないか**、サイト本体コード(`pages/`・`components/`・`next.config.js`・`sitemap.xml.js`・`robots.txt`)に旧ドメインのハードコードが無いか(`NEXT_PUBLIC_SITE_URL`環境変数経由で一元管理されているか)を確かめる(このサイトでは `pages/about.js` と `scripts/generate-pinterest-pins.js` に自サイトのURLが直書きされている)。

## まとめ

| 分類 | 件数 |
|---|---|
| 重大(審査リスク) | |
| 中(修正推奨) | |
| 軽微 | |
