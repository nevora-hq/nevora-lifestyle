/**
 * 記事パーマリンク台帳(lib/permalinkMap.js)の検査。
 *   npm run verify:permalinks (サイト運営\サイト本体 で実行)
 * 不合格が1件でもあれば終了コード1。
 *
 *  (a) 記事(content/articles の全記事 + 記事データ/公開待ち + 記事データ/公開済み)がすべて台帳に載っている
 *  (b) 台帳に載っているキーの記事が存在する
 *  (c) パスの重複なし
 *  (d) 各パスが 大/中/小-NN(英小文字・数字・ハイフン、NNは2桁、3階層)
 *  (e) 大項目が、記事のfrontmatter category を MAJOR_SEGMENTS に通した値と一致
 *  (f) 同じ「大/中/小」で連番が01から欠番なく並ぶ
 *  (g) 記事本文(frontmatterのaccordions等も含むファイル全体)の /posts/<slug> リンクが台帳の記事を指す
 *
 * 台帳のキーは、記事ファイル名(.mdなし)から先頭の日付「YYYY-MM-DD_」を除いたもの(公開キューが日付を変えても台帳は変わらない)。
 */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { MAJOR_SEGMENTS, PERMALINKS, keyOf } = require("../lib/permalinkMap");

const ROOT = path.join(__dirname, "..");
const DIRS = [
  path.join(ROOT, "content", "articles"),
  path.join(ROOT, "..", "記事データ", "公開待ち"),
  path.join(ROOT, "..", "記事データ", "公開済み"),
];

const articles = new Map(); // key(日付なし) -> { file, slug, category, raw }
for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const slug = f.replace(/\.md$/, "");
    const key = keyOf(slug);
    const file = path.join(dir, f);
    const raw = fs.readFileSync(file, "utf8");
    if (articles.has(key)) continue;
    let category = "";
    try {
      category = String(matter(raw).data.category || "");
    } catch (e) {
      category = "";
    }
    articles.set(key, { file, slug, category, raw });
  }
}

const errors = [];
const err = (tag, msg) => errors.push(`[${tag}] ${msg}`);

// (a)
for (const key of articles.keys()) {
  if (!PERMALINKS[key]) err("a", `台帳に載っていない記事: ${key}`);
}
// (b)
for (const key of Object.keys(PERMALINKS)) {
  if (!articles.has(key)) err("b", `台帳にあるが記事が存在しない: ${key}`);
}
// (c)
const seen = new Map();
for (const [key, p] of Object.entries(PERMALINKS)) {
  if (seen.has(p)) err("c", `パスが重複: ${p} (${seen.get(p)} と ${key})`);
  else seen.set(p, key);
}
// (d)(e)
const FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*-\d{2}$/;
const groups = new Map(); // 大/中/小 -> [NN...]
for (const [key, p] of Object.entries(PERMALINKS)) {
  if (!FORMAT.test(p) || p.split("/").length !== 3) {
    err("d", `書式が 大/中/小-NN(英小文字・数字・ハイフン、NNは2桁)でない: ${key} -> ${p}`);
    continue;
  }
  const art = articles.get(key);
  if (art) {
    const expected = MAJOR_SEGMENTS[art.category];
    if (!expected) err("e", `category「${art.category}」が MAJOR_SEGMENTS に無い: ${key}`);
    else if (p.split("/")[0] !== expected) {
      err("e", `大項目が category「${art.category}」(${expected}) と食い違い: ${key} -> ${p}`);
    }
  }
  const m = p.match(/^(.*)-(\d{2})$/);
  if (!groups.has(m[1])) groups.set(m[1], []);
  groups.get(m[1]).push(Number(m[2]));
}
// (f)
for (const [key, nums] of groups) {
  nums.sort((x, y) => x - y);
  nums.forEach((n, i) => {
    if (n !== i + 1) err("f", `連番が01から欠番なく並んでいない: ${key} -> ${nums.join(",")}`);
  });
}
// (g)
for (const [key, art] of articles) {
  const re = /\/posts\/([^\s)"'#?\]>]+)/g;
  let m;
  while ((m = re.exec(art.raw))) {
    let target = m[1];
    try {
      target = decodeURIComponent(target);
    } catch (e) {
      /* そのまま */
    }
    if (!PERMALINKS[keyOf(target)]) err("g", `${art.slug}: 台帳にない記事へのリンク /posts/${target}`);
  }
}

console.log(`記事 ${articles.size} 本 / 台帳 ${Object.keys(PERMALINKS).length} 行`);
if (errors.length > 0) {
  console.error(errors.join("\n"));
  console.error(`verify:permalinks 不合格: ${errors.length}件`);
  process.exit(1);
}
console.log("verify:permalinks 合格");
