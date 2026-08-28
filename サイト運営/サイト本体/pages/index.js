import { useState } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import HeroBanner from "../components/HeroBanner";
import FadeInCard from "../components/FadeInCard";
import ImageSlider from "../components/ImageSlider";
import Sidebar from "../components/Sidebar";
import NewPostsCarousel from "../components/NewPostsCarousel";
import SectionBand from "../components/SectionBand";
import { getAllPostsMeta, getAllMajorCategories } from "../lib/posts";
import { getCategoryMeta } from "../lib/categoryMeta";
import { getCategoryMascot, KURAMIN } from "../lib/categoryMascot";
import Link from "next/link";

// 「人気カテゴリー」として常時表示する3カテゴリ(残りはアコーディオンで展開)。
const PINNED_CATEGORY_NAMES = ["家事・時短", "掃除", "節約・家計"];

export async function getStaticProps() {
  const posts = getAllPostsMeta();
  const categories = getAllMajorCategories();

  const categorySummaries = categories.map((c) => ({
    ...c,
    ...getCategoryMeta(c.name),
  }));

  // ホームのスライドは記事サムネイルではなく、大カテゴリの選定画像を表示する。
  const categorySlides = categorySummaries
    .filter((c) => c.image)
    .map((c) => ({
      key: c.name,
      href: `/category/${encodeURIComponent(c.name)}`,
      thumbnail: c.image,
      title: c.name,
      category: c.name,
    }));

  // A1/A3(2026-08-10): 新着記事は横スクロールカルーセルで規模感を出すため
  // 2件→8件に増やす。カルーセルは横スクロールのためスマホの縦の長さは
  // カード1行分のままで、件数を増やしても縦方向には伸びない。
  // 2026-08-17: PCで3カラムグリッド化したため、割り切れる9件に変更
  // (グリッドで3行ちょうど / スマホはカルーセルのままなので縦は伸びない)。
  const newPosts = posts.slice(0, 9);
  const newSlugs = new Set(newPosts.map((p) => p.slug));

  // 注目記事・おすすめ記事(Sidebar見出し)は手動ピック(featured/popular
  // フラグ)方式。アクセス数に基づく実際の人気順ではないため、popularPosts
  // という変数名・popularフラグ名とは別に、表示見出しは「おすすめ記事」
  // としている(2026-08-09、/rankingの命名整理と合わせて是正)。本格的な
  // アクセス解析導入までの暫定運用。フラグ該当記事が不足する場合のみ、
  // 新着記事(newPosts)と重複しない範囲で日付順に補完する。
  const pickWithFallback = (flagKey, count, excludeSlugs) => {
    const flagged = posts.filter((p) => p[flagKey] && !excludeSlugs.has(p.slug));
    if (flagged.length >= count) return flagged.slice(0, count);
    const usedSlugs = new Set([...excludeSlugs, ...flagged.map((p) => p.slug)]);
    const fallback = posts.filter((p) => !usedSlugs.has(p.slug));
    return [...flagged, ...fallback].slice(0, count);
  };

  // 2026-08-17: PCの3カラムグリッドで1行が埋まるよう2件→3件に変更
  const featuredPosts = pickWithFallback("featured", 3, newSlugs);
  const popularPosts = pickWithFallback(
    "popular",
    5,
    new Set([...newSlugs, ...featuredPosts.map((p) => p.slug)])
  );

  return {
    props: {
      newPosts,
      featuredPosts,
      popularPosts,
      categories,
      categorySummaries,
      sliderPosts: categorySlides,
    },
  };
}

