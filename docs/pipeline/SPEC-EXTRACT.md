> **【要再生成】この文書は美容サイト時点の`lib/posts.js`等を棚卸ししたものです。
> 生活サイト化(記事専用ウィジェット全廃・カテゴリ刷新)により内容が実装と一致しません。
> `nevora-spec-extractor`エージェントで再生成するまで、記載内容を根拠に使わないこと。**

# SPEC-EXTRACT

工程0(既存仕様の棚卸し)の成果物。`_source-spec-v1.md` §3.2 の章立てに従う。
**この工程で記事は1文字も書いていない。** 以下はすべて既存コード・既存記事の実地調査結果であり、設計の変更は行っていない。

対象リポジトリ: `c:\Users\kokim\OneDrive\デスクトップ\Webサイト`
サイト本体: `サイト運営\サイト本体\`(Next.js 16.2.10 / Pages Router)

---

## エグゼクティブサマリー(最重要所見)

詳細は各章に譲るが、`_source-spec-v1.md` の前提と実装が大きく異なる箇所が4点あるため、依頼者の判断を仰ぐ前提で先に要約する。

1. **記事ファイルは `.mdx` ではなく `.md`。JSX・Reactコンポーネントの直書きは一切できない。** remark→HTML文字列→`dangerouslySetInnerHTML` という流れで、記事本文に書けるのは素のMarkdown+YAML frontmatterのみ(§0, §2)。
2. **既存の「アコーディオン」「図解(VIS相当)」は、本文中に置くインライン・プレースホルダーではなく、frontmatterの配列(`accordions`/`charts`)を見出しテキストの完全一致(`afterHeading`)で本文に自動挿入する方式。** `_source-spec-v1.md` §2.2 が想定する「本文中に `[[TYPE:ID ...]]` を書いて後工程が置換する」という物理配置の仕組みは存在しない(§3, §4, §10)。
3. **`_source-spec-v1.md` §2.4 が例示する消費マーカー `{/* impl:VIS-01 */}` は、このプロジェクトでは機能しない。** 実際にremarkパイプラインへ通すと、コメントとして消えるどころか **`<p>{/* impl:VIS-01 */}</p>` としてそのまま画面に表示される**ことを実機検証で確認した。有効なコメント構文は標準HTMLコメント `<!-- -->` のみ(§8)。
4. **`VIS`(図解)に相当する既存の仕組みのうち、汎用的に再利用できるのは7種類のみ**(bar/stat/pie・donut/prosCons/quadrant/flowchart/lineChart)。それ以外の40種類以上の `chart.type` は、コード内コメントで「他記事では使用しない想定」と明記された**1記事専用の使い捨てSVG生成関数**(§4, §10)。
5. **汎用7種はすべてデータ表現型で、構造説明図(断面図・部位比較図など)を汎用的に生成できる型は無い。** 構造説明図そのものは`CrossSection`/`Diagram`系の1記事専用実装として11件存在する(§4.2に全件棚卸し、2026-08-08確認)が、いずれもパラメータ化されておらず他記事から再利用できない。新規コンポーネントは追加せず、該当する要求は`UNRESOLVED`として扱う運用にした(§4.2, §10。詳細手順は`.claude/skills/nevora-pipeline/nevora-visual.md`「既知のギャップ」節)。

---

## 0. 記事ファイルの基本情報(配置・形式・frontmatterスキーマ)

### 0.1 配置場所と形式

記事の「本当の」保存場所と、サイトが実際に読み込む場所は**別**である。

| 役割 | パス | 備考 |
|---|---|---|
| 編集用ソース(確定稿) | `サイト運営\記事データ\確定稿\*.md` | ライター・編集長が編集する場所 |
| 編集用ソース(公開済み) | `サイト運営\記事データ\公開済み\*.md` | Threads投稿後に確定稿から移動される(`サイト運営\サイト本体\scripts\sync-content.js:5`)。サイト掲載は継続 |
| サイトが実際に読む場所 | `サイト運営\サイト本体\content\articles\*.md` | **手編集禁止。次回同期で上書きされる**(`scripts/sync-content.js:9` コメント) |

`content/articles` は `npm run dev`(predev)・`npm run build`(prebuild)のたびに、確定稿+公開済みの内容で**まるごと削除→再コピー**される(`サイト運営\サイト本体\scripts\sync-content.js:14-33`、`package.json:7,9`)。実測: 確定稿56件+公開済み34件=90件が過不足なく `content/articles` に一致(ファイル名diff 0件、2026-08-08実測)。

拡張子は **`.md` のみ**。リポジトリ全体(`node_modules`除く)を検索したが `.mdx` は0件("サイト運営" 配下を再帰検索、2026-08-08実測)。したがってMDXコンパイラは存在せず、記事内にJSX/Reactコンポーネントを直接書く手段は無い(`サイト運営\サイト本体\lib\posts.js:1314-1318` で `remark().use(remarkGfm).use(remarkBreaks).use(remarkHtml)` を通し、結果を `dangerouslySetInnerHTML` で描画。生HTML/JSXはサニタイズで除去される。実機検証は§8参照)。

### 0.2 frontmatterフィールド

コード上の正規化処理(実質的なスキーマ定義)は `サイト運営\サイト本体\lib\posts.js:1172-1193`(`normalizeFrontmatter`)。デフォルト値が用意されているため未指定でもビルドは落ちないが、実記事90件(確定稿+公開済み)での出現率を実測し「事実上の必須/任意」を判定した。

| フィールド | コード上の扱い | 90件中の出現数 | 事実上の要否 |
|---|---|---|---|
| `title` | `lib/posts.js:1174` | 90/90 | 必須 |
| `description` | `lib/posts.js:1175` | 90/90 | 必須 |
| `category` | `lib/posts.js:1176`(未指定時`"未分類"`) | 90/90 | 必須 |
| `tags` | `lib/posts.js:1177` | 90/90 | 必須 |
| `thumbnail` | `lib/posts.js:1181` | 90/90 | 必須(ただしライターは書かなくてよい運用。§4参照) |
| `summaryPoints` | `lib/posts.js:1189` | 90/90 | 必須(事実上) |
| `targetReader` | `lib/posts.js:1190` | 90/90 | 必須(事実上) |
| `date` | `lib/posts.js:1179` | 89/90 | 準必須(欠落1件: `公開済み/2026-08-02_美顔器効果を感じない原因と選び方.md`。欠落時は新着順ソートで最古扱いになる`sortByDateDesc`, `lib/posts.js:1242-1248`) |
| `accordions` | `lib/posts.js:1197-1206`, `1327` | 86/90 | 高頻度(§3) |
| `charts` | `lib/posts.js:1325` | 80/90 | 高頻度(§4) |
| `mascotComment` | `lib/posts.js:1187` | 76/90 | 高頻度(美容ブランチのカテゴリのみ有効。§5) |
| `comparisonCriteria` | `lib/posts.js:1191` | 21/90 | 任意 |
| `skinType` | `lib/posts.js:1186` | 30/90 | 任意(肌タイプ基本記事専用の関連記事表示に使用、`pages/posts/[slug].js:40-46`) |
| `affiliateLinks` | `lib/posts.js:1178`, `normalizeAffiliateLinks:174-181` | 14/90 | 任意(ASP提携が確定した記事のみ) |
| `updatedDate` / `updated` | `lib/posts.js:1180` | 1/90 / 0/90 | 任意・ほぼ未使用 |
| `featured` / `popular` | `lib/posts.js:1184-1185` | 2/90 / 5/90 | 任意(手動ピック運用。memory: ホーム画面決定事項) |
| `checklists` / `conclusionCards` / `quickSummaryCard` | `lib/posts.js:1338-1357` | 各3/90 | 「前髪の巻き方完全ガイド」記事専用に2026-08-07導入。汎用ではあるがまだ1記事でしか使われていない |

`.claude\skills\ライター\web-article-writing\SKILL.md:12-25` にも簡易スキーマが明記されており(`title`/`description`/`category`/`tags`/`affiliateLinks`)、コード実測と矛盾しない。

### 0.3 直近に更新された記事3本(同一カテゴリ優先)

`確定稿`+`公開済み`を実ファイルの更新日時(mtime)でソートした結果、最上位3本は「頭皮かゆみフケシャンプー比較」(ヘアケア)・「ファンデーション崩れタイプ別比較」(コスメ)・「基礎化粧品の基本知識と肌質診断」(スキンケア)でカテゴリが揃わなかった。「同一カテゴリのものを優先」の指示に従い、**カテゴリ「スキンケア」で揃う上位3本**を採用した。

| 順位(全体) | パス | 更新日時(実測) | category |
|---|---|---|---|
| 1 | `サイト運営\記事データ\確定稿\2026-08-02_頭皮かゆみフケシャンプー比較.md` | 2026-08-08 00:07:57 | ヘアケア(対象外) |
| 2 | `サイト運営\記事データ\公開済み\2026-07-26_ファンデーション崩れタイプ別比較.md` | 2026-08-07 23:58:05 | コスメ(対象外) |
| **3** | **`サイト運営\記事データ\公開済み\2026-07-26_基礎化粧品の基本知識と肌質診断.md`** | **2026-08-07 23:53:59** | **スキンケア(採用)** |
| **4** | **`サイト運営\記事データ\公開済み\2026-07-26_くすみケア比較.md`** | **2026-08-07 23:48:11** | **スキンケア(採用)** |
| **6** | **`サイト運営\記事データ\公開済み\2026-07-21_メイクとスキンケアの相性.md`** | **2026-08-07 23:44:41** | **スキンケア(採用)** |

以降の章の実例・実測値はすべてこの3本から取っている。

> **決定事項(2026-08-08、依頼者承認)**: この3本を基準記事として固定する。生成した記事を参照元に昇格させる場合は人間の承認を要する。(詳細は `docs/pipeline/README.md` の決定事項ログ #7)

---

## 1. 独自記法カタログ

remarkは未知の記法をプレーンテキストとして通すため、`remark-html`適用後のHTML文字列に対して文字列置換で独自記法を実装している(`サイト運営\サイト本体\lib\posts.js:190-191` コメント)。以下は**網羅**。

### 1.1 インライン文字装飾(`applyInlineMarkup`, `lib/posts.js:192-198`)

| 記法 | 正確な書式 | 変換後HTML | 用途 | 根拠(パス:行) | 使用例(既存記事) |
|---|---|---|---|---|---|
| ハイライト | `==語句==` | `<mark class="hl">` | 強調したい語句(15字以内が目安、`.claude\skills\ライター\web-article-writing\SKILL.md:58`) | `lib/posts.js:194` | `公開済み/2026-07-26_基礎化粧品の基本知識と肌質診断.md:122` |
| 下線 | `++語句++` | `<u class="u-accent">` | ブランドカラー下線 | `lib/posts.js:195` | `確定稿/2026-08-05_アゼライン酸とは.md:176` |
| 強調(気づきの一文) | `^^一文^^` | `<span class="emotion-emphasis">` | 読者の認識が変わる一文を大きく・色付きで強調(30〜50字目安、`SKILL.md:62`) | `lib/posts.js:196` | `公開済み/2026-07-26_基礎化粧品の基本知識と肌質診断.md:131` |
| 出典注記 | `%%一文%%` | `<span class="article-note">` | 出典の信頼性・留意点の控えめな注記 | `lib/posts.js:197` | `公開済み/2026-07-26_基礎化粧品の基本知識と肌質診断.md:174` |

4記法とも正規表現が改行を許容しない(`[^=\n]` 等)ため、**マーク対象は同一行内に収める必要がある**(複数行にまたがる強調は不可)。

### 1.2 標準GFM(remark-gfm, `package.json:21`)

| 記法 | 用途 | 根拠 | 既存記事での実使用 |
|---|---|---|---|
| `**太字**` | 標準強調(ブランドカラー装飾済み、CSS側) | remark-gfm標準 | 多数(例: 上記記事:144-147の項目名) |
| `~~取消線~~` | 訂正・古い情報の明示(`SKILL.md:61`) | remark-gfm標準 | **該当なし**: 90記事を全件grepしたが実使用0件(コード上は有効、実例なし) |
| `\| 見出し \| 見出し \|` 形式の表 | 比較・まとめ表(§6で詳述) | remark-gfm標準 | 多数 |
| `- [ ] 項目` タスクリスト | チェックリスト | remark-gfm標準 | `公開済み/2026-07-26_基礎化粧品の基本知識と肌質診断.md:194-195` |

### 1.3 引用ブロックの特殊装飾(`enhanceAnnotationBlockquotes`, `lib/posts.js:206-232`)

`> `(blockquote)の**1行目のラベル文言が完全一致した場合のみ**、専用ボックスのdiv構造に変換する。1行目とそれに続く行の間に空行を入れない(remark-breaksで`<br>`結合される1つの`<p>`である必要がある)。5種類すべてを列挙する。

| ラベル(1行目) | 変換後 | 用途 | 根拠(行) | 使用例 |
|---|---|---|---|---|
| `⏱ 30秒でわかる` | `.quick-summary-box` | 記事冒頭の要点早見 | `lib/posts.js:208-212` | `公開済み/2026-07-26_くすみケア比較.md:169-173` |
| `🔍 結論だけ知りたい人へ` | `.quick-conclusion-box` | リード文直後の結論早見(`SKILL.md:83`) | `lib/posts.js:213-217` | `公開済み/2026-07-21_メイクとスキンケアの相性.md:79-82` |
| `💡 NEVORAポイント` | `.nevora-point-box` | 読者が見落としやすい補足(1記事1〜2個目安、`SKILL.md:73`) | `lib/posts.js:218-222` | `公開済み/2026-07-26_くすみケア比較.md:184-185` |
| `⚠️ 注意` | `.warning-box` | 誤解されやすい情報への注意喚起(`SKILL.md:75`) | `lib/posts.js:223-227` | `公開済み/2026-07-26_くすみケア比較.md:207-210` |
| `🎯 まとめカード` | `.azelaic-summary-card` | 記事末尾のまとめ | `lib/posts.js:228-232` | `確定稿/2026-08-05_アゼライン酸とは.md:174-178` |

**注意すべき既存の不整合**: 上記5パターンに一致しない引用は無装飾のまま素の`<blockquote>`として出力される。実際に `公開済み/2026-07-21_メイクとスキンケアの相性.md:106-107` の `> 🕐 時間がないときは` は5パターンのどれにも一致せず、`enhanceAnnotationBlockquotes`(`lib/posts.js:206-232`)にも `lib/*.js` 内の他コードにも対応する装飾処理が見つからなかった(`🕐`で全lib配下をgrepしたが該当なし)。つまり**最近リライトされた記事にも、コードが装飾しない独自ラベルが実在する**。新規執筆では上記5種以外のラベルを発明しないこと。

### 1.4 コメント記法

`<!-- コメント -->` は本文から読者向け表示前に除去される。詳細は §8。

---

## 2. 利用可能コンポーネント

**前提の確認(重要)**: 記事は`.md`であり、Reactコンポーネントをインポートして本文中に書く仕組みは存在しない(§0.1)。そのため「利用可能コンポーネント」は実質的に2種類に分かれる。

- **表A**: frontmatterのデータ配列を書くと、サイト側(`lib/posts.js`)が自動でHTML文字列を生成して本文に挿入する仕組み。**記事本文から使える唯一の手段**。
- **表B**: `components/*.js` の実在するReactコンポーネント。すべて記事ページの「外枠」(ヘッダー・目次・関連記事カード等)用で、**記事本文(Markdown)側からは呼び出せない**。

### 表A: frontmatter駆動のレンダリング関数(記事本文から使える手段)

| 名称(frontmatterキー) | 呼び出し方 | 必須フィールド | 用途 | 根拠 |
|---|---|---|---|---|
| `accordions[]` | 配列要素を追加 | `afterHeading`, `summary`, `content` | 折りたたみパネル(詳細は§3) | `lib/posts.js:1029-1070`, `1197-1206` |
| `charts[]`(type省略) | `type`を書かない | `title`,`data[{label,value}]`,`unit`,`source`,`sourceUrl` | 複数カテゴリの棒グラフ | `renderBarChartHtml`, `lib/posts.js:394-452` |
| `charts[].type: "stat"` | 同上 | `value`,`unit`,`label`,`source`,`sourceUrl` | 単一数値の大きな表示 | `renderStatTileHtml`, `lib/posts.js:457-479` |
| `charts[].type: "pie"\|"donut"` | 同上 | `title`,`data[{label,value}]`,`unit` | 内訳・構成比(5件まで、6件以上は上位4+その他) | `renderDonutChartHtml`, `lib/posts.js:504-573` |
| `charts[].type: "prosCons"` | 同上 | `title`,`pros[]`,`cons[]` | メリット/デメリット2カラム(出典不要) | `renderProsConsHtml`, `lib/posts.js:579-592` |
| `charts[].type: "quadrant"` | 同上 | `title`,`xLabel`,`yLabel`,`data[{label,x,y}]`(x/yは0〜100) | 2軸ポジショニングマップ(SVG散布図) | `renderQuadrantChartHtml`, `lib/posts.js:598-666` |
| `charts[].type: "flowchart"` | 同上 | `title`,`questions[]`,`outcomes[{label,color,answers[]}]` | 質問→タイプ診断フロー(3カラムカード) | `renderFlowchartHtml`, `lib/posts.js:732-760` |
| `charts[].type: "lineChart"` | 同上 | `title`,`unit`,`xLabels[]`,`series[{label,color,points[]}]` | 経時変化の折れ線イメージ図 | `renderLineChartHtml`, `lib/posts.js:767-846` |

上記8種は**データ形状さえ合わせればどの記事でも汎用的に使える**(コード側にslug/記事名のハードコードが無い)。一方 `chart.type` には他に40種類以上の値が存在する(`hairCrossSection`・`azelaicMechanism`・`kusumiFaces`等、`lib/posts.js:854-978`)が、**いずれも「以下N種は『◯◯記事』専用」とコード内コメントで明記された1記事だけのハードコード実装**であり、他記事から呼び出しても意味のある結果にならない設計(詳細は§4・§10)。

`checklists[]` / `conclusionCards[]` / `quickSummaryCard`(`lib/posts.js:987-1022`, `1338-1357`)も同様の仕組みで汎用的だが、2026-08-07に「前髪の巻き方完全ガイド」記事のために追加されたばかりで実使用は3/90記事のみ(`lib/maegamiWidgets.js`)。

### 表B: 実在するReactコンポーネント(`components/`。記事本文からは呼び出し不可)

| 名称 | パス | 主なprops | 用途 |
|---|---|---|---|
| `Layout` | `components/Layout.js:25` | `title,description,ogImage,canonicalPath,ogType,jsonLd,panel,children` | 全ページ共通の外枠・OGP・共通背景 |
| `Header` | `components/Header.js:5` | `categories=[]` | サイト共通ヘッダー |
| `Footer` | `components/Footer.js:3` | なし | サイト共通フッター(必須ページ導線含む) |
| `ArticleToc` | `components/ArticleToc.js:6` | `items=[]` | 記事内目次(`post.toc`から自動生成、H2/H3が2つ未満なら非表示) |
| `AffiliateBanner` | `components/AffiliateBanner.js:8` | `link` | 記事末尾フォールバック用アフィリエイトバナー(本文中埋め込みは`lib/posts.js`側でHTML文字列生成、役割分担がコード冒頭コメントに明記) |
| `PostCard` | `components/PostCard.js:6` | `post,simple=false` | 一覧・関連記事カード |
| `Mascot` | `components/Mascot.js:1` | `mascot,size=34` | カテゴリカードのコンパクトなマスコット表示(ホームページ専用) |
| `HeroBanner` | `components/HeroBanner.js:1` | なし | トップページ用ヒーロー |
| `Sidebar` | `components/Sidebar.js:3` | `popularPosts=[],categories=[]` | サイドバー |
| `ScrollProgressBar` | `components/ScrollProgressBar.js:7` | なし | 記事ページのスクロール進捗バー |
| `ImageSlider` | `components/ImageSlider.js:4` | `slides=[]` | 画像スライダー |
| `SkinTypeQuiz` | `components/SkinTypeQuiz.js:113` | なし | 肌質診断クイズ(診断ページ用) |
| `SkinTypeArticleCards` / `SkinTypeArticleCarousel` | 同名ファイル | `posts=[]` | 肌タイプ関連記事の一覧・カルーセル |
| `AdminLayout` | `components/AdminLayout.js:14` | `children,title` | 管理ダッシュボード用外枠 |
| `DrySkinSelfCheck` | `components/DrySkinSelfCheck.js:73` | なし | **「乾燥肌とは？」記事1本専用**のインタラクティブ診断。`pages/posts/[slug].js:55-56,258-261`で本文HTMLを見出しテキストで前後分割し、その間に直接挿入するハードコードされたハック |
| `SeasonalSkinChangeArticle` | `components/articles/SeasonalSkinChangeArticle.js:374` | `post` | **「季節の変わり目肌荒れ対策」記事1本専用**の本文まるごと差し替えコンポーネント。`pages/posts/[slug].js:12`の`CUSTOM_LAYOUT_SLUGS`に載る記事だけ、通常のMarkdown→HTMLパイプライン自体を迂回する |

---

## 3. アコーディオン仕様

- **コンポーネント実体は無い**(Reactコンポーネントではない)。`lib/posts.js`が文字列として`<details><summary>`を生成する(`renderAccordionHtml`, `lib/posts.js:1029-1041`)。
- **データ構造**(`normalizeAccordions`, `lib/posts.js:1197-1206`): `afterHeading`(必須・本文の見出しテキストと完全一致させる)/ `summary`(必須・折りたたみの見出しラベル)/ `content`(必須・Markdown文字列として別途remark変換される)。3フィールドのみ。
- **挿入位置の決め方**: 本文をブロック分割し(`splitHtmlBlocks`, `lib/posts.js:324-334`)、テキストが`afterHeading`と完全一致するH2/H3見出しブロックの**直後**に挿入する(`embedAccordions`, `lib/posts.js:1046-1070`)。**同じ`afterHeading`値を持つ複数のaccordion要素はすべてその1箇所にまとめて連続挿入される**(FAQ形式の実装に使われている。実例: `公開済み/2026-07-26_基礎化粧品の基本知識と肌質診断.md`のfrontmatterで`afterHeading: "よくある質問"`が4件連続=Q1〜Q4)。
- **生HTML直書きは無効**: `<details>`等を本文Markdownに直接書いても表示されない(remark-htmlのデフォルトサニタイズにより除去される。実機検証は§8)。`accordions`を使うことが唯一の手段。
- 実際の使用規模: 実測3記事で7〜10件/記事(§7)。

### プレビュー文(パネル外の要約文)の扱い: **Yes(ただし非構造化)**

`accordions`のデータ構造(`lib/posts.js:1197-1206`)には`lead`のような「パネル外プレビュー文」専用フィールドは**存在しない**(`afterHeading`/`summary`/`content`の3つのみ)。しかし実際の記事では、アコーディオン直前の本文段落の**末尾に手書きで一文を添えて**パネルへの導線にする運用が定着している。

- 実例1: `公開済み/2026-07-26_基礎化粧品の基本知識と肌質診断.md:197`
  > 「続けてみたら思っていた以上にTゾーンと頬の差が見え、理解度がぐっと上がりました✨(**体験談は下のアコーディオンから**)。」
- 実例2: 同ファイル `:44`(frontmatter内`skincareWarning`チャートのtext)
  > 「…(私も一度これで失敗しました。**詳しくは下のアコーディオンから**)。」

この一文は`accordions`の`content`と文言が重複しないよう、あくまで「ここに畳んである」という予告のみを書く運用になっている(内容そのものを本文側に書くと二重表示になるため)。

---

## 4. 画像・図解の作り方

### 4.1 手段の一覧と起動手順

| 手段 | 起動方法 | 該当箇所 |
|---|---|---|
| ①手描きSVG(文字列生成) | `lib/posts.js`または`lib/*Widgets.js`/`lib/*Extras.js`内の関数がSVGタグを含むHTML文字列を直接組み立てる。ビルド時にNode.js上で実行され、クライアントJS・外部ライブラリ(Chart.js等)は使わない | 下記4.2 |
| ②既存アセット流用(マスコット) | `public/images/mascot/*.svg`を`<img>`参照 | §5 |
| ③写真調画像の生成 | **リポジトリ内に自動化スクリプトは無い**(`サイト運営\サイト本体\scripts\`は`sync-content.js`のみ)。Higgsfield(MCP、人間・エージェントが対話的に生成)を使い、生成後は目視確認してから`public/images/articles/`に手動配置する運用。手順は`.claude\agents\サイト制作者\site-engineer.md:34-38`に記載(人物構図の誤解防止・配置前のユーザー確認が必須) | site-engineer.md:32-38 |

②③は「本文への自動生成/自動挿入の仕組み」としては**該当なし**(③は人間の確認を挟む半自動運用、②は固定アセットの参照のみ)。①(手描きSVG)は下記の通り**大量に存在する**。

### 4.2 手描きSVGの実例(SVG図解を手で書いている例: あり・多数)

汎用7種(§2表A)に加え、以下はすべて**1記事専用**の使い捨てSVG生成関数(コード内コメントで「他記事では使用しない想定」と明記)。ファイル・種類数・対象記事:

| ウィジェットファイル | 提供するchart.type数 | 専用記事(定数) |
|---|---|---|
| `lib/drySkinWidgets.js` | 5 | 「乾燥肌とは？」(`lib/posts.js:858-865`) |
| `lib/hairTypeWidgets.js` | 6 | `HAIR_TYPE_SLUG`=「くせ毛タイプ別まとまる髪型ガイド」(`lib/posts.js:64,866-875`) |
| `lib/summerMakeupExtras.js` | 4 | `SUMMER_MAKEUP_SLUG`=「夏の皮脂汗メイク崩れ対策」(`lib/posts.js:876-883`) |
| `lib/lipCompareExtras.js` | 4 | `LIP_COMPARE_SLUG`=「リップ比較」(`lib/posts.js:884-890`) |
| `lib/azelaicAcidWidgets.js` | 5 | 「アゼライン酸とは」(`lib/posts.js:891-900`) |
| `lib/perfectSkinWidgets.js` | 2 | 「普通肌におすすめの美容成分」(`lib/posts.js:901-906`) |
| `lib/microneedleExtras.js` | 8 | `MICRONEEDLE_SLUG`=「マイクロニードル美容液比較」(`lib/posts.js:907-918`) |
| `lib/maegamiWidgets.js` | 4(+checklist等) | 「前髪の巻き方完全ガイド」(`lib/posts.js:919-925`) |
| `lib/kusumiWidgets.js` | 6 | `KUSUMI_SLUG`=「くすみケア比較」(`lib/posts.js:926-934`) |
| `lib/hyaluWidgets.js` | 2 | `HYALU_SLUG`=「ヒアルロン酸コラーゲンセラミドの違い」(`lib/posts.js:935-939`) |
| `lib/skincareBasicsWidgets.js`+`Extras.js` | 9 | `SKINCARE_BASICS_SLUG`=「基礎化粧品の基本知識と肌質診断」(`lib/posts.js:940-956`) |
| `lib/makeupSkincareOrderWidgets.js` | 4 | `MKSKORDER_SLUG`=「メイクとスキンケアの相性」(`lib/posts.js:129,957-966`) |
| `lib/zaitakuSkincareWidgets.js` | 4 | `ZAITAKU_SLUG`=「在宅ワーク時短スキンケア削っていい工程」(`lib/posts.js:967-974`) |
| `lib/kayumiScalpWidgets.js` | 4 | `KSS_SLUG`=「頭皮かゆみフケシャンプー比較」(`lib/posts.js:975-978`) |
| `lib/posts.js`本体 | 1(`faceMap`) | 「ファンデーション崩れタイプ別比較」専用(`lib/posts.js:690-725`, コメント`:854`) |

これらは新記事から`chart.type`だけ指定しても、コード側に対応する記事専用実装を書き足さない限り動作しない(§2.5の「新規に発明しない」の例外扱いに該当する可能性が高い。§10参照)。

**既知のギャップ(確定: 2026-08-08。棚卸し: 2026-08-08、依頼者の指摘を受け`lib/posts.js`および各ウィジェットファイルの関数本体を再確認)**: 汎用7種(§2表A)はすべてデータ表現型(数値・割合・分類の可視化)である。断面図・部位比較図のような**構造説明図は専用実装として存在するが、汎用的に(パラメータを変えるだけで他記事にも)再利用できる型は無い**。将来の汎用化候補として、`CrossSection`/`Diagram`を名前に含む専用実装11件を下記に棚卸しする(いずれも今回コンポーネントの新規作成・変更は行っていない)。

| # | 名称 | ファイルパス:行番号(定義) | chart.type(呼び出し行) | 紐づく記事 | 描画する図(1行) |
|---|---|---|---|---|---|
| 1 | `renderBarrierDiagramHtml` | `lib/drySkinWidgets.js:49` | `"barrierDiagram"`(`lib/posts.js:861`) | 2026-08-05_乾燥肌とは_基本情報.md | 健康な肌と乾燥肌の角質層(バリア機能)の断面比較図 |
| 2 | `renderLipCrossSectionHtml` | `lib/lipCompareExtras.js:24` | `"lipCrossSection"`(`lib/posts.js:887`) | 2026-07-26_リップ比較.md | ティント・口紅・グロスで着色層が唇のどの位置にあるかの断面比較図 |
| 3 | `renderHairCrossSectionHtml` | `lib/hairTypeWidgets.js:16` | `"hairCrossSection"`(`lib/posts.js:870`) | 2026-08-05_くせ毛タイプ別まとまる髪型ガイド.md | 直毛・うねり毛・強いくせ毛の毛髪断面形状+毛穴の比較図 |
| 4 | `renderSignalDiagramHtml` | `lib/zaitakuSkincareWidgets.js:37` | `"zaitakuSignal"`(`lib/posts.js:971`) | 2026-07-21_在宅ワーク時短スキンケア削っていい工程.md | 工程ごとの信号機アイコン(◎/△/✕)で可否を示す一覧図(断面図ではなくステータス一覧) |
| 5 | `renderScalpCrossSectionHtml` | `lib/kayumiScalpWidgets.js:22` | `"kssScalpCrossSection"`(`lib/posts.js:975`) | 2026-08-02_頭皮かゆみフケシャンプー比較.md | 乾燥タイプと脂性タイプの頭皮断面比較図 |
| 6 | `renderSkinLayerDiagramHtml` | `lib/hyaluWidgets.js:37` | `"skinLayerDiagram"`(`lib/posts.js:938`) | 2026-08-02_ヒアルロン酸コラーゲンセラミドの違い.md | 肌の3層構造(角質層・表皮・真皮)とヒアルロン酸/コラーゲン/セラミドの位置関係図 |
| 7 | `renderMakeupCrossSectionHtml` | `lib/summerMakeupExtras.js:31` | `"makeupCrossSection"`(`lib/posts.js:880`) | 2026-07-20_夏の皮脂汗メイク崩れ対策.md | 通常の脂性肌とインナードライ(隠れ乾燥)肌の断面比較図(皮脂膜の厚さ・水分量の違い) |
| 8 | `renderLayerCrossSectionHtml`(import別名`renderMkskorderLayerCrossSectionHtml`) | `lib/makeupSkincareOrderWidgets.js:21` | `"mkskorderLayerCrossSection"`(`lib/posts.js:961-962`) | 2026-07-21_メイクとスキンケアの相性.md | 化粧水〜ファンデーションの重ね塗り順を「層」で示す断面図(水性/油性の境目を図示) |
| 9 | `renderRoleDiagramHtml`(import別名`renderSkincareBasicsRoleDiagramHtml`) | `lib/skincareBasicsWidgets.js:30` | `"skincareRoleDiagram"`(`lib/posts.js:944`) | 2026-07-26_基礎化粧品の基本知識と肌質診断.md | 肌の断面に化粧水・美容液・乳液クリームの役割を配置した役割図 |
| 10 | `renderFlowDiagramHtml`(import別名`renderSkincareBasicsFlowDiagramHtml`) | `lib/skincareBasicsWidgets.js:73` | `"skincareFlowDiagram"`(`lib/posts.js:945`) | 2026-07-26_基礎化粧品の基本知識と肌質診断.md | クレンジング〜日焼け止め7ステップを階段状に示す縦フロー図(断面図ではなく手順フロー) |
| 11 | `renderAmountDiagramHtml`(import別名`renderSkincareBasicsAmountDiagramHtml`) | `lib/skincareBasicsWidgets.js:193` | `"skincareAmountDiagram"`(`lib/posts.js:948`) | 2026-07-26_基礎化粧品の基本知識と肌質診断.md | 化粧水・美容液・乳液・クリームの1回使用量を円の大きさで示す分量図(断面図ではなく分量比較) |

上表のうち#1・#3・#6・#7・#9は名称・実体とも断面図/構造比較図。#2・#5はタイトルのみ引数化された断面比較図(下記参照)。#4・#10・#11は名称に`Diagram`を含むが実体は断面図ではない(#4=ステータス一覧、#10=手順フロー、#11=分量比較)。

**汎用化の可能性(実施はしない。可能性の記録のみ)**: 11件中、関数が`chart`引数を受け取り本文内で使用しているのは#2・#4・#5の3件のみ。残り8件は次の2パターンのいずれかで、**データ駆動での再利用は現状できない**。

- **呼び出し側は`chart`を渡しているが、定義側が引数を取らず渡された値が無視されているもの**: `renderBarrierDiagramHtml`(#1)のみ該当。呼び出し側`lib/posts.js:861`は`renderBarrierDiagramHtml(chart)`と`chart`を渡しているが、定義側`lib/drySkinWidgets.js:49`は`export function renderBarrierDiagramHtml() {`と引数を取らない宣言のため、渡された値はJSの仕様上そのまま捨てられる
- **呼び出し側がそもそも`chart`を渡していないもの(渡す動機自体が無い)**: #3 `renderHairCrossSectionHtml`(`lib/posts.js:870`)・#6 `renderMakeupCrossSectionHtml`(`lib/posts.js:880`)・#8 `renderLayerCrossSectionHtml`(`lib/posts.js:962`)・#9 `renderRoleDiagramHtml`(`lib/posts.js:944`)・#10 `renderFlowDiagramHtml`(`lib/posts.js:945`)・#11 `renderAmountDiagramHtml`(`lib/posts.js:948`)、および#6と紐づく`renderSkinLayerDiagramHtml`(`lib/posts.js:938`)の計7件。いずれも呼び出し側の行に引数が無く(例: `return renderHairCrossSectionHtml();`)、定義側も引数を取らない`function xxx() {`宣言で一致している

いずれのパターンでも、比較対象の内容・配色・座標はすべて関数内部の定数としてハードコードされており、frontmatter経由でデータを渡しても現状のコードでは反映されない(コードを変更しない限り、パラメータを変えるだけでの再利用は不可)。

- **#4 `renderSignalDiagramHtml`(`lib/zaitakuSkincareWidgets.js:37`)は Yes ―― 他記事でも使えそうな候補。** `const { title, items } = chart;` で`items`(`{step, signal, note}`の配列)をそのまま描画に使っており、行数・内容ともハードコードされていない。frontmatterで異なる`items`を渡せば別記事でもそのまま動く可能性が高い。
- #2 `renderLipCrossSectionHtml`・#5 `renderScalpCrossSectionHtml`は`chart`から`title`/`source`/`sourceUrl`のみを読み、比較対象そのもの(3種の唇断面/2種の頭皮断面)は関数内にハードコードされている。**タイトル文言以外は汎用化されていないため、他記事でそのまま使うことはできない**(Noに近いが、"分岐する2〜3項目のラベル付き断面パネル"という骨格自体は既に部分的に抽象化されている点で#1・#3・#6・#7・#9より汎用化の着手コストは低いと推測される)。
- 残り8件(#1・#3・#6・#7・#8・#9・#10・#11)は関数が引数を取らないか取っても無視しており、**No(現状のまま他記事へ転用不可)**。

新規コンポーネントは追加せず、該当する要求は`[[UNRESOLVED:VIS-XX]]`として扱う(§10、`.claude/skills/nevora-pipeline/nevora-visual.md`「既知のギャップ」節)。

### 4.3 ファイル命名規則・出力先・参照記法・alt

- **命名規則**: サムネイル `/images/articles/{YYYY-MM-DD}_{記事名}.webp`。本文画像 `/images/articles/{YYYY-MM-DD}_{記事名}_body{N}.webp`(N=1,2,…連番)。実例: `thumbnail: "/images/articles/2026-07-26_基礎化粧品の基本知識と肌質診断.webp"` と本文 `![...](/images/articles/2026-07-26_基礎化粧品の基本知識と肌質診断_body1.webp)`(`公開済み/2026-07-26_基礎化粧品の基本知識と肌質診断.md:8,178`)
- **出力先**: `public/images/articles/`(本文・サムネイル、実測188ファイル)/ `public/images/category/`(カテゴリアイコン12種)/ `public/images/mascot/`(マスコットSVG、13キャラ×3ポーズ=39ファイル)/ `public/images/hero/`(トップページ)
- **参照記法**: 標準Markdown `![alt](path)` のみ。カスタム記法なし
- **alt付け方**:
  - サムネイル: ライターが指定不要。`alt={post.title}`をコード側で自動設定(`pages/posts/[slug].js:186`)
  - 本文画像: ライターが内容を説明する日本語文を都度執筆(例: 「化粧水・乳液・美容液など基礎化粧品アイテムを並べた様子」`公開済み/2026-07-26_基礎化粧品の基本知識と肌質診断.md:136`)
  - 関連記事カードの画像: `alt={p.title}`(`pages/posts/[slug].js:335`)
  - 「次の記事へ」・装飾目的の画像: `alt=""`(`pages/posts/[slug].js:300`、視覚的に隣接するテキストで内容が分かるため空にする設計)
- **サイズ**: webp形式に統一。実測(`sharp`でメタデータ取得、2026-08-08): サムネイル1280×720px、本文画像1696×960px、トップページhero 2048×1152px。いずれも16:9だが、ピクセル数を厳密に統一する規定文書は見つからなかった(**該当なし**)。`next/image`は不使用(`pages/sitemap.xml.js`以外に参照なし)、素の`<img>`タグで配信

### 4.4 本文中の写真(body画像)の挿入方式(2026-08-09追加調査)

PHOTOプレースホルダー設計のための集中調査。§4.3と重複する部分は参照のみとし、ここでは「記法」「生成・取得手段」「配置ルール」を1箇所に集約する。

**記法(既存の対応する仕組み)**: `ACC`/`VIS`と異なり、本文中の写真に**frontmatter経由の仕組みは無い**。標準Markdownの画像記法`![alt](path)`を、本文の該当箇所に**直接**書くだけである(remarkの標準機能。カスタム記法・専用コンポーネントは無い)。実例: `公開済み/2026-07-26_基礎化粧品の基本知識と肌質診断.md:178`
```
![頬にクリームをなじませる基礎化粧品ケアの様子](/images/articles/2026-07-26_基礎化粧品の基本知識と肌質診断_body1.webp)
```
このため、`ACC`/`VIS`のような「frontmatter配列+`afterHeading`見出しテキスト一致」の制約・残存リスク(`nevora-accordion.md`/`nevora-visual.md`参照)は写真には**存在しない**。配置位置はMarkdown本文中の物理的な位置がそのまま採用される(`TBL`と同じ性質)。

**ファイル命名規則**: サムネイル `{YYYY-MM-DD}_{記事名}.webp`、本文画像 `{YYYY-MM-DD}_{記事名}_body{N}.webp`(N=1,2,…連番、§4.3のまま)。

**生成・取得手段(自動生成ではなく人間関与の半自動)**:
- リポジトリ内に画像を自動生成するスクリプトは無い(§4.1のとおり`scripts/`は`sync-content.js`のみ)
- Higgsfield(MCP)等の画像生成ツールに、人間またはエージェントが対話的にプロンプトを投入して生成する運用(`.claude\agents\サイト制作者\site-engineer.md:32-38`)。生成後は目視確認し、人物が写る場合は配置前に必ずユーザーへ提示・確認を取る(同ファイル:34-37)
- 実際にこの運用でプロンプトを準備した実績がある: `サイト運営\実務\ライター\2026-08-05_肌タイプ6種クラスター_画像生成プロンプト.md`。「サムネイル1枚+本文画像1〜2枚/記事」の方針で、本文画像ごとに**配置見出し**(例: 「配置見出し: 『乾燥肌に必要なスキンケア』」、同ファイル:40)を明記したプロンプトを事前に用意し、Higgsfieldへ投入する形式(共通ルールは同ファイル:7-19)。この「配置見出し」はコード上の`afterHeading`ではなく、**人間がプロンプト作成時に使う位置決めメモ**であり、実際の配置は生成後にライターが該当見出しの直後へ`![alt](path)`を手で書く(writer.md:68-72)
  - ただしこの形式のプロンプト集計ファイルはリポジトリ内に1件のみ確認できた。**全記事がこの手順を経ているとは確認できていない**(他記事の本文画像は個別のHiggsfieldセッションで用意された可能性があり、その場合プロンプトの記録は残っていない)
- **アスペクト比**: 上記プロンプト集計ファイルでは「サムネイルは16:9、本文画像は4:3または1:1」と指定されている(同ファイル:14)が、実測(§4.3、`sharp`)した実在の本文画像2枚(基礎化粧品記事・くすみケア記事の`_body1.webp`)はいずれも**1696×960px=16:9**であり、計画上の目標比率(4:3/1:1)と一致しない。計画と実際の成果物の間に食い違いがある(どちらを正とするか未確定。§末尾「確認事項」参照)
- **画像ファイルが未用意の場合の運用**: 無理に配置せず、frontmatterのコメント等に「本文画像未定・第◯見出し付近に配置予定」のように候補位置と画像テーマ案を書き残し、画像が用意でき次第、後工程(編集長・サイト制作者)が反映する(`.claude\agents\ライター\writer.md:72`)。**この既存の「位置だけ先に決め、実ファイルは後から人間が反映する」運用は、PHOTOプレースホルダーの`§6追加分`の設計としてそのまま踏襲できる**

**配置ルール(writer.md:68-72、editor-in-chief.md:26)**:
- 画像ファイルが用意できている場合のみ、内容的に最も関連が深いH2見出しの直後に配置する
- 記事冒頭(1番目の見出し)への機械的な配置は禁止(過去にユーザーから差し戻しを受けた実例があるとwriter.mdに明記)
- 複数枚配置する場合は見出しを分散させ、連続する見出しに並べたり、まとめ・結論の直後に置いたりしない
- 装飾目的(空白埋め)での挿入は禁止
- 1記事あたり1〜2枚が目安(`.claude\skills\ライター\web-article-writing\SKILL.md:81`)

---

## 5. マスコット

- 定義場所: `サイト運営\サイト本体\lib\categoryMascot.js`。キャラクター定義は`:9-259`、カテゴリ対応表`CATEGORY_MASCOTS`は`:261-277`。
- 各キャラは`normalImage`(挨拶用)/`researchImage`(補足用)/`matomeImage`(まとめ用)の3ポーズ画像と、`comments`/`introComments`/`outroComments`の文言候補配列を持つ。
- **呼び出し方は記事側から直接は不可(全自動)**。`getCategoryMascot(category, slug, mascotComment)`(`lib/categoryMascot.js:291-295`)が`category`から自動選定し、`insertMascotComment`(`lib/posts.js:281-310`)が本文のH2境界(最初のH2直前=挨拶、中間のH2直前=補足、本文末尾=まとめ)に**自動挿入**する(`lib/posts.js:1359-1360`)。ライターが制御できるのはfrontmatterの`mascotComment`(中間の補足コメント文言を上書き)のみ。
- H2が2個未満の記事では中間の補足コメントは挿入されない(`lib/posts.js:293`の条件分岐)。

| カテゴリ | マスコット | 画像パス例 | 根拠 |
|---|---|---|---|
| スキンケア | ツヤミンちゃん | `/images/mascot/tsuyamin-*.svg` | `categoryMascot.js:9-27,262` |
| 美容成分 | キラミンちゃん | `/images/mascot/kiramin-*.svg` | `categoryMascot.js:29-46,263` |
| コスメ | イロミンちゃん | `/images/mascot/iromin-*.svg` | `categoryMascot.js:48-65,264` |
| ヘアケア | サラミンちゃん | `/images/mascot/saramin-*.svg` | `categoryMascot.js:67-84,265` |
| ヘアスタイル | クルミンちゃん | `/images/mascot/kurumin-*.svg` | `categoryMascot.js:86-103,266` |
| ボディケア | モチミンちゃん | `/images/mascot/mochimin-*.svg` | `categoryMascot.js:105-122,267` |
| UV・紫外線対策 | ヒカミンちゃん | `/images/mascot/hikamin-*.svg` | `categoryMascot.js:124-141,268` |
| 美容習慣 | ネムミンちゃん | `/images/mascot/nemumin-*.svg` | `categoryMascot.js:143-160,269` |
| 美容家電・美容機器 | デンミンちゃん | `/images/mascot/denmin-*.svg` | `categoryMascot.js:162-179,270` |
| 美容サービス | ウツミンちゃん | `/images/mascot/utsumin-*.svg` | `categoryMascot.js:181-198,271` |
| 美容の基礎知識 | マナミンちゃん | `/images/mascot/manamin-*.svg` | `categoryMascot.js:200-217,272` |
| ダイエット | カルミンちゃん | `/images/mascot/karumin-*.svg` | `categoryMascot.js:219-236,273` |
| メイク(旧カテゴリ名フォールバック) | イロミンちゃん | 同上 | `categoryMascot.js:275` |
| 美容(旧カテゴリ名フォールバック/サイト全体メイン) | ネヴォミンちゃん | `/images/mascot/nevomin-*.svg` | `categoryMascot.js:239-259,276` |

未登録カテゴリ(上記14件に無いカテゴリ)は`getCategoryMascot`が`null`を返し、マスコット挿入自体が発生しない(`lib/posts.js:282`の`if (!mascot) return html;`)。

**付記(本調査で判明したドキュメント側の古い記述)**: `.claude\agents\サイト制作者\site-engineer.md:42`には「現在は美容ブランチ『スキンケア/メイク/美容』のみツヤミンちゃんを割り当て」と書かれているが、実装(`categoryMascot.js`)は既に12カテゴリ+フォールバック2件に対応済みであり、この記述は実態と乖離している(本工程では修正しない。事実として報告のみ)。

---

## 6. 表(テーブル)の書き方

独自記法は無い。標準GFM(`remark-gfm`, `package.json:21`)のパイプテーブル `| 見出し | 見出し |` のみ。列は「読者が比較・判断しやすい項目」にする方針(`.claude\skills\ライター\web-article-writing\SKILL.md:64`)。横スクロール対応は記事専用CSSラッパー関数(例: `wrapKssTables`, `lib/kayumiScalpWidgets.js`)で個別に付与されており、汎用の表ラッパーコンポーネントは存在しない。実測3記事での表数は1〜4件(§7)。

---

## 7. 段落・構成の実測値

### 7.1 実測方法

`gray-matter`でfrontmatterを除去した本文Markdownを空行区切りでブロック化し、各ブロックを見出し/画像/表/引用/リスト/水平線/段落に分類する使い捨てNode.jsスクリプトを作成して実測した(スクリプト自体は`docs/pipeline/`配下には置いていない。工程4の検証スクリプトとは別物で、本調査専用)。段落の文字数は、Markdown装飾記法(`==` `++` `^^` `%%` `**` `~~` リンク記法等)を除去した後の文字数(全角換算の可読文字数に近い値)。ソースは`サイト運営\記事データ\公開済み\`配下の対象3ファイル。

### 7.2 記事ごとの実測結果

| 指標 | 基礎化粧品の基本知識と肌質診断 | くすみケア比較 | メイクとスキンケアの相性 |
|---|---|---|---|
| 本文文字数(Markdown本文のみ、frontmatter除く) | 3,035字 | 2,140字 | 3,336字 |
| H2の数 | 13 | 11 | 14 |
| H3の数 | 4 | 4 | 0 |
| 本文内画像の数 | 2 | 1 | 1 |
| 表の数 | 3 | 1 | 4 |
| アコーディオン数(frontmatter) | 10 | 8 | 7 |
| chart数(frontmatter、VIS相当) | 15 | 10 | 5 |
| 引用ボックス数(blockquote) | 0 | 6 | 7 |
| チェックリスト数 | 2 | 1 | 1 |
| 段落(見出し以外のテキストブロック)の数 | 22 | 13 | 29 |
| 段落文字数: 最大 | **149字** | 83字 | 133字 |
| 段落文字数: 平均 | 77字 | 54字 | 54字 |
| テキスト段落が連続している最大数 | 2 | 1 | **3** |

**3記事合算**: 段落サンプル数64、最大149字、平均62字(加重平均)、テキスト段落連続の最大値は**3**(`公開済み/2026-07-21_メイクとスキンケアの相性.md:70-77`。見出し直後に`^^…^^`段落→2行結合段落→通常段落と3つ連続し、その後に`> 🔍 結論だけ知りたい人へ`ボックスが続く)。

### 7.3 記事1本あたりの文字数についての注意

上記「本文文字数」はMarkdown本文のみで、frontmatterの`accordions[].content`や`charts[].text`等(読者には実際に表示される)を含まない。参考値として、`accordions`内の`summary`+`content`だけを合算すると基礎化粧品記事で+1,592字、くすみケア比較で+1,102字、メイクとスキンケアの相性で+1,200字あり、`charts`側のtip/warning/memo等のテキストを加えるとさらに増える(chart種類ごとにフィールド形状が異なるため今回は網羅的な合算をしていない)。**「目標文字数」をMarkdown本文だけで管理するのか、frontmatter内の表示用テキストも合算するのかは、依頼者に確認が必要**(§末尾「確認事項」参照)。

### 7.4 既存の非公式ルールとの突き合わせ

文字数ベースの規定は既存ドキュメントに無いが、**文数・行数ベースの非公式ルールは複数箇所で一致して存在する**。

| 出典 | 内容 |
|---|---|
| `.claude\agents\ライター\writer.md:65` | 「1段落に3〜4文以上を詰め込まない」 |
| `.claude\skills\ライター\web-article-writing\SKILL.md:43` | 「1段落に3文以上を詰め込まない(目安2〜3文、長くても4文まで)」 |
| `.claude\skills\ライター\web-article-writing\SKILL.md:79` | 「段落はスマホ表示で4〜6行以内を目安にする(8行以上になる場合のみ内容を調整)」 |
| `.claude\skills\レビューアー\quality-check\SKILL.md:11` | 「1段落が3〜4文を超えて詰め込まれていないか」 |

いずれも**「1行が何文字か」を定義していない**(源スペック§1-9が指摘する未確定点そのもの)。参考として、記事本文のCSS実測値は次の通り: `.article-body`はmax-width 720px、幅720px以下のビューポートでは`font-size: 0.9rem`(≒14.4px)・`line-height: 1.75`(`サイト運営\サイト本体\styles\globals.css:1293-1301, 2457, 2608-2613`)。ただし実際に1行へ収まる全角文字数は、ページ全体の入れ子(`.page-panel`等)のpaddingや実機フォントレンダリングに依存するため、本調査ではブラウザ実測(スクリーンショット等)までは行っていない(**未実施**。§末尾「確認事項」参照)。

### 7.5 提案する推奨値(要承認)

**A. 1段落の上限文字数**

- **提案: 140字**(全角換算)。実測最大値149字をわずかに下回る値とし、平均62字のおよそ2.3倍を上限とする。
- 根拠: 源スペック§1-9の例示値「240字(40字×6行)」をそのまま採用すると、直近リライト済み3記事の実測最大値(149字)より61%も緩くなり、2026-08-07前後の可読性改善で現場が実際に収束した水準より**後退**してしまう。既存の非公式ルール(2〜3文/4〜6行)とも整合させ、実測レンジに寄せた。
- 代替案: 実測最大値そのものの**150字**(キリが良い/現状追認)。

**B. テキスト段落の連続許容数**

- **提案: 2(=3つ以上の連続を禁止)**。源スペック§1-10の例示文言(「3つ連続してはならない」)と一致させる案。
- **ただし重要な留保**: 直近リライト済みの`メイクとスキンケアの相性`記事は、記事冒頭(`:70-77`)で実際に**3段落連続**しており、この基準を厳密適用すると同記事の冒頭が**現時点で違反**する。3記事中1本が典型例外という状態のため、「2」を採用するなら当該記事の扱い(工程0では修正しない)を依頼者に確認したい。
- 代替案: 実測最大値を許容範囲として採用する**3**(現状追認。ただし源スペックの例示文言とは矛盾する)。

---

## 8. コメント構文(消費マーカー用)

- 記事ファイルは`.md`(`.mdx`ではない)。有効なコメント構文は**標準HTMLコメント`<!-- ... -->`のみ**。
- サイト側は本文表示前に`stripHtmlComments`(`lib/posts.js:164-166`)で`<!--[\s\S]*?-->`を正規表現除去し、`getPostBySlug`内でremark処理の直前に適用している(`lib/posts.js:1318`)。
- 既存記事での実例: `公開済み/2026-07-21_メイクとスキンケアの相性.md:55-68`(編集メモ・差別化ポイント・PR設置候補を記録)、`公開済み/2026-07-26_くすみケア比較.md:234,238,281`(アフィリエイトリンク配置案・TODO)。

### 実機検証: `{/* impl:VIS-01 */}` は機能しない

源スペック§2.4は消費マーカーの例として`{/* impl:VIS-01 */}`(JSXコメント構文)を挙げているが、このプロジェクトの実パイプラインに同じ内容を通したところ、**コメントとして消えず、そのまま可視テキストとしてHTML化される**ことを確認した(2026-08-08、`remark().use(remarkGfm).use(remarkBreaks).use(remarkHtml)`で実行、`サイト運営\サイト本体\node_modules`の実パッケージを使用)。

```text
入力:
{/* impl:VIS-01 */}

