import Head from "next/head";
import { useState } from "react";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import HeroBanner from "../components/HeroBanner";
import ImageSlider from "../components/ImageSlider";
import Sidebar from "../components/Sidebar";
import { getAllPostsMeta, getAllCategories, getPostsByCategory } from "../lib/posts";
import { getCategoryMeta, getAllCategoryNames } from "../lib/categoryMeta";
import { getCategoryMascot } from "../lib/categoryMascot";
import Link from "next/link";

export async function getStaticProps() {
  const posts = getAllPostsMeta();
  const categories = getAllCategories();

  // 記事が1件もない大カテゴリも「準備中」としてホームページに常時表示する
  // (記事があるカテゴリのみに絞り込むと、立ち上げ初期はほとんどのカテゴリが
  // ユーザーの目に触れないままになってしまうため)。
  const postCountByCategory = new Map(categories.map((c) => [c.name, c.count]));
  const allCategoryNames = Array.from(
    new Set([...getAllCategoryNames(), ...categories.map((c) => c.name)])
  );
  const categorySummaries = allCategoryNames.map((name) => {
    const count = postCountByCategory.get(name) || 0;
    return {
      name,
      count,
      ...getCategoryMeta(name),
      posts: count > 0 ? getPostsByCategory(name).slice(0, 3) : [],
      comingSoon: count === 0,
    };
  });

  const categorySlides = categorySummaries
    .filter((c) => c.image)
    .map((c) => ({
      name: c.name,
      image: c.image,
      color: c.color,
      href: `/category/${encodeURIComponent(c.name)}`,
    }));

  return {
    props: {
      newPosts: posts.slice(0, 2),
      featuredPosts: posts.slice(0, 2),
      popularPosts: posts.slice(0, 5),
      categories,
      categorySummaries,
      categorySlides,
    },
  };
}

// 初期表示(人気カテゴリー)。この3カテゴリーは常時表示し、それ以外は
// アコーディオンを開くまでCSSで折りたたんでおく(HTML自体には全カテゴリー
// のリンクを常に出力し、SEO上のリンク・クロール性を損なわないようにする)。
const POPULAR_CATEGORY_NAMES = ["暮らし", "住まい", "時間・習慣"];

// 「あなたの暮らしの悩みから探す」チップ。既存のカテゴリーページ/検索ページの
// URL構造のみを使い、新規ページの追加は行わない。
const WORRY_GROUPS = [
  {
    heading: "暮らしの悩み",
    chips: [
      { label: "家事の時短", href: "/search?q=時短" },
      { label: "収納・片付け", href: "/search?q=収納" },
      { label: "一人暮らし", href: "/category/暮らし" },
      { label: "引っ越し", href: "/category/住まい" },
      { label: "家電選び", href: "/category/住まい" },
    ],
  },
  {
    heading: "心と体の悩み",
    chips: [
      { label: "睡眠の質", href: "/category/健康" },
      { label: "運動不足", href: "/category/健康" },
      { label: "食生活の乱れ", href: "/category/食" },
      { label: "人間関係の疲れ", href: "/category/人間関係" },
      { label: "自分時間が持てない", href: "/category/時間・習慣" },
    ],
  },
  {
    heading: "毎日をもっと楽しむ",
    chips: [
      { label: "趣味を見つけたい", href: "/category/趣味" },
      { label: "旅行・お出かけ", href: "/category/旅行・お出かけ" },
      { label: "習慣化できない", href: "/search?q=習慣化" },
      { label: "時間管理", href: "/category/時間・習慣" },
      { label: "ミニマルな暮らし", href: "/category/ライフスタイル" },
    ],
  },
];

