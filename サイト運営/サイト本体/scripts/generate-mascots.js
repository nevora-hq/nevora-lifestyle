#!/usr/bin/env node
/**
 * NEVORA LIFESTYLEのマスコットSVG(メイン1体 + カテゴリ担当10体)× 3ポーズを生成する。
 *
 *   node scripts/generate-mascots.js            … 全34ファイルを生成
 *   node scripts/generate-mascots.js kuramin    … keyの前方一致で絞り込み
 *
 * AIサイトの同名スクリプトを移植したもの。体の形だけ「しずく型」に差し替えている。
 * 全キャラで体・顔・手足のジオメトリを共有し、輪郭色/塗り色/持ち物だけを差し替えることで、
 * 10体を並べても同じシリーズに見えるようにしている。
 *
 * **マスコットの絵はこのスクリプトが唯一の定義元。** public/images/mascot/*.svg は
 * すべて出力物なので直接編集しないこと。絵柄を変えたらここを直して再実行し、
 * 続けて generate-brand-assets.js(ロゴ・ファビコン)と generate-ogp.js(OGP画像)を
 * 実行すると、サイト全体へ反映される。
 *
 * 出力: public/images/mascot/<key>-<pose>.svg
 *   pose = normal(挨拶) / research(補足) / matome(まとめ)
 *   → lib/categoryMascot.js の normalImage / researchImage / matomeImage と対応する
 *   さらに kuramin だけ kuramin-mark.svg(ロゴマーク・ファビコン用の簡略版)を出力する
 */
const path = require("path");
const fs = require("fs");

const OUT_DIR = path.join(__dirname, "..", "public", "images", "mascot");

// ---------------------------------------------------------------------------
// キャラクター定義。color=輪郭線、soft=体の塗り、blush=ほおの赤み、motif=持ち物
// 色は lib/categoryMeta.js のカテゴリ色と一致させる(メインはブランド色)。
// カテゴリを追加するときは、categoryMeta.js・categoryMascot.js と3点セットで追記する。
// ---------------------------------------------------------------------------
const CHARACTERS = [
  { key: "kuramin", name: "クラミンちゃん", color: "#25573c", soft: "#f2f8f3", blush: "#cfe3d3", motif: null },
  { key: "tekimin", name: "テキミンちゃん", color: "#0b6b4f", soft: "#e3f7f1", blush: "#abe3d3", motif: "hourglass" },
  { key: "pikamin", name: "ピカミンちゃん", color: "#1663a9", soft: "#e3eef7", blush: "#abc8e3", motif: "broom" },
  { key: "fuwamin", name: "フワミンちゃん", color: "#0f6b7c", soft: "#e3f4f7", blush: "#abdae3", motif: "laundry" },
  { key: "hakomin", name: "ハコミンちゃん", color: "#9932b2", soft: "#f3e3f7", blush: "#d8abe3", motif: "boxes" },
  { key: "yarikumin", name: "ヤリクミンちゃん", color: "#a94109", soft: "#f7eae3", blush: "#e3beab", motif: "piggy" },
  { key: "nabemin", name: "ナベミンちゃん", color: "#b92559", soft: "#f7e3ea", blush: "#e3abbf", motif: "pan" },
  { key: "sumimin", name: "スミミンちゃん", color: "#8f5300", soft: "#f7efe3", blush: "#e3cbab", motif: "house" },
  { key: "denmin", name: "デンミンちゃん", color: "#4a5568", soft: "#eaecf0", blush: "#bdc4d0", motif: "plug" },
  { key: "manamin", name: "マナミンちゃん", color: "#33429e", soft: "#e4e7f6", blush: "#abb3e3", motif: "book" },
  { key: "nemumin", name: "ネムミンちゃん", color: "#693fe7", soft: "#e8e3f7", blush: "#b9abe3", motif: "moon" },
];

const POSES = {
  normal: "",
  research: "(リサーチポーズ)",
  matome: "(まとめポーズ)",
};

// ---------------------------------------------------------------------------
// 共通パーツ。240x240のviewBox。
// ---------------------------------------------------------------------------
const STROKE = 6;

// 体: しずく型(上がとがり、下がまるい)
const BODY_PATH =
  "M120 26 C 165 82, 186 124, 186 150 C 186 189, 156 211, 120 211 " +
  "C 84 211, 54 189, 54 150 C 54 124, 75 82, 120 26 Z";

