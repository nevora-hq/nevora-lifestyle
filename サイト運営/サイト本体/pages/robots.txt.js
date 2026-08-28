function resolveSiteUrl(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  return `${proto}://${host}`;
}

export async function getServerSideProps({ req, res }) {
  const siteUrl = resolveSiteUrl(req);

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

  res.setHeader("Content-Type", "text/plain");
  res.write(body);
  res.end();

  return { props: {} };
}

export default function Robots() {
  return null;
}
