// トップページの「カテゴリで探す」まとめセクション用の表示情報。
// 対象ジャンルはプロジェクト直下のCLAUDE.mdを唯一の情報源とし、
// カテゴリが増えた場合はここに追記する(未登録カテゴリはdefaultにフォールバック)。
//
// color は「人気」バッジ・CTA等の文字色にも使われるため、白カード上で6:1以上を満たす
// 値にすること(scripts/check-contrast.js で実測できる)。soft はマスコットの体の塗りと
// 共通で、scripts/generate-mascots.js の CHARACTERS と同じ値を持たせる。
//
// image は /public/images/category/<name>.webp を指す。元画像(PNG)は
// scripts/generate-site-images.js のMANIFESTで管理し、`node scripts/generate-site-images.js`
// でwebpに変換して出力する。カテゴリを追加するときは両方に追記すること。
const CATEGORY_META = {
  "家事・時短": {
    icon: "🧹",
    color: "#0b6b4f",
    soft: "#e3f7f1",
    image: "/images/category/kaji.webp",
    description:
      "毎日の家事をラクにする段取り・時短のコツや、家事の負担を減らす道具選びをまとめています。",
    shortSummary: "毎日の家事をラクにする段取り・時短のコツと道具選び。",
  },
  "掃除": {
    icon: "🧼",
    color: "#1663a9",
    soft: "#e3eef7",
    image: "/images/category/souji.webp",
    description:
      "汚れの種類別の落とし方や、場所ごとの掃除の手順・洗剤の使い分けを紹介します。",
    shortSummary: "汚れ別の落とし方と、場所ごとの掃除手順・洗剤の使い分け。",
  },
  "洗濯": {
    icon: "👕",
    color: "#0f6b7c",
    soft: "#e3f4f7",
    image: "/images/category/sentaku.webp",
    description:
      "洗剤の選び方・干し方・シミ抜き・部屋干しのニオイ対策など、洗濯の困りごとを解決します。",
    shortSummary: "洗剤選び・干し方・シミ抜き・部屋干し対策のまとめ。",
  },
  "収納・片づけ": {
    icon: "🗂️",
    color: "#9932b2",
    soft: "#f3e3f7",
    image: "/images/category/shuno.webp",
    description:
      "散らかりにくい収納の考え方と、部屋別・アイテム別の片づけ方法をまとめています。",
    shortSummary: "散らかりにくい収納の考え方と、部屋別の片づけ方法。",
  },
  "節約・家計": {
    icon: "💰",
    color: "#a94109",
    soft: "#f7eae3",
    image: "/images/category/setsuyaku.webp",
    description:
      "食費・光熱費・固定費の見直しなど、無理なく続けられる節約と家計管理の方法を紹介します。",
    shortSummary: "食費・光熱費・固定費の見直しと、家計管理の続け方。",
  },
  "食・料理": {
    icon: "🍳",
    color: "#b92559",
    soft: "#f7e3ea",
    image: "/images/category/ryori.webp",
    description:
      "作り置き・時短レシピ・食材の保存方法など、毎日のごはんづくりを助ける情報をまとめています。",
    shortSummary: "作り置き・時短レシピ・食材の保存方法のまとめ。",
  },
  "住まい・インテリア": {
    icon: "🛋️",
    color: "#8f5300",
    soft: "#f7efe3",
    image: "/images/category/sumai.webp",
    description:
      "模様替え・レイアウト・住環境の整え方など、暮らしやすい部屋づくりのヒントを紹介します。",
    shortSummary: "模様替え・レイアウト・住環境の整え方のヒント。",
  },
  "生活家電": {
    icon: "🔌",
    color: "#4a5568",
    soft: "#eaecf0",
    image: "/images/category/kaden.webp",
    description:
      "洗濯機・掃除機・調理家電など、生活家電のタイプ別の違いと選び方・使い方をまとめています。",
    shortSummary: "生活家電のタイプ別の違いと、選び方・使い方。",
  },
  "暮らしの知恵": {
    icon: "💡",
    color: "#33429e",
    soft: "#e4e7f6",
    image: "/images/category/chie.webp",
    description:
      "手続き・防災・日用品の選び方など、知っておくと暮らしがラクになる基礎知識を紹介します。",
    shortSummary: "手続き・防災・日用品選びなど、暮らしの基礎知識。",
  },
  "睡眠・休息": {
    icon: "🌙",
    color: "#693fe7",
    soft: "#e8e3f7",
    image: "/images/category/suimin.webp",
    description:
      "寝具や寝室の環境づくり、休息の取り方など、毎日のコンディションを整える情報をまとめています。",
    shortSummary: "寝具・寝室の環境づくりと、休息の取り方。",
  },
};

// ホームページで常時表示する大カテゴリ10種(CLAUDE.mdの対象分野を唯一の情報源とする
// 分類表に基づく表示順)。記事の有無に関わらずこの並び順で表示する。
export const MAJOR_CATEGORIES = [
  "家事・時短",
  "掃除",
  "洗濯",
  "収納・片づけ",
  "節約・家計",
  "食・料理",
  "住まい・インテリア",
  "生活家電",
  "暮らしの知恵",
  "睡眠・休息",
];

const DEFAULT_META = {
  icon: "📁",
  color: "#495057",
  soft: "#f1f3f5",
  description: "このカテゴリに関する記事をまとめています。",
  shortSummary: "このカテゴリに関する記事をまとめています。",
};

export function getCategoryMeta(name) {
  return CATEGORY_META[name] || DEFAULT_META;
}