export default function Home({
  newPosts,
  featuredPosts,
  popularPosts,
  categories,
  categorySummaries,
  categorySlides,
}) {
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  return (
    <Layout
      title="暮らしを豊かにする総合ガイド｜NEVORA｜暮らし・住まい・健康・食・趣味の情報"
      categories={categories}
      canonicalPath="/"
      hero={
        <>
          <HeroBanner />
          <ImageSlider slides={categorySlides} />
        </>
      }
    >
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="home-page">
        <div className="home-layout">
          <div className="home-main">
            <section className="worry-section" aria-labelledby="worry-section-title">
              <h2 id="worry-section-title" className="home-section-title">
                あなたの暮らしの悩みから探す
              </h2>
              <p className="home-section-lead">
                気になるキーワードをタップすると、関連する記事をまとめてチェックできます。
              </p>
              <div className="worry-groups">
                {WORRY_GROUPS.map((group) => (
                  <div key={group.heading} className="worry-group">
                    <h3 className="worry-group-title">{group.heading}</h3>
                    <div className="worry-chip-list">
                      {group.chips.map((chip) => (
                        <Link key={chip.label} href={chip.href} className="worry-chip">
                          {chip.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {categorySummaries.length > 0 && (
              <section className="category-summary-section">
                <div className="home-section-heading-with-mascot">
                  <img
                    src="/images/mascot/nova-normal.svg"
                    alt="ノヴァちゃん"
                    width="48"
                    height="48"
                    loading="lazy"
                  />
                  <div>
                    <h2 className="home-section-title">カテゴリで探す</h2>
                    <p className="home-section-lead">
                      気になるテーマから、関連記事をまとめてチェックできます。各カテゴリには案内キャラクターがいるよ。
                    </p>
                  </div>
                </div>
                {(() => {
                  const renderCategoryCard = (cat) => {
                    const mascot = getCategoryMascot(cat.name);
                    const categoryHref = `/category/${encodeURIComponent(cat.name)}`;
                    return (
                      <div
                        key={cat.name}
                        className={`category-summary-card${cat.comingSoon ? " category-summary-card-soon" : ""}`}
                        style={{ "--cat-color": cat.color, "--cat-soft": cat.soft }}
                      >
                        <Link
                          href={categoryHref}
                          className="category-summary-image-link"
                          aria-label={`${cat.name}の記事一覧を見る`}
                        >
                          {cat.image && (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              loading="lazy"
                              className="category-summary-image"
                            />
                          )}
                          {cat.comingSoon && (
                            <span className="category-summary-badge">準備中</span>
                          )}
                          <span className="category-summary-image-overlay">
                            <span className="category-summary-image-icon" aria-hidden="true">
                              {cat.icon}
                            </span>
                            <span className="category-summary-image-name">{cat.name}</span>
                          </span>
                        </Link>

                        {mascot && (
                          <div className="mascot-comment category-summary-mascot-comment">
                            <img
                              src={mascot.normalImage}
                              alt={mascot.name}
                              width={64}
                              height={64}
                              className="mascot-comment-img"
                              loading="lazy"
                            />
                            <div className="mascot-comment-bubble">
                              <span className="mascot-comment-name">{mascot.name}</span>
                              <p className="mascot-comment-text">{mascot.homeIntro}</p>
                            </div>
                          </div>
                        )}

                        <p className="category-summary-cta">
                          気になる方は、上の画像をクリックして記事をチェックしてみてね。
                        </p>
                      </div>
                    );
                  };

                  const popularCats = categorySummaries.filter((cat) =>
                    POPULAR_CATEGORY_NAMES.includes(cat.name)
                  );
                  const extraCats = categorySummaries.filter(
                    (cat) => !POPULAR_CATEGORY_NAMES.includes(cat.name)
                  );

                  return (
                    <>
                      <div className="category-summary-grid">
                        {popularCats.map(renderCategoryCard)}
                      </div>

                      {extraCats.length > 0 && (
                        <>
                          {/* SEO対策: 全カテゴリーへのリンクは常に初期HTMLに出力する。
                              折りたたみ表示はCSS(max-height + aria-hidden)のみで行い、
                              リンクをJSで後から生成したりDOMから除去したりしない。 */}
                          <div
                            id="category-summary-extra"
                            className={`category-summary-extra${
                              categoriesExpanded ? " category-summary-extra-open" : ""
                            }`}
                            aria-hidden={!categoriesExpanded}
                          >
                            <div className="category-summary-grid category-summary-grid-extra">
                              {extraCats.map(renderCategoryCard)}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="category-summary-toggle"
                            aria-expanded={categoriesExpanded}
                            aria-controls="category-summary-extra"
                            onClick={() => setCategoriesExpanded((prev) => !prev)}
                          >
                            {categoriesExpanded
                              ? "− 暮らしカテゴリーを閉じる"
                              : "＋ すべての暮らしカテゴリーを見る"}
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
              </section>
            )}

            <section className="home-featured-section">
              <h2 className="home-section-title">注目記事</h2>
              {featuredPosts.length === 0 ? (
                <p>まだ記事がありません。記事データを確定稿フォルダに追加してください。</p>
              ) : (
                <div className="post-list">
                  {featuredPosts.map((post) => (
                    <PostCard key={post.slug} post={post} variant="compact" />
                  ))}
                </div>
              )}
            </section>

            <section className="home-new-section">
              <h2 className="home-section-title">新着記事</h2>
              <div className="post-list">
                {newPosts.map((post) => (
                  <PostCard key={post.slug} post={post} variant="compact" />
                ))}
              </div>
            </section>
          </div>

          <Sidebar popularPosts={popularPosts} categories={categories} />
        </div>
      </div>
    </Layout>
  );
}
