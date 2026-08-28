# 展開手順:インデックス制御スイッチ / 画像フォルダ規約

NEVORAの各サイト(美容・AI・お金・副業・生活)で共通化する2つの仕組みの導入手順。**1サイトあたり15〜20分**を想定する。

この文書はどのサイトのリポジトリからも参照できるよう、サイト固有の値をプレースホルダーで書いている。作業時は次のとおり読み替える。

| プレースホルダー | 意味 | 例 |
|---|---|---|
| `{サイト名}` | 画像フォルダ・作業フォルダのサイト名 | `生活サイト` |
| `{プロジェクトID}` | Vercelのプロジェクト名 | `nevora-lifestyle` |
| `{本番URL}` | 現時点の公開URL | `https://nevora-lifestyle.vercel.app` |
| ルート | プロジェクト直下(`CLAUDE.md` がある階層) | |
| サイト本体 | `サイト運営\サイト本体`(Next.jsプロジェクト) | |

参照実装: 副業サイト(この方式の標準)、生活サイト。

---

## A. インデックス制御スイッチ(`NEXT_PUBLIC_ALLOW_INDEX`)

**デフォルト非公開**の方式。環境変数が未設定の間はサイト全体が `noindex, nofollow` かつ `robots.txt` は `Disallow: /` になり、**正式公開時に `NEXT_PUBLIC_ALLOW_INDEX=1` を設定して解除**する。

noindex中も、**SNSのリンクプレビュー用クローラーだけは robots.txt で通す**。これらのクローラーもrobots.txtに従うため、全面Disallowにするとシェア時のOGPカードが表示されなくなり、公開前の確認ができなくなるため。

コードの変更は2ファイル。

### A-1. `components/Layout.js`

import群の下(コンポーネント定義の外)にフラグを1つ置く。

```jsx
// ドメイン確定前の暫定公開ではサイト全体をnoindexにする(検索結果に載せない)。
// 正式公開時に、Vercelの環境変数で NEXT_PUBLIC_ALLOW_INDEX=1 を設定すれば解除される。
// pages/robots.txt.js も同じフラグを見ているので、両方まとめて切り替わる。
const SITE_NOINDEX = process.env.NEXT_PUBLIC_ALLOW_INDEX !== "1";
```

`<Head>` 内の既存の `{noindex && <meta ... />}` を次に置き換える。

```jsx
{(noindex || SITE_NOINDEX) && <meta name="robots" content="noindex, nofollow" />}
```

ページ側から渡す `noindex` プロパティ(404・記事0件の比較ページ等)はそのまま残す。**両者はORで効く**ため、公開後もページ単位のnoindexは維持される。

### A-2. `pages/robots.txt.js`

`getServerSideProps` 内の `const body = ...` を次に置き換える。

```js
  // ドメイン確定前の暫定公開ではサイト全体をクロール拒否にする。
  // components/Layout.js のnoindexメタと同じフラグで切り替わる。
  // 正式公開時にVercelの環境変数で NEXT_PUBLIC_ALLOW_INDEX=1 を設定すると解除される。
  const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEX === "1";

  const body = allowIndex
    ? `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`
    : // 検索エンジンには拾わせないが、SNSのリンクプレビュー用クローラーだけは通す。
      // (これらもrobots.txtに従うため、全面Disallowにするとカード画像が出なくなる)
      `User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Facebot
Allow: /

User-agent: Slackbot-LinkExpanding
Allow: /

User-agent: Discordbot
Allow: /

User-agent: LINE
Allow: /

User-agent: *
Disallow: /
`;
```

### A-3. `.env.example` に説明を追記

```
# 検索エンジンへのインデックスを許可するスイッチ(1で許可)。
# 未設定の間はサイト全体が noindex, nofollow + robots.txt の Disallow: / になる
# (デフォルト非公開)。独自ドメインが確定して正式公開する段階で 1 を設定する。
# noindex中も、SNSのリンクプレビュー用クローラー(Twitterbot・facebookexternalhit・
# Facebot・Slackbot-LinkExpanding・Discordbot・LINE)だけはrobots.txtで許可している。
NEXT_PUBLIC_ALLOW_INDEX=
```

### A-4. Vercelの環境変数

- **公開前(通常はこの状態)**: 何も設定しない。旧方式の `NEXT_PUBLIC_NOINDEX` が残っている場合は**削除する**(この方式では参照されないため、残っていても効かず紛らわしい)
- **正式公開時**: `NEXT_PUBLIC_ALLOW_INDEX` = `1` を Production / Preview / Development に追加

> **`NEXT_PUBLIC_` 付きの環境変数はビルド時に値が埋め込まれる。** 追加・削除したあとは再デプロイしないと反映されない(`git push` による自動デプロイでよい)。

### A-5. 検証(デプロイ後)

