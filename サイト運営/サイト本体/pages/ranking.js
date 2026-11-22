import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import { getAllPostsMeta } from "../lib/posts";
import { postPath } from "../lib/permalinkMap";

export async function getStaticProps() {
  // アクセス解析データが無いため、実際にはアクセス数等に基づく「ランキング」
  // ではなく、公開日順(新着順)の記事一覧である。名称・見出しもその実態に
  // 合わせて「新着記事」としている(URLパスのみ既存内部リンク・sitemap
  // との互換のため/rankingのまま変更していない)。
  const posts = getAllPostsMeta().slice(0, 10);
  return { props: { posts } };
}

export default function RankingPage({ posts }) {
  return (
    <Layout
      title="新着記事一覧 | 生活を豊かにする総合ガイド｜NEVORA"
      description="生活を豊かにする総合ガイド｜NEVORAの新着記事一覧を公開日順にご紹介します。"
      canonicalPath="/ranking"
      panel
      hero={<PageHero eyebrow="New Posts" title="新着記事一覧" lead="公開日の新しい順に並べています。" />}
    >
      <p className="page-note">
        ※公開日順に並んでいます。
      </p>
      <ol className="ranking-list">
        {posts.map((post, i) => (
          <li key={post.slug} className="ranking-item">
            <span className="rank-number">{i + 1}</span>
            {post.thumbnail && (
              <a href={postPath(post.slug)} className="ranking-thumb-link">
                <img src={post.thumbnail} alt="" loading="lazy" className="ranking-thumb" />
              </a>
            )}
            <div>
              <h2>
                <a href={postPath(post.slug)}>{post.title}</a>
              </h2>
            </div>
          </li>
        ))}
      </ol>
    </Layout>
  );
}
