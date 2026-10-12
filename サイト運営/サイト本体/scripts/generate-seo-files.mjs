/**
 * robots.txt / sitemap.xml をビルド時に public/ へ生成するスクリプト。
 *
 * 以前は pages/robots.txt.js・pages/sitemap.xml.js が getServerSideProps で
 * リクエストごとに返していたため、サーバー実行(ƒ)のルートになっていた。
 * 内容は変えずに、ビルド時の静的ファイルとして出力する(生成物はgit管理外)。
 * next build / next dev の前に自動実行される(package.json の prebuild / predev を参照)。
 *
 * lib/posts.js は拡張子なしimportを使う(Next.js用の書き方)ため、Node単体では
 * 読み込めない。下のresolveフックで補い、sitemapの記事・カテゴリ一覧を
 * サイト本体と同じ関数(getAllPostsMeta / getAllCategories)から作る。
 */
import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { pathToFileURL } from "node:url";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

register(
  "data:text/javascript," +
    encodeURIComponent(String.raw`
import fs from "node:fs";
import { fileURLToPath } from "node:url";
export async function resolve(specifier, context, next) {
  if (specifier.startsWith(".") && !/\.[a-z]+$/.test(specifier) && context.parentURL) {
    const url = new URL(specifier + ".js", context.parentURL);
    if (fs.existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
  }
  return next(specifier, context);
}
export async function load(url, context, next) {
  if (/\/lib\/[^/]+\.js$/.test(url) && !url.includes("node_modules")) {
    return { format: "module", source: fs.readFileSync(fileURLToPath(url), "utf8"), shortCircuit: true };
  }
  return next(url, context);
}
`),
  pathToFileURL("./")
);

const { getAllPostsMeta, getAllCategories } = await import(
  pathToFileURL(path.join(process.cwd(), "lib", "posts.js")).href
);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) {
  // next.config.js も本番ビルドで同じ未設定をエラーにしている
  throw new Error("[generate-seo-files] NEXT_PUBLIC_SITE_URL が未設定です。");
}

// ---- robots.txt ----
// ドメイン確定前の暫定公開ではサイト全体をクロール拒否にする。
// components/Layout.js のnoindexメタと同じフラグで切り替わる。
// 正式公開時にVercelの環境変数で NEXT_PUBLIC_ALLOW_INDEX=1 を設定すると解除される。
// (静的ファイルなので、値を変えたら再デプロイ(再ビルド)が必要)
const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEX === "1";

const robots = allowIndex
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

// ---- sitemap.xml ----
function escapeXml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// <loc>には、サイト内リンク(next/link)が出力するのと同じ percent-encoded の
// URLを入れる。日本語スラッグを生のまま出力すると404になる(2026-08-24の本番不具合)。
function urlEntry(loc, lastmod) {
  return `<url><loc>${escapeXml(loc)}</loc>${
    lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
  }</url>`;
}

// カテゴリに属する記事のupdatedDate/dateのうち最も新しいものをlastmodとして使う。
function latestDate(posts) {
  const dates = posts
    .map((p) => p.updatedDate || p.date)
    .filter(Boolean)
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()));
  if (dates.length === 0) return undefined;
  const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
  return latest.toISOString().slice(0, 10);
}

const posts = getAllPostsMeta();
const categories = getAllCategories();
// /compareは掲載中のアフィリエイトリンクを全記事から集約するページ。
// リンクが0件の間は空ページになるため、sitemapにも載せない(compare.js側のnoindexと連動)。
const hasCompareItems = posts.some((p) => p.affiliateLinks.length > 0);

const staticPaths = [
  "/",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  ...(hasCompareItems ? ["/compare"] : []),
  "/ranking",
  "/search",
  "/category",
];

const entries = [
  ...staticPaths.map((p) => urlEntry(`${siteUrl}${p}`)),
  ...categories.map((c) => {
    const categoryPosts = posts.filter((p) => p.category === c.name);
    return urlEntry(
      `${siteUrl}/category/${encodeURIComponent(c.name)}`,
      latestDate(categoryPosts)
    );
  }),
  ...posts.map((p) =>
    urlEntry(
      `${siteUrl}/posts/${encodeURIComponent(p.slug)}`,
      p.updatedDate || p.date || undefined
    )
  ),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join(
  ""
)}</urlset>`;

fs.writeFileSync(path.join("public", "robots.txt"), robots);
fs.writeFileSync(path.join("public", "sitemap.xml"), sitemap);
console.log(
  `[generate-seo-files] public/robots.txt(allowIndex=${allowIndex}) と public/sitemap.xml(${entries.length}件)を生成しました`
);
