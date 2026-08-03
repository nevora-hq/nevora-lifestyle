import Head from "next/head";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import HeroBanner from "../components/HeroBanner";
import ImageSlider from "../components/ImageSlider";
import Sidebar from "../components/Sidebar";
import { getAllPostsMeta, getAllCategories, getPostsByCategory } from "../lib/posts";
import { getCategoryMeta, getAllCategoryNames } from "../lib/categoryMeta";
import { getCategoryMascot } from "../lib/categoryMascot";
import Mascot from "../components/Mascot";
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
      newPosts: posts.slice(0, 6),
      featuredPosts: posts.slice(0, 3),
      popularPosts: posts.slice(0, 5),
      categories,
      categorySummaries,
      categorySlides,
    },
  };
}

export default function Home({
  newPosts,
  featuredPosts,
  popularPosts,
  categories,
  categorySummaries,
  categorySlides,
}) {
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
                <div className="category-summary-grid">
                  {categorySummaries.map((cat) => {
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
                          <div className="category-summary-mascot-row">
                            <Mascot mascot={mascot} size={48} />
                            <p className="category-summary-intro">{mascot.homeIntro}</p>
                          </div>
                        )}

                        <p className="category-summary-cta">
                          気になる方は、上の画像をクリックして記事をチェックしてみてね。
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="home-featured-section">
              <h2 className="home-section-title">注目記事</h2>
              {featuredPosts.length === 0 ? (
                <p>まだ記事がありません。記事データを確定稿フォルダに追加してください。</p>
              ) : (
                <div className="post-list">
                  {featuredPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </section>

            <section className="home-new-section">
              <h2 className="home-section-title">新着記事</h2>
              <div className="post-list">
                {newPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
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