const shadow = (c) => `<ellipse cx="120" cy="231" rx="52" ry="8" fill="${c.color}" opacity="0.10"/>`;

const body = (c) =>
  `<path d="${BODY_PATH}" fill="${c.soft}" stroke="${c.color}" stroke-width="${STROKE}" stroke-linejoin="round"/>`;

// 体の右上のハイライト(艶)
const highlight = () => `<rect x="150" y="72" width="11" height="11" rx="2" fill="#ffffff"/>`;

const blush = (c) =>
  `<ellipse cx="86" cy="157" rx="14" ry="9" fill="${c.blush}"/>` +
  `<ellipse cx="154" cy="157" rx="14" ry="9" fill="${c.blush}"/>`;

// 目。open=丸い点、arch=「^ ^」(考えている)、happy=にっこり閉じた目
function eyes(type) {
  if (type === "arch") {
    return (
      `<path d="M90 141 Q98 133 106 141" stroke="#24242b" stroke-width="5" fill="none" stroke-linecap="round"/>` +
      `<path d="M134 141 Q142 133 150 141" stroke="#24242b" stroke-width="5" fill="none" stroke-linecap="round"/>`
    );
  }
  if (type === "happy") {
    return (
      `<path d="M90 143 Q98 134 106 143" stroke="#24242b" stroke-width="5" fill="none" stroke-linecap="round"/>` +
      `<path d="M134 143 Q142 134 150 143" stroke="#24242b" stroke-width="5" fill="none" stroke-linecap="round"/>`
    );
  }
  return (
    `<circle cx="98" cy="140" r="8" fill="#24242b"/>` +
    `<circle cx="142" cy="140" r="8" fill="#24242b"/>` +
    `<circle cx="100.8" cy="136.6" r="2.4" fill="#fff"/>` +
    `<circle cx="144.8" cy="136.6" r="2.4" fill="#fff"/>`
  );
}

// 口。上向きに開いたカーブ(にっこり)。widthで開き具合を変える
const mouth = (wide = false) =>
  wide
    ? `<path d="M106 158 Q120 173 134 158" stroke="#24242b" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
    : `<path d="M109 160 Q120 171 131 160" stroke="#24242b" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;

const legs = (c) =>
  `<path d="M104 205 q-7 13 -3 22" stroke="${c.color}" stroke-width="${STROKE}" fill="none" stroke-linecap="round"/>` +
  `<path d="M136 205 q7 13 3 22" stroke="${c.color}" stroke-width="${STROKE}" fill="none" stroke-linecap="round"/>`;

// 腕。down=垂らす / up=上げる / hold=持ち物を持つ / together=前で合わせる
function arm(c, side, type) {
  const s = side === "left" ? -1 : 1;
  const x = side === "left" ? 58 : 182;
  if (type === "up") {
    return `<path d="M${x} 172 q${16 * s} -6 ${20 * s} -20" stroke="${c.color}" stroke-width="${STROKE}" fill="none" stroke-linecap="round"/>`;
  }
  if (type === "hold") {
    return `<path d="M${x} 176 q${12 * s} 10 ${18 * s} 12" stroke="${c.color}" stroke-width="${STROKE}" fill="none" stroke-linecap="round"/>`;
  }
  if (type === "together") {
    return `<path d="M${side === "left" ? 66 : 174} 180 q${20 * s} 18 ${48 * s} 12" stroke="${c.color}" stroke-width="${STROKE}" fill="none" stroke-linecap="round"/>`;
  }
  return `<path d="M${x} 172 q${16 * s} 2 ${22 * s} 14" stroke="${c.color}" stroke-width="${STROKE}" fill="none" stroke-linecap="round"/>`;
}

