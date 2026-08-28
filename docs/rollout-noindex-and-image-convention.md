# 他サイトへの展開手順(noindexスイッチ / 画像フォルダ規約)

生活サイト(NEVORA LIFESTYLE)で導入した2つの仕組みを、美容サイト・AIサイト・お金サイト・副業サイトへ同じ形で展開するための手順。**1サイトあたり15〜20分**を想定する。

対象サイトの `サイト運営\サイト本体` を「サイト本体」、プロジェクト直下を「ルート」と呼ぶ。

---

## A. noindexスイッチ(`NEXT_PUBLIC_NOINDEX=1` でメタ + robots.txt を切替)

独自ドメイン確定前・リニューアル中など、**サイト全体を検索結果から外したい期間だけ**環境変数1つで切り替えられるようにする仕組み。コードの変更は2ファイルのみ。

### A-1. `components/Layout.js`

既存の `{noindex && <meta ... />}` の行を次に置き換える。

```jsx
{/* サイト全体のnoindexスイッチ。独自ドメイン確定前など、検索結果に出したくない
    期間は環境変数 NEXT_PUBLIC_NOINDEX=1 を設定する(pages/robots.txt.jsと連動)。 */}
{(noindex || process.env.NEXT_PUBLIC_NOINDEX === "1") && (
  <meta name="robots" content="noindex, nofollow" />
)}
```

ページ側から渡す `noindex` プロパティ(404・記事0件の比較ページ等)はそのまま残す。**両者はORで効く**。

### A-2. `pages/robots.txt.js`

`const body = ...` を三項演算子に置き換える。

```js
// NEXT_PUBLIC_NOINDEX=1 のときはサイト全体をクロール拒否にする
// (components/Layout.jsのnoindex metaと連動。独自ドメイン確定前の暫定運用)。
const body =
  process.env.NEXT_PUBLIC_NOINDEX === "1"
    ? `User-agent: *
Disallow: /
`
    : `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;
```

### A-3. `.env.example` に説明を追記

```
# サイト全体をnoindexにするスイッチ(1で有効)。独自ドメイン確定前など、
# 検索結果に出したくない期間だけ 1 を設定する。robots.txtも Disallow: / になる。
NEXT_PUBLIC_NOINDEX=
```

### A-4. Vercelの環境変数を設定

Vercel → 対象プロジェクト → Settings → Environment Variables に
`NEXT_PUBLIC_NOINDEX` = `1`(Production / Preview / Development)を追加する。

> **`NEXT_PUBLIC_` 付きの環境変数はビルド時に値が埋め込まれる。** 追加・削除したあとは再デプロイしないと反映されない。

### A-5. 検証(デプロイ後)

```bash
curl -s https://<サイト>/robots.txt              # → User-agent: * / Disallow: /
curl -s https://<サイト>/ | grep 'name="robots"'  # → noindex, nofollow
```

### A-6. 解除するとき

Vercelの `NEXT_PUBLIC_NOINDEX` を**削除**(または空文字に)して再デプロイする。`0` を入れても解除されるが、意図が伝わりにくいので削除を推奨。**解除後はGoogle Search Consoleでサイトマップを再送信すること。**

---

## B. 画像フォルダ規約

### B-1. フォルダを作る

```
C:\Users\kokim\OneDrive\デスクトップ\画像フォルダ\各種サイト\{サイト名}\ライブラリ
├ 記事用          … 記事のサムネイル・本文画像の素材(image-selector / image-placer の対象)
├ ホームページ用  … ヒーロー・セクションバンド・カテゴリカードの素材(site-engineer の担当)
└ 使用済み        … 記事に配置済みの元画像の退避先
```

- `{サイト名}` は `美容サイト` `AIサイト` `お金サイト` `副業サイト` `生活サイト` のいずれか
- `CATALOG.md` は**ライブラリ直下**(3フォルダと同階層)に置く
- 既存の画像は中身に応じて `記事用` / `ホームページ用` へ振り分ける

### B-2. エージェント定義を書き換える

`ルート\.claude\agents\image-selector.md` と `image-placer.md` の、画像ライブラリのパスを次の形に統一する。

- 記事用の走査先: `C:\Users\kokim\OneDrive\デスクトップ\画像フォルダ\各種サイト\{サイト名}\ライブラリ\記事用`
- 使用済みの退避先: 同ライブラリ直下の `使用済み`

さらに両ファイルの末尾に、生活サイトと同じ **「## 画像フォルダの規約(全サイト共通)」** の節をそのままコピーする(`{サイト名}` はプレースホルダーのままでよい。差し替えずに済む書き方にしてある)。あわせて次の2点を明記する。

- このエージェントが走査・使用してよいのは `記事用` のみ
- `ホームページ用` の素材は記事に転用しない

### B-3. トップページ素材の生成スクリプト

`サイト本体\scripts\generate-site-images.js` の `SRC_DIR` を `...\ライブラリ\ホームページ用` に変更する。

```js
const SRC_DIR =
  "c:/Users/kokim/OneDrive/デスクトップ/画像フォルダ/各種サイト/{サイト名}/ライブラリ/ホームページ用";
```

MANIFESTの `src` は、ChatGPTの既定ファイル名のままにせず `home-hero.png` `band-01.png` `category-xxx.png` のような**意味の分かる名前**に統一しておくと、素材を差し替えるときに書き換えが不要になる。

> **注意(生活サイトで実際に踏んだ落とし穴)**
> 元画像の幅が変わると、生成される `-<幅>.webp` のファイル名も変わる。スクリプトは
> 「元画像より大きい幅は作らない」仕様のため、たとえば元画像1536pxなら `-1600.webp` は生成されない。
> **`components/HeroBanner.js` と `pages/index.js` の `srcSet` / `widths` を実ファイルに合わせて更新し、
> 古い幅のファイルを削除すること。** 消し忘れると、旧サイトの写真が配信され続ける。

### B-4. ドキュメントの追随

`ルート\docs\CONTRIBUTING.md` の画像運用の節にも同じパスを反映する。トップページ素材の場所・生成コマンド・元画像サイズは `サイト本体\README.md` に書いておく。

---

## チェックリスト(1サイト分)

- [ ] `components/Layout.js` のnoindex条件を追加
- [ ] `pages/robots.txt.js` を三項演算子に変更
- [ ] `.env.example` に `NEXT_PUBLIC_NOINDEX` を追記
- [ ] Vercelに `NEXT_PUBLIC_NOINDEX=1` を追加 → 再デプロイ
- [ ] `curl` で robots.txt とmetaタグを確認
- [ ] 画像ライブラリに `記事用` / `ホームページ用` / `使用済み` を作成し既存画像を振り分け
- [ ] `image-selector.md` / `image-placer.md` のパス修正 + 規約の節を追加
- [ ] `generate-site-images.js` の `SRC_DIR` 変更、srcsetの幅と実ファイルの一致を確認
- [ ] `docs/CONTRIBUTING.md` / `サイト本体/README.md` を更新
- [ ] commit + push(Vercelの自動デプロイで反映。`vercel` CLIからの手動デプロイは行わない)
