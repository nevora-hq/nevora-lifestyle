#!/usr/bin/env node
/**
 * OGP画像(public/images/ogp.png、1200×630)を生成する。
 *
 *   node scripts/generate-ogp.js
 *
 * HTMLをheadless Chromium(playwright-core)で描画してスクリーンショットする方式。
 * SVG直描画だと日本語フォントの解決が環境依存になるため、ブラウザに任せている。
 * 配色は styles/globals.css の :root と揃えること(サイトのテーマ色を変えたら再生成する)。
 * マスコットを差し替えたら MASCOTS のファイル名を変えて再実行すればよい。
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "public", "images", "ogp.png");
const MASCOT_DIR = path.join(__dirname, "..", "public", "images", "mascot");

// 中央に大きく置くメイン + 左右に小さく置くサブ(存在するファイルだけ使う)
const MASCOTS = { main: "kuramin-normal.svg", left: "karumin-normal.svg", right: "kiramin-normal.svg" };

// styles/globals.css の :root と対応
const COLOR = {
  primary: "#2a6244",
  primaryDark: "#1e4e36",
  text: "#24242b",
  bgFrom: "#f4f8f1",
  bgMid: "#eaf2ec",
  bgTo: "#e8f0e5",
};

const EYEBROW = "WEB MAGAZINE";
const TITLE_1 = "生活を豊かにする総合ガイド";
const TITLE_2 = "NEVORA";
const LEAD = "家事・掃除・洗濯・収納・節約・料理の暮らし情報";

function dataUri(file) {
  const p = path.join(MASCOT_DIR, file);
  if (!fs.existsSync(p)) return null;
  const mime = file.endsWith(".svg") ? "image/svg+xml" : "image/png";
  return `data:${mime};base64,` + fs.readFileSync(p).toString("base64");
}

function html() {
  const main = dataUri(MASCOTS.main);
  const left = dataUri(MASCOTS.left);
  const right = dataUri(MASCOTS.right);
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden;
    font-family: "Yu Gothic", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
    background: linear-gradient(135deg, ${COLOR.bgFrom} 0%, ${COLOR.bgMid} 55%, ${COLOR.bgTo} 100%); }
  .wrap { position: relative; width: 100%; height: 100%; }
  .copy { position: absolute; left: 80px; top: 148px; width: 640px; }
  .eyebrow { font-size: 26px; font-weight: 700; letter-spacing: 0.34em; color: ${COLOR.primary}; }
  .t1 { margin-top: 24px; font-size: 44px; font-weight: 700; letter-spacing: 0.04em; color: ${COLOR.text}; }
  .t2 { margin-top: 6px; font-size: 84px; font-weight: 700; letter-spacing: 0.08em; color: ${COLOR.text}; line-height: 1.1; }
  .rule { margin-top: 24px; width: 430px; height: 3px;
    background: linear-gradient(90deg, ${COLOR.primary}, rgba(42, 98, 68, 0)); }
  .lead { margin-top: 20px; font-size: 24px; color: ${COLOR.primaryDark}; letter-spacing: 0.04em; }
  .stage { position: absolute; right: 28px; top: 50%; transform: translateY(-50%);
    width: 400px; height: 400px; display: flex; align-items: flex-end; justify-content: center; }
  .ring { position: absolute; inset: 0; border-radius: 50%;
    background: radial-gradient(circle at 50% 45%, #ffffff 0%, rgba(255,255,255,0.55) 62%, rgba(255,255,255,0) 72%); }
  .ring::after { content: ""; position: absolute; inset: 18px; border-radius: 50%;
    border: 2px dashed rgba(42, 98, 68, 0.18); }
  .m { position: relative; }
  .m-main { width: 224px; }
  .m-side { width: 118px; margin-bottom: 22px; }
  .dot { position: absolute; border-radius: 50%; background: rgba(42, 98, 68, 0.14); }
</style></head><body><div class="wrap">
  <div class="dot" style="left:64px;top:520px;width:14px;height:14px"></div>
  <div class="dot" style="left:600px;top:96px;width:10px;height:10px"></div>
  <div class="dot" style="left:664px;top:556px;width:18px;height:18px"></div>
  <div class="copy">
    <div class="eyebrow">${EYEBROW}</div>
    <div class="t1">${TITLE_1}</div>
    <div class="t2">${TITLE_2}</div>
    <div class="rule"></div>
    <div class="lead">${LEAD}</div>
  </div>
  <div class="stage"><div class="ring"></div>
    ${left ? `<img class="m m-side" src="${left}" alt="">` : ""}
    ${main ? `<img class="m m-main" src="${main}" alt="">` : ""}
    ${right ? `<img class="m m-side" src="${right}" alt="">` : ""}
  </div>
</div></body></html>`;
}

(async () => {
  let pw;
  try {
    pw = require("playwright-core");
  } catch (e) {
    console.error("playwright-coreが見つかりません。npm installを確認してください。", e.message);
    process.exit(1);
  }
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html(), { waitUntil: "networkidle" });
  await page.screenshot({ path: OUT });
  await browser.close();
  const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`生成しました: public/images/ogp.png (1200x630 / ${kb} KB)`);
})();