// ---------------------------------------------------------------------------
// 持ち物。いずれも 0,0 起点・約40x40の座標系で描き、translate/scaleで配置する。
// 輪郭は輪郭線と同じ色、塗りは体と同じ淡色に統一する。
// ---------------------------------------------------------------------------
const MOTIFS = {
  // 共通(research/matomeで全キャラが使う)
  magnifier: (c) =>
    `<circle cx="17" cy="17" r="13" fill="${c.soft}" stroke="${c.color}" stroke-width="4"/>` +
    `<path d="M27 27 L37 37" stroke="${c.color}" stroke-width="5" stroke-linecap="round"/>`,
  notebook: (c) =>
    `<rect x="4" y="6" width="32" height="28" rx="4" fill="${c.soft}" stroke="${c.color}" stroke-width="4"/>` +
    `<path d="M12 15 H28 M12 21 H28 M12 27 H22" stroke="${c.color}" stroke-width="3" stroke-linecap="round"/>`,

  // 家事・時短: 砂時計
  hourglass: (c) =>
    `<path d="M9 4 H31 L20 20 L31 36 H9 L20 20 Z" fill="${c.soft}" stroke="${c.color}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M7 4 H33 M7 36 H33" stroke="${c.color}" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M20 20 L26 31 H14 Z" fill="${c.color}"/>`,
  // 掃除: ほうき
  broom: (c) =>
    `<path d="M31 2 L21 18" stroke="${c.color}" stroke-width="4.5" stroke-linecap="round"/>` +
    `<path d="M12 20 H32 L37 39 H7 Z" fill="${c.soft}" stroke="${c.color}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M18 22 L16 38 M26 22 L28 38" stroke="${c.color}" stroke-width="3" stroke-linecap="round"/>`,
  // 洗濯: ハンガーに掛けたシャツと洗濯ばさみ
  laundry: (c) =>
    `<path d="M14 6 L20 12 L26 6 L38 13 L33 22 L29 20 V38 H11 V20 L7 22 L2 13 Z" fill="${c.soft}" stroke="${c.color}" stroke-width="4" stroke-linejoin="round"/>`,
  // 収納・片づけ: 積み重ねた収納ボックス
  boxes: (c) =>
    `<rect x="4" y="20" width="32" height="17" rx="3" fill="${c.soft}" stroke="${c.color}" stroke-width="4"/>` +
    `<rect x="9" y="4" width="22" height="15" rx="3" fill="${c.soft}" stroke="${c.color}" stroke-width="4"/>` +
    `<path d="M15 28 H25 M17 11 H23" stroke="${c.color}" stroke-width="3.5" stroke-linecap="round"/>`,
  // 節約・家計: 貯金箱とコイン
  piggy: (c) =>
    `<ellipse cx="20" cy="31" rx="16" ry="6.5" fill="${c.soft}" stroke="${c.color}" stroke-width="4"/>` +
    `<ellipse cx="20" cy="21" rx="16" ry="6.5" fill="${c.soft}" stroke="${c.color}" stroke-width="4"/>` +
    `<ellipse cx="20" cy="11" rx="16" ry="6.5" fill="${c.soft}" stroke="${c.color}" stroke-width="4"/>` +
    `<circle cx="20" cy="11" r="3" fill="${c.color}"/>`,
  // 食・料理: フライパン
  pan: (c) =>
    `<path d="M4 14 H28 V22 A12 12 0 0 1 4 22 Z" fill="${c.soft}" stroke="${c.color}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M28 18 H39" stroke="${c.color}" stroke-width="4.5" stroke-linecap="round"/>` +
    `<path d="M11 9 Q14 5 11 1 M19 9 Q22 5 19 1" fill="none" stroke="${c.color}" stroke-width="3" stroke-linecap="round"/>`,
  // 住まい・インテリア: 小さな家
  house: (c) =>
    `<path d="M20 4 L37 19 V37 H3 V19 Z" fill="${c.soft}" stroke="${c.color}" stroke-width="4" stroke-linejoin="round"/>` +
    `<rect x="15" y="24" width="10" height="13" rx="1.5" fill="${c.color}"/>`,
  // 生活家電: 電源プラグ
  plug: (c) =>
    `<rect x="8" y="14" width="24" height="20" rx="6" fill="${c.soft}" stroke="${c.color}" stroke-width="4"/>` +
    `<path d="M15 14 V4 M25 14 V4" stroke="${c.color}" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M20 34 v5" stroke="${c.color}" stroke-width="4" stroke-linecap="round"/>`,
  // 暮らしの知恵: 開いた本
  book: (c) =>
    `<path d="M20 10 C15 6 8 5 3 6 V31 C8 30 15 31 20 34 C25 31 32 30 37 31 V6 C32 5 25 6 20 10 Z" fill="${c.soft}" stroke="${c.color}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M20 10 V34" stroke="${c.color}" stroke-width="3.5"/>`,
  // 睡眠・休息: 三日月と星
  moon: (c) =>
    `<path d="M25 3 A17 17 0 1 0 25 37 A13 13 0 1 1 25 3 Z" fill="${c.soft}" stroke="${c.color}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M33 8 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2 -4.5 -4.5 -2 4.5 -2 z" fill="${c.color}"/>`,
};