<!-- impl:ACC-01 -->

出力HTML:
<p>{/* impl:VIS-01 */}</p>     ← 読者に表示されてしまう
                                ← <!-- impl:ACC-01 --> は跡形もなく消える(正常)
```

**結論**: このプロジェクトで機械判定可能な消費マーカーとして使えるのは`<!-- impl:VIS-01 -->`のような標準HTMLコメントのみ。`{/* */}`は使用不可。

---

## 9. ビルド/Lintコマンド

`package.json:5-13`より。

| コマンド | 内容 | 実行結果(2026-08-08実測) |
|---|---|---|
| `npm run sync-content` | `node scripts/sync-content.js`。確定稿+公開済み→`content/articles`同期 | 成功(90件同期) |
| `npm run dev` | `predev`で上記sync実行→`next dev` | 未実行(本調査では起動していない) |
| `npm run build` | `prebuild`で上記sync実行→`next build` | **成功**(exit 0)。Turbopack、126ページ生成。`/search`(849KB)・`/admin/articles`(236KB)がpage data閾値(128KB)超過の警告あり(ビルド自体は成功) |
| `npm run start` | `next start` | 未実行 |
| `npm run lint` | `next lint` | **失敗(exit 1)**。エラー: `Invalid project directory provided, no such directory: ...\lint`。ESLint設定ファイル(`.eslintrc*`/`eslint.config.*`)は存在せず、`package.json`に`eslint`依存も無い。Next.js 16で`next lint`サブコマンドの扱いが変わった影響とみられ、**現状このコマンドではLintが機能しない** |

工程4のV-14(ビルド)は現状のコマンドで判定可能。**V-15(Lint)は`npm run lint`が構造的に失敗するため、現状のままでは合格判定を出せない**(コードの問題ではなくコマンド自体の問題)。ESLint導入/`next lint`の代替手段の整備が必要(§末尾「確認事項」)。

---

## 10. 該当なし項目

本パイプラインが前提とする仕組みのうち、既存リポジトリに**存在しないもの**を列挙する(推測で代替を書かない)。

| 項目 | 状態 | 補足 |
|---|---|---|
| `.mdx`ファイル形式 | 該当なし | 全記事`.md`。JSX/コンポーネント直書き不可(§0.1) |
| 本文インラインの`[[TYPE:ID ...]]`プレースホルダー構文 | 該当なし | 既存の対応する仕組みは「frontmatter配列+見出しテキスト完全一致」であり、本文中の物理的な位置にブロックを書く方式ではない(§3, §4) |
| `{/* impl:ID */}` 消費マーカー構文 | 該当なし(実機検証で不可と確認) | 代替: 標準HTMLコメント`<!-- impl:ID -->`(§8) |
| 任意の`VIS`(図解)を実装できる汎用コンポーネント/API | 該当なし | 汎用なのは7種のみ(bar/stat/pie・donut/prosCons/quadrant/flowchart/lineChart)。それ以外はすべて1記事専用のハードコードSVG関数(§4) |
| アコーディオンの「パネル外プレビュー文」専用フィールド(`lead`相当) | 該当なし | 実際の運用は本文側の直前段落末尾に手書きの一文を添える方式(§3) |
| 本文への画像自動生成/自動挿入の仕組み(スクリプト) | 該当なし | `scripts/`は`sync-content.js`のみ。写真調画像はHiggsfield(MCP)を人間/エージェントが対話的に使う半自動運用(§4.1) |
| 画像サイズの統一規定(ドキュメント) | 該当なし | 実測ではおおむね16:9だがピクセル数は記事間で不統一(§4.3) |
| 動作するESLint設定・`next lint` | 該当なし | 設定ファイル不在、`npm run lint`はexit 1で失敗(§9) |
| 「1段落の上限文字数」「テキスト段落の連続許容数」の正式な数値定義 | 該当なし(源スペック§1-9/-10がまさにこの欠落を指摘) | 本書§7.5で実測に基づく提案のみ提示。決定は依頼者 |
| **既知のギャップ**: 構造説明図の汎用(再利用可能な)型が無い | 該当なし | 構造説明図(断面図・部位比較図等)は`CrossSection`/`Diagram`系の**専用実装として11件存在する**が、いずれも特定1記事のchart.typeにのみ紐づき汎用化されていない(全件の名称・パス:行番号・紐づく記事・描画内容・汎用化余地の棚卸しは§4.2「既知のギャップ」を参照。2026-08-08棚卸し)。将来の汎用化候補として記録するに留め、該当要求は`UNRESOLVED`となる(新規コンポーネントは追加しない) |

---

## 読んだファイルのパス一覧

### コード・設定
- `docs\pipeline\_source-spec-v1.md\NEVORA_article_pipeline_spec_v1.md`(前提仕様書)
- `サイト運営\サイト本体\package.json`
- `サイト運営\サイト本体\next.config.js`
- `サイト運営\サイト本体\scripts\sync-content.js`(全文)
- `サイト運営\サイト本体\lib\posts.js`(全文、1564行)
- `サイト運営\サイト本体\lib\categoryMascot.js`(全文)
- `サイト運営\サイト本体\pages\posts\[slug].js`(全文)
- `サイト運営\サイト本体\components\Mascot.js`
- `サイト運営\サイト本体\components\ArticleToc.js`
- `サイト運営\サイト本体\components\AffiliateBanner.js`
- `サイト運営\サイト本体\components\*.js`(シグネチャ一覧をgrepで確認: AdminLayout / SkinTypeQuiz / ScrollProgressBar / Layout / PostCard / SkinTypeArticleCarousel / Sidebar / ImageSlider / SkinTypeArticleCards / Footer / Header / HeroBanner / DrySkinSelfCheck / articles/SeasonalSkinChangeArticle)
- `サイト運営\サイト本体\styles\globals.css`(該当箇所抜粋: 1-30行, 665-700行, 1290-1340行, 2450-2670行、および`@media`一覧)
- `.claude\agents\サイト制作者\site-engineer.md`(全文)
- `.claude\skills\ライター\web-article-writing\SKILL.md`(全文)
- `.claude\skills\レビューアー\quality-check\SKILL.md`(該当箇所)
- `.claude\skills\配信者\publish-article\SKILL.md`(該当箇所)

### 記事(全文読了)
- `サイト運営\記事データ\公開済み\2026-07-26_基礎化粧品の基本知識と肌質診断.md`
- `サイト運営\記事データ\公開済み\2026-07-26_くすみケア比較.md`
- `サイト運営\記事データ\公開済み\2026-07-21_メイクとスキンケアの相性.md`

### 実測・検証(2026-08-08実施)
- `サイト運営\記事データ\確定稿\`・`公開済み\`全90ファイルのfrontmatterキー出現率のgrep集計
- `content\articles\`と`確定稿`+`公開済み`のファイル名diff照合
- 段落/見出し/画像/表/アコーディオン数の実測用Node.jsスクリプト実行(3記事)
- `sharp`による画像サイズ実測(4ファイル)
- `npm run build` 実行(成功・exit 0)
- `npm run lint` 実行(失敗・exit 1)
- remarkパイプラインへの`{/* impl:VIS-01 */}` / `<!-- impl:ACC-01 -->` 投入実験(一時ファイルは検証後に削除済み、リポジトリへの変更は残していない)
