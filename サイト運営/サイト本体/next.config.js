const { PHASE_PRODUCTION_BUILD } = require("next/constants");

// 統合・非公開化した記事の旧URLの301リダイレクトは、静的エクスポート(output: "export")では
// next.config.jsのredirects()が使えないため、vercel.json の redirects に定義している。
// 記事を「記事データ/非公開アーカイブ」へ移すと、そのslugはgetStaticPathsから
// 消えて404になるため、統合先がある場合は vercel.json へ追記すること。
// アーカイブした記事を復活させる場合は、先に該当の定義を削除すること。

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 完全な静的エクスポート(サーバー実行のFunctionを持たない)。出力先は out/。
  output: "export",
};

// NEXT_PUBLIC_SITE_URL未設定時、components/Layout.jsはcanonical/OGPタグを
// 丸ごと出力しないフェイルセーフ設計になっている(安全側だが検知されにくい)。
// ビルド時点で気づけるよう、`next build`(本番ビルド)では未設定をエラーにし、
// `next dev`では警告のみに留める。
module.exports = (phase) => {
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    const message =
      "[next.config.js] NEXT_PUBLIC_SITE_URL が未設定です。canonical/OGP(components/Layout.js)が出力されなくなります。";
    if (phase === PHASE_PRODUCTION_BUILD) {
      throw new Error(message);
    }
    console.warn(message);
  }
  return nextConfig;
};
