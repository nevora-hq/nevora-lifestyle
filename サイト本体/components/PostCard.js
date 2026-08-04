import Link from "next/link";

// variant="compact": ホームの新着/注目セクション向け。サムネイル+カテゴリ+
// タイトルのみを表示し、カード全体を1つのリンクにする(本文抜粋・タグは非表示)。
// 既存の一覧・検索・カテゴリページはvariant未指定のまま(従来表示)で影響しない。
export default function PostCard({ post, variant }) {
  if (variant === "compact") {
    return (
      <Link href={`/posts/${post.slug}`} className="post-card post-card-compact">
        {post.thumbnail && (
          <img
            src={post.thumbnail}
            alt={post.title}
            loading="lazy"
            className="post-card-thumb"
          />
        )}
        <div className="post-card-body">
          <span className="category-badge">{post.category}</span>
          <h2>{post.title}</h2>
        </div>
      </Link>
    );
  }

  return (
    <div className="post-card">
      {post.thumbnail && (
        <Link href={`/posts/${post.slug}`} className="post-card-thumb-link">
          <img
            src={post.thumbnail}
            alt={post.title}
            loading="lazy"
            className="post-card-thumb"
          />
        </Link>
      )}
      <div className="post-card-body">
        <span className="category-badge">{post.category}</span>
        <h2>
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="excerpt">{post.excerpt}</p>
        {post.tags?.length > 0 && (
          <p className="tags">{post.tags.map((t) => `#${t}`).join(" ")}</p>
        )}
      </div>
    </div>
  );
}