```bash
curl -s {本番URL}/robots.txt                     # → SNSクローラーのAllow群 + User-agent: * / Disallow: /
curl -s {本番URL}/ | grep 'name="robots"'         # → noindex, nofollow
```

解除後は、逆に `Allow: /` と `Sitemap:` 行が出ること、metaタグが**出ないこと**を同じコマンドで確認する。

### A-6. 正式公開の手順

1. Vercelに `NEXT_PUBLIC_ALLOW_INDEX=1` を追加
2. 再デプロイ(空コミットのpushでよい)
3. A-5のコマンドで解除を確認
4. **Google Search Consoleでサイトマップを再送信する**

---

## B. 画像フォルダ規約

### B-1. フォルダを作る

```
C:\Users\kokim\OneDrive\デスクトップ\画像フォルダ\各種サイト\{サイト名}\ライブラリ
├ 記事用          … 記事のサムネイル・本文画像の素材(image-selector / image-placer の対象)
├ ホームページ用  … ヒーロー・セクションバンド・カテゴリカード・ロゴ等の素材(site-engineer の担当)
└ 使用済み        … 記事に配置済みの元画像の退避先
```

- `CATALOG.md` は**ライブラリ直下**(3フォルダと同階層)に置く
- 既存の画像は中身に応じて `記事用` / `ホームページ用` へ振り分ける

### B-2. エージェント定義を書き換える

`ルート\.claude\agents\image-selector.md` と `image-placer.md` の画像ライブラリのパスを次の形に統一する。

- 記事用の走査先: `C:\Users\kokim\OneDrive\デスクトップ\画像フォルダ\各種サイト\{サイト名}\ライブラリ\記事用`
- 使用済みの退避先: 同ライブラリ直下の `使用済み`

さらに両ファイルの末尾に **「## 画像フォルダの規約(全サイト共通)」** の節を追加する(生活サイトの同ファイルからそのままコピーできる。`{サイト名}` はプレースホルダーのままでよい書き方にしてある)。次の2点を必ず含める。

- このエージェントが走査・使用してよいのは `記事用` のみ
- `ホームページ用` の素材は記事に転用しない

### B-3. トップページ素材の生成スクリプト

`サイト本体\scripts\generate-site-images.js` の `SRC_DIR` を `ホームページ用` に向ける。

```js
const SRC_DIR =
  "c:/Users/kokim/OneDrive/デスクトップ/画像フォルダ/各種サイト/{サイト名}/ライブラリ/ホームページ用";
```

MANIFESTの `src` は、ChatGPTの既定ファイル名(`ChatGPT Image ....png`)のままにせず `home-hero.png` `band-01.png` `category-xxx.png` のような**意味の分かる名前**に統一しておくと、素材を差し替えるときにスクリプトの書き換えが不要になる。

> **注意(実際に踏んだ落とし穴)**
> 元画像の幅が変わると、生成される `-<幅>.webp` のファイル名も変わる。スクリプトは
> 「元画像より大きい幅は作らない」仕様のため、たとえば元画像1536pxなら `-1600.webp` は生成されない。
> **`components/HeroBanner.js` と `pages/index.js` の `srcSet` / `widths` を実ファイルに合わせて更新し、
> 古い幅のファイルを削除すること。** 消し忘れると、旧サイトの写真が配信され続ける。

### B-4. ドキュメントの追随

`ルート\docs\CONTRIBUTING.md` の画像運用の節にも同じパスを反映する。トップページ素材の場所・生成コマンド・元画像サイズは `サイト本体\README.md` に書いておく。

---

## チェックリスト(1サイト分)

- [ ] `components/Layout.js` に `SITE_NOINDEX` を追加し、metaタグの条件を `(noindex || SITE_NOINDEX)` に変更
- [ ] `pages/robots.txt.js` を `allowIndex` の分岐(SNSクローラーのAllow群を含む)に変更
- [ ] `.env.example` に `NEXT_PUBLIC_ALLOW_INDEX` を追記
- [ ] Vercelに旧 `NEXT_PUBLIC_NOINDEX` が残っていれば削除
- [ ] commit + push(自動デプロイ)→ `curl` で robots.txt とmetaタグを確認
- [ ] 画像ライブラリに `記事用` / `ホームページ用` / `使用済み` を作成し既存画像を振り分け
- [ ] `image-selector.md` / `image-placer.md` のパス修正 + 規約の節を追加
- [ ] `generate-site-images.js` の `SRC_DIR` 変更、srcsetの幅と実ファイルの一致を確認
- [ ] `docs/CONTRIBUTING.md` / `サイト本体/README.md` を更新

> デプロイは **GitHubへの push によるVercelの自動デプロイのみ**を正規の手段とする。`vercel` CLIからの手動デプロイ(`vercel --prod` 等)は行わない(ルートの `CLAUDE.md` 参照)。