export default function Home({
  newPosts,
  featuredPosts,
  popularPosts,
  categories,
  categorySummaries,
  sliderPosts,
}) {
  return (
    <Layout
      title="生活を豊かにする総合ガイド｜NEVORA｜家事・掃除・節約・暮らしの情報"
      categories={categories}
      canonicalPath="/"
      fullWidth
      hero={
        <>
          <HeroBanner />
          <ImageSlider slides={sliderPosts} />
        </>
      }
    >
      <Head>
        {/* ヒーロー画像はLCP要素。フォント等より先に取得を始めさせるため最上段でpreloadする。
            imageSrcSet/imageSizesは components/HeroBanner.js の srcSet/sizes と
            必ず同じ内容に保つこと(不一致だと同じ画像を2回ダウンロードしてしまう) */}
        <link
          rel="preload"
          as="image"
          href="/images/hero/home-hero.webp"
          imageSrcSet="/images/hero/home-hero-640.webp 640w, /images/hero/home-hero-1024.webp 1024w, /images/hero/home-hero-1536.webp 1536w"
          imageSizes="100vw"
          type="image/webp"
          fetchPriority="high"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      {/* 2026-08-17 Step5: ワイド画面で本文カラムの左右が「空白の白」に見えないよう、
          トップページを画面幅いっぱいの帯(.home-stripe)とfull-bleedの画像バンドを
          縦に積む構成に変更した。Layoutにcontainerを持たせず(fullWidth)、
          各帯が自前で .container--wide(1180px)を持つことで、
          背景は画面幅いっぱい・中身は1180pxに揃う。
          サイドバーは記事セクションの帯の中だけに置く(バンドと重ならないようにするため)。
          スマホでの縦の並び順は変更前と同じ。 */}
      <div className="home-page">
        <section className="home-stripe home-stripe--intro">
          <div className="container container--wide">
            <div className="mascot-comment mascot-comment-home">
              <img
                src={KURAMIN.normalImage}
                alt={KURAMIN.name}
                width={64}
                height={64}
                className="mascot-comment-img"
                loading="lazy"
              />
              <div className="mascot-comment-bubble">
                <span className="mascot-comment-name">{KURAMIN.name}</span>
                <p className="mascot-comment-text">{KURAMIN.homeComment}</p>
              </div>
            </div>
          </div>
        </section>


        {/* 左側に余白のある写真。見出しは1180pxグリッドの左端に揃えて白抜きで重ねる */}
        <SectionBand
          base="/images/band/band-01"
          widths={[640, 1024, 1536]}
          objectPosition="50% 45%"
        >
          <h2 id="category-band-title" className="section-band-title">
            暮らしのテーマから探す
          </h2>
          <p className="section-band-lead">
            気になるカテゴリーをタップすると、関連する記事をまとめて見られます。
          </p>
        </SectionBand>

        <section className="home-stripe home-stripe--cream">
          <div className="container container--wide">
            {categorySummaries.length > 0 && (
              <CategorySummarySection categorySummaries={categorySummaries} />
            )}

            {/* A4(2026-08-10): トップから運営・編集体制が見える唯一の導線。
                過剰な自己言及を避けるため、トップページ全体でここ1箇所のみに置く。 */}
            <Link href="/about" className="home-about-link">
              NEVORA編集部について →
            </Link>
          </div>
        </section>

        {/* ページ後半のリズム用。テキストは重ねず写真だけの装飾バンドにする */}
        <SectionBand
          base="/images/band/band-02"
          widths={[640, 1024, 1536]}
          objectPosition="50% 45%"
        />

        <section className="home-stripe home-stripe--tint">
          <div className="container container--wide">
            <div className="home-layout">
              <div className="home-main">
                <section className="home-featured-section">
                  <h2 className="home-section-title">注目記事</h2>
                  {featuredPosts.length === 0 ? (
                    <p>まだ記事がありません。記事データを確定稿フォルダに追加してください。</p>
                  ) : (
                    <div className="post-list post-list--simple">
                      {featuredPosts.map((post, i) => (
                        <PostCard key={post.slug} post={post} simple index={i} />
                      ))}
                    </div>
                  )}
                </section>

                <section className="home-new-section">
                  <h2 className="home-section-title">新着記事</h2>
                  <NewPostsCarousel posts={newPosts} />
                  <Link href="/ranking" className="home-new-more-link">
                    新着記事一覧をもっと見る →
                  </Link>
                </section>
              </div>

              <Sidebar popularPosts={popularPosts} categories={categories} />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

// 「カテゴリで探す」セクション。
// PC(1024px〜)は全カテゴリを3カラムグリッドで常時表示する
// (CSS側でアコーディオンを常時展開扱いにし、トグルボタンを隠す)。
// 1024px未満は人気カテゴリー(PINNED_CATEGORY_NAMES)のみ表示し、
// 残りは「すべて見る」で開くアコーディオンに入れて縦の長さを抑える。
// HTMLは常に全カテゴリ分を出力するためクロール性は維持する。
function CategorySummarySection({ categorySummaries }) {
  const [expanded, setExpanded] = useState(false);

  const pinned = categorySummaries.filter((c) => PINNED_CATEGORY_NAMES.includes(c.name));
  const rest = categorySummaries.filter((c) => !PINNED_CATEGORY_NAMES.includes(c.name));

  // 「すべて見る」はJS無効環境では/categoryへの通常リンクとして機能させ、
  // JS有効時はpreventDefaultしてページ内展開に切り替える(no-JSフォールバック)。
  const handleToggleClick = (e) => {
    e.preventDefault();
    setExpanded((v) => !v);
  };

  return (
    <section className="category-summary-section">
      <h2 className="home-section-title">カテゴリで探す</h2>
      <p className="home-section-lead">
        気になるテーマから、関連記事をまとめてチェックできます。
      </p>

      {/* 1024px以上では .category-summary-grids が唯一のグリッドになり、
          中の2つのグリッドとアコーディオンは display:contents で透過して
          12枚が同一グリッドの要素になる(=行ごとに高さが揃う)。
          1024px未満では従来どおり「人気3件+アコーディオン9件」として機能する。 */}
      <p className="category-summary-pinned-label">人気カテゴリー</p>
      <div className="category-summary-grids">
        <div className="category-summary-grid">
          {pinned.map((cat, i) => (
            <CategorySummaryCard key={cat.name} cat={cat} index={i} popular />
          ))}
        </div>

        <div
          id="category-summary-more-list"
          className={`category-summary-collapsible${expanded ? " is-expanded" : ""}`}
        >
          <div className="category-summary-grid category-summary-grid--more">
            {rest.map((cat, i) => (
              <CategorySummaryCard key={cat.name} cat={cat} index={i} />
            ))}
          </div>
        </div>
      </div>

      <Link
        href="/category"
        className="category-summary-toggle"
        aria-expanded={expanded}
        aria-controls="category-summary-more-list"
        onClick={handleToggleClick}
      >
        {expanded ? "− カテゴリーを閉じる" : "＋ すべてのカテゴリーを見る"}
      </Link>
    </section>
  );
}

// popular=true のカードには「人気」バッジを付ける。カードの大きさは
// 12枚すべて同一にし、差別化はこのバッジだけに留める(2026-08-17 Step5)。
function CategorySummaryCard({ cat, popular = false, index = 0 }) {
  const mascot = getCategoryMascot(cat.name);
  const categoryHref = `/category/${encodeURIComponent(cat.name)}`;

  return (
    <FadeInCard
      index={index}
      className={`category-summary-card${
        cat.count === 0 ? " category-summary-card--empty" : ""
      }`}
      style={{ "--cat-color": cat.color, "--cat-soft": cat.soft }}
    >
      {cat.image && (
        <Link
          href={categoryHref}
          className="category-summary-image-link"
          aria-label={`${cat.name}の記事一覧を見る`}
        >
          <img
            src={cat.image}
            alt={cat.name}
            loading="lazy"
            className="category-summary-image"
          />
          <span className="category-summary-badge">
            <span className="category-summary-icon" aria-hidden="true">
              {cat.icon}
            </span>
            <span className="category-summary-badge-name">{cat.name}</span>
          </span>
          {popular && <span className="category-summary-pin">人気</span>}
        </Link>
      )}

      {mascot && (
        <div className="mascot-comment category-summary-mascot-comment">
          <img
            src={mascot.normalImage}
            alt={mascot.name}
            width={48}
            height={48}
            className="mascot-comment-img"
            loading="lazy"
          />
          <div className="mascot-comment-bubble">
            <span className="mascot-comment-name">{mascot.name}</span>
            {/* 全カードで行数を揃えるため、長いdescriptionではなく
                1文にまとめたshortSummaryを使う(CSS側で3行にクランプ) */}
            <p className="mascot-comment-text">{cat.shortSummary}</p>
          </div>
        </div>
      )}

      {cat.count > 0 ? (
        // 3〜4カラムでは「(カテゴリ名)の記事をすべて見る →」が折り返して
        // 矢印だけ2行目に落ちるため、カラムが狭いPCグリッドでは
        // カテゴリ名部分(.category-summary-more-cat)をCSSで隠して1行に収める。
        // カテゴリ名はカード上部のバッジとaria-labelで担保する。
        <Link
          href={categoryHref}
          className="category-summary-more"
          aria-label={`${cat.name}の記事をすべて見る`}
        >
          <span className="category-summary-more-cat">{cat.name}の</span>
          記事をすべて見る →
        </Link>
      ) : (
        <span className="category-summary-more category-summary-more--empty">
          記事準備中です
        </span>
      )}
    </FadeInCard>
  );
}
