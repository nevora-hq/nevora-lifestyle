#!/usr/bin/env node
/**
 * ロゴ・ファビコン一式を、マスコットのSVGから書き出す。
 *
 *   node scripts/generate-brand-assets.js
 *
 * **SVGが正**(public/images/mascot/kuramin-normal.svg / kuramin-mark.svg)。
 * PNG類はすべてこのスクリプトの出力物なので、直接編集しないこと。
 * マスコットを描き替えたらSVGを更新して再実行する(OGPは scripts/generate-ogp.js)。
 *
 * 出力:
 *   images/logo.png        512x512  全身(構造化データのorganization.logo)
 *   images/logo-mark.png   128x128  簡略マーク(ヘッダーのロゴ横)
 *   favicon-16/32/48.png            簡略マーク
 *   favicon.ico                     上記3サイズをPNGとして内包(Vista以降の形式)
 *   icon-192.png / icon-512.png     PWA用
 *   apple-touch-icon.png   180x180  白地・不透明(iOSは透過を黒く塗るため)
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const FULL_SVG = path.join(PUBLIC_DIR, "images", "mascot", "kuramin-normal.svg");
const MARK_SVG = path.join(PUBLIC_DIR, "images", "mascot", "kuramin-mark.svg");

// SVGは240x240のviewBox。密度を上げて大きめにラスタライズしてから縮小する
const DENSITY = 900;

const out = (...p) => path.join(PUBLIC_DIR, ...p);

async function render(svg, size) {
  return sharp(svg, { density: DENSITY })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// PNGを内包するICO(Vista以降・全モダンブラウザ対応)を組み立てる
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + 16 * entries.length;
  entries.forEach(({ size, png }, i) => {
    const e = dir.subarray(i * 16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

(async () => {
  for (const svg of [FULL_SVG, MARK_SVG]) {
    if (!fs.existsSync(svg)) {
      console.error(`[NG] 元SVGが見つかりません: ${svg}`);
      process.exit(1);
    }
  }

  const written = [];
  const write = async (buf, ...p) => {
    fs.writeFileSync(out(...p), buf);
    written.push(`${p.join("/")} (${(buf.length / 1024).toFixed(1)} KB)`);
  };

  await write(await render(FULL_SVG, 512), "images", "logo.png");
  await write(await render(MARK_SVG, 128), "images", "logo-mark.png");
  await write(await render(MARK_SVG, 192), "icon-192.png");
  await write(await render(MARK_SVG, 512), "icon-512.png");

  const icoEntries = [];
  for (const size of [16, 32, 48]) {
    const png = await render(MARK_SVG, size);
    await write(png, `favicon-${size}.png`);
    icoEntries.push({ size, png });
  }
  await write(buildIco(icoEntries), "favicon.ico");

  // iOSは透過部分を黒く塗るため、apple-touch-iconだけ白地で焼き込む
  const appleInner = await render(MARK_SVG, 158);
  const apple = await sharp({
    create: { width: 180, height: 180, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: appleInner, left: 11, top: 11 }])
    .png()
    .toBuffer();
  await write(apple, "apple-touch-icon.png");

  console.log("書き出しました:");
  written.forEach((w) => console.log("  " + w));
  console.log("\nOGP画像は node scripts/generate-ogp.js で別途生成する");
})();
