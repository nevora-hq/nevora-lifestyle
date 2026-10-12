const { PHASE_PRODUCTION_BUILD } = require("next/constants");

// 静的エクスポート(output: "export")では、このファイルのredirects()が使えない。
// 記事の旧URLを統合先へ301で転送する場合は、vercel.json の redirects に定義する
// (転送元は percent-encoded、転送先も実在する記事のURLであることを本番で確認すること)。

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
