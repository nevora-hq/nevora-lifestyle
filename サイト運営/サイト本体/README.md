# サイト本体(NEVORA 生活を豊かにする総合ガイド)

このフォルダはWebサイト本体(Next.js / Pages Router)です。画面・機能の実装は `site-engineer` サブエージェントが担当する。

## 技術方針

- フレームワーク: Next.js(React)
- コード管理: GitHub
- ホスティング: Vercel(無料枠でデプロイ。Gitへのpushで自動デプロイされる)
- ドメイン: 当面はVercelが発行する `*.vercel.app` を使用し、後日独自ドメインを購入してVercelに接続する
- 記事データ: 当面はMarkdownファイル(frontmatterに `title` / `category` / `tags` / `affiliateLinks` 等を持たせる)で管理し、`サイト運営\記事データ\確定稿\` から本サイトのcontentディレクトリへ配置する
- データベース: 記事数・機能が増え、Markdown管理では厳しくなった段階で導入(例: Vercel Postgres等)。導入時期・方式は`site-engineer`が提案する

## サイト構成(サイトマップ)

```
Webサイト
├ トップページ
├ 記事ページ
├ カテゴリページ         … 家事/掃除/洗濯/収納/節約/食/住まい等でジャンル分け
├ 比較ページ             … 商品・サービスの比較コンテンツ(アフィリエイト訴求)
├ ランキングページ       … おすすめ商品・記事のランキング
├ 検索機能
├ 管理者ダッシュボード
│  ├ 記事管理           … 記事の作成・編集・公開管理
│  ├ 広告管理           … アフィリエイトリンク・広告枠の管理
│  ├ アクセス解析       … PV・検索順位・CTR等の可視化
│  ├ SEO管理            … メタ情報・内部リンク・構造化データ管理
│  └ AI自動更新         … AIエージェントによるコンテンツ自動更新の管理
└ データベース
```

## 実装時の役割分担

- 記事コンテンツそのもの(執筆・編集・公開判定・法務チェック)は `.claude\agents` 配下の各エージェントが担当する
- サイトの機能・画面・管理者ダッシュボード等の実装は `site-engineer` エージェントが担当する
- 記事の確定稿をサイトへ反映する作業(Git commit・push)は `publisher` エージェントが担当する

## アクセス解析の導入基盤(GA4 / GSC)

実際のトラッキングID・確認コードは未取得のため、「IDを環境変数に設定するだけで有効になる」仕組みだけを先に用意している。

### Google Analytics 4(GA4)

- 実装箇所: `lib/gtag.js`(計測IDの読み込み・有効判定・ページビュー送信処理)、`pages/_app.js`(gtag.jsスクリプトの読み込み、ページ遷移ごとのページビュー送信)
- 環境変数: `NEXT_PUBLIC_GA_MEASUREMENT_ID`(`.env.example` にプレースホルダーあり)
- 未設定時の挙動: スクリプト自体を出力しない(空のIDが送信されることはない)。また `NODE_ENV=production` の場合のみ有効になり、開発環境では計測しない
- 今後の設定手順:
  1. Googleアナリティクスでアカウント・プロパティ・データストリーム(ウェブ)を作成し、「G-XXXXXXXXXX」形式の測定IDを取得する
  2. Vercelのプロジェクト設定 → Environment Variables に `NEXT_PUBLIC_GA_MEASUREMENT_ID` を追加し、取得したIDを設定する
  3. 再デプロイ(または次回のGit push時の自動デプロイ)で計測が有効になる

### Google Search Console(GSC)

- 実装箇所: `pages/_document.js`(所有権確認用metaタグの出力)
- 環境変数: `NEXT_PUBLIC_GSC_VERIFICATION`(`.env.example` にプレースホルダーあり)。GSCの「HTMLタグ」確認方式で発行される `content="..."` の値のみを設定する
- 未設定時の挙動: metaタグ自体を出力しない
- HTMLファイル確認方式を使う場合: GSCで発行されるHTMLファイルを `public/` フォルダ直下に置くだけでよい(Next.jsは `public/` 配下のファイルをそのままルートURLで配信するため追加設定不要)
- 今後の設定手順:
  1. Google Search Consoleでプロパティ(サイトURL)を追加する
  2. 所有権の確認方法として「HTMLタグ」を選び、発行された `content="..."` の値をコピーする
  3. Vercelの環境変数に `NEXT_PUBLIC_GSC_VERIFICATION` を追加し、コピーした値を設定して再デプロイする
  4. GSC側で「確認」を実行する

## ローカルでcanonical・og:urlを検証する

`NEXT_PUBLIC_SITE_URL` が未設定だと `components/Layout.js` の実装上、canonical・og:url・構造化データのタグ自体が出力されず、ローカルでは正しいURLが出ているか確認できない(本番Vercelの環境変数には設定済み)。ローカルで検証する場合は以下の手順で設定する。

1. `.env.local.example` の内容(`NEXT_PUBLIC_SITE_URL=https://nevora-lifestyle.vercel.app`)を `.env.local` に追記する(無ければ `.env.local.example` をコピーしてもよい)
2. `npm run build` を実行し、`.next/server/pages/about.html` 等の出力HTML内で `<link rel="canonical" ...>` と `<meta property="og:url" ...>` が正しいURL(例: `https://nevora-lifestyle.vercel.app/about`)になっていることを確認する