// 持ち物を右手のあたりに置く。scaleは40pxの座標系を実寸に落とす倍率。
function held(c, motif, { x = 186, y = 170, scale = 1.15 } = {}) {
  if (!motif || !MOTIFS[motif]) return "";
  return `<g transform="translate(${x} ${y}) scale(${scale})">${MOTIFS[motif](c)}</g>`;
}

// ---------------------------------------------------------------------------
// ポーズ組み立て
// ---------------------------------------------------------------------------
function buildSvg(c, pose) {
  const label = `マスコットキャラクター ${c.name}${POSES[pose]}`;
  const parts = [shadow(c), legs(c)];

  if (pose === "normal") {
    // 挨拶。メインは右手を上げて手を振り、カテゴリ担当は持ち物を持つ。
    parts.push(arm(c, "left", "down"), arm(c, "right", c.motif ? "hold" : "up"));
    parts.push(body(c), highlight(), blush(c), eyes("open"), mouth());
    if (c.motif) parts.push(held(c, c.motif));
  } else if (pose === "research") {
    // 補足。虫めがねを持って調べている。
    parts.push(arm(c, "left", "down"), arm(c, "right", "hold"));
    parts.push(body(c), highlight(), blush(c), eyes("arch"), mouth());
    parts.push(held(c, "magnifier", { x: 190, y: 178, scale: 1.05 }));
  } else {
    // まとめ。両手を前で合わせ、ノートを添える。
    parts.push(body(c), highlight(), blush(c), eyes("happy"), mouth(true));
    parts.push(arm(c, "left", "together"), arm(c, "right", "together"));
    parts.push(held(c, "notebook", { x: 182, y: 146, scale: 0.85 }));
  }

  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  ${parts.join("\n  ")}
</svg>
`;
}

// ファビコン/ロゴマーク用の簡略版。手足・影・ハイライトを省き、輪郭線を太くする。
// 16pxまで縮めても形が潰れないよう、体を余白いっぱいまで拡大する。
function buildMarkSvg(c) {
  const label = `${c.name}(シンボルマーク)`;
  const parts = [
    `<path d="${BODY_PATH}" fill="${c.soft}" stroke="${c.color}" stroke-width="11" stroke-linejoin="round"/>`,
    `<ellipse cx="86" cy="157" rx="15" ry="10" fill="${c.blush}"/>`,
    `<ellipse cx="154" cy="157" rx="15" ry="10" fill="${c.blush}"/>`,
    `<circle cx="98" cy="139" r="9.5" fill="#24242b"/>`,
    `<circle cx="142" cy="139" r="9.5" fill="#24242b"/>`,
    `<path d="M108 159 Q120 170 132 159" stroke="#24242b" stroke-width="5.5" fill="none" stroke-linecap="round"/>`,
  ];
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  <g transform="translate(120 120) scale(1.14) translate(-120 -118.5)">
    ${parts.join("\n    ")}
  </g>
</svg>
`;
}

function main() {
  const filters = process.argv.slice(2);
  const targets = filters.length
    ? CHARACTERS.filter((c) => filters.some((f) => c.key.startsWith(f)))
    : CHARACTERS;
  if (!targets.length) {
    console.error(`該当するキャラクターがありません: ${filters.join(", ")}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  let count = 0;
  for (const c of targets) {
    for (const pose of Object.keys(POSES)) {
      fs.writeFileSync(path.join(OUT_DIR, `${c.key}-${pose}.svg`), buildSvg(c, pose), "utf8");
      count++;
    }
    if (c.key === "kuramin") {
      fs.writeFileSync(path.join(OUT_DIR, `${c.key}-mark.svg`), buildMarkSvg(c), "utf8");
      count++;
    }
    console.log(`  ${c.key.padEnd(11)} ${c.name.padEnd(16)} ${c.color}  ${c.motif || "(持ち物なし)"}`);
  }
  console.log(`\n合計 ${count}ファイル → ${path.relative(process.cwd(), OUT_DIR)}`);
}

main();
