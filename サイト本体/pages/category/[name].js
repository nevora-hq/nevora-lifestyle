import Layout from "../../components/Layout";
import PostCard from "../../components/PostCard";
import { getAllCategories, getPostsByCategory } from "../../lib/posts";
import { getCategoryMeta, getAllCategoryNames } from "../../lib/categoryMeta";
import { getCategoryMascot } from "../../lib/categoryMascot";

export async function getStaticPaths() {
  // 記事が0件の大カテゴリも「準備中」ページとして事前生成しておく
  const names = new Set([
    ...getAllCategoryNames(),
    ...getAllCategories().map((c) => c.name),
  ]);
  return {
    paths: Array.from(names).map((name) => ({ params: { name } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const posts = getPostsByCategory(params.name);
  const { description } = getCategoryMeta(params.name);
  return { props: { posts, category: params.name, description } };
}

function buildCategoryJsonLd(category, posts, siteUrl) {
  if (!siteUrl) return [];
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: category,
          item: `${siteUrl}/category/${encodeURIComponent(category)}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/posts/${p.slug}`,
        name: p.title,
      })),
    },
  ];
}

export default function CategoryPage({ posts, category, description }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const mascot = getCategoryMascot(category);

  return (
    <Layout
      title={`${category}の記事一覧 | 暮らしを豊かにする総合ガイド｜NEVORA`}
      description={description}
      canonicalPath={`/category/${encodeURIComponent(category)}`}
      jsonLd={buildCategoryJsonLd(category, posts, siteUrl)}
    >
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <a href="/">トップ</a>
        <span className="sep">/</span>
        <span className="current">{category}</span>
      </nav>
      <h1 className="page-title">カテゴリ: {category}</h1>
      {mascot && (
        <div className="mascot-comment category-mascot-intro">
          <img
            src={mascot.researchImage}
            alt={mascot.name}
            width="56"
            height="56"
            className="mascot-comment-img"
            loading="lazy"
          />
          <div className="mascot-comment-bubble">
            <span className="mascot-comment-name">{mascot.name}({mascot.role})</span>
            <p className="mascot-comment-text">{mascot.comment}</p>
          </div>
        </div>
      )}
      {posts.length === 0 ? (
        <p className="category-empty-notice">
          このカテゴリは現在準備中です。記事を近日公開予定ですので、しばらくお待ちください。
        </p>
      ) : (
        <div className="post-list post-list-rows">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} variant="list" />
          ))}
        </div>
      )}
    </Layout>
  );
}