## お問い合わせ(メール直行)

- 実装箇所: `pages/contact.js`
- **入力フォームは設置しない。** `nevora01123@gmail.com` の明示と `mailto:` リンク(件名・記入項目入りの下書きが開く)だけで構成する
- **外部のフォーム配信サービス(Formspree・Web3Forms等)は利用しない方針。** 2026-08-28にFormspreeを廃止し、環境変数・プライバシーポリシーの記述も削除済み。フォームを復活させる場合はプライバシーポリシー(第三者への送信・保管の記載)の更新が必須になるため、方針を変えるときは必ずセットで行うこと

## アフィリエイトASP(A8.net等)提携の今後の設定手順

公開済み記事内には `AFFILIATE_LINK_PLACEHOLDER` 形式のプレースホルダーでリンク挿入箇所を用意済み。実際のASP提携完了後、以下の手順でプレースホルダーを実リンクに差し替える。

1. ASP(A8.net、もしもアフィリエイト等)に会員登録し、審査を申し込む(会社名/サイトURL/運営者情報等の入力が必要。個人情報の入力はユーザー自身で行う)
2. 審査通過後、掲載したい商品・サービスの提携申請を行い、承認されたら発行される広告リンク(URLまたはタグ)を取得する
3. `サイト運営\記事データ\公開済み` および `サイト本体\content\articles` 配下の該当記事内で `AFFILIATE_LINK_PLACEHOLDER` を検索し、取得したリンクに差し替える
4. 差し替え後は法務チェック(薬機法・景表法・アフィリエイト表示の明示)を再度通してから、publisherエージェント経由でgit commit・push する

## 公開キュー(記事の公開ペース自動制御)

生成済み記事を一括公開せず、週2〜3本(1日1本まで)に分散して公開する仕組み。

| コマンド | 内容 |
| --- | --- |
| `npm run queue -- --weekly-min 2 --weekly-max 3` | `記事データ/公開待ち` の未割当記事に公開予定日時(`publishAt`)を採番。ファイル名の日付プレフィックスと `date` も公開予定日に揃える。`--dry-run` で確認のみ、`--start YYYY-MM-DD` で開始日指定 |
| `npm run queue:status` | 在庫本数・今後7日間の公開予定(休載日含む)・在庫枯渇予定日を表示。`-- --days 14` で期間変更 |
| `npm run queue:release` | 公開時刻の到来した記事を `確定稿/` へ移動(GitHub Actions が30分おきに自動実行) |

- スケジュール: 公開は1日1本まで、カレンダー週ごとに2〜3日(乱数)公開。公開曜日は火・金を軸に、3日目は月・土から選ぶ。時刻は7〜22時(乱数)。休載は週4〜5日になる
- 水曜はキューが使わない。週1本の「編集部集計記事」を水曜に手動公開する運用のため、曜日レベルでキューと分離している(手動公開は `確定稿/` へ直接コミットする。queue系スクリプトは `公開待ち/` 配下にしか書き込まないため共存して問題ない)
- 未公開の記事は `記事データ/公開待ち` にあり、`sync-content.js` の同期対象外のためサイト・sitemap のいずれにも出ない。`確定稿` に誤って置かれた場合も `publishAt` が未来ならスキップされる
- 公開の反映は `.github/workflows/publish-queue.yml` が commit・push し、Vercel の自動デプロイで行う(手動の vercel CLI は使わない)。ジョブが失敗した場合は `publish-queue` ラベル付きの Issue が自動で立つ
- 記事の公開日(表示・sitemap・JSON-LD の `datePublished`)は、`queue:release` が動いた**実際の公開日**になる

## トップページの写真素材

元画像(PNG)は次のフォルダで管理し、`scripts/generate-site-images.js`のMANIFESTでファイル名を対応付けてwebpへ変換する。

```
C:\Users\kokim\OneDrive\デスクトップ\画像フォルダ\各種サイト\{サイト名}\ライブラリ\ホームページ用
```

- 生成コマンド: `node scripts/generate-site-images.js`(`hero` `band` `category` のようにキー前方一致で絞り込み可)
- 元画像は1536×1024(横長3:2)で用意する。srcsetの最大幅は元画像幅に丸められるため、幅を変える場合は`components/HeroBanner.js`・`pages/index.js`の`widths`/`srcSet`も合わせて更新すること
- 記事用の画像は同じライブラリの`記事用`フォルダで管理し、image-selector / image-placerが担当する
