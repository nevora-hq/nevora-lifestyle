// トップページの「カテゴリで探す」まとめセクション用の表示情報。
// 対象ジャンルはプロジェクト直下のCLAUDE.mdを唯一の情報源とし、
// カテゴリが増えた場合はここに追記する(未登録カテゴリはdefaultにフォールバック)。
//
// image は /public/images/category/<name>.webp を指す。素材が未用意のカテゴリでは
// image を省略する(存在しない画像を参照するとトップのスライダーが壊れるため)。
// 素材を用意したら scripts/generate-site-images.js のMANIFESTに追記して生成し、
// ここに image を追加する。
const CATEGORY_META = {
  "家事・時短": {
    icon: "🧹",
    color: "#0ca678",
    soft: "#dff7ee",
    description:
      "毎日の家事をラクにする段取り・時短のコツや、家事の負担を減らす道具選びをまとめています。",
    shortSummary: "毎日の家事をラクにする段取り・時短のコツと道具選び。",
  },
  "掃除": {
    icon: "🧼",
    color: "#1c7ed6",
    soft: "#dff0ff",
    description:
      "汚れの種類別の落とし方や、場所ごとの掃除の手順・洗剤の使い分けを紹介します。",
    shortSummary: "汚れ別の落とし方と、場所ごとの掃除手順・洗剤の使い分け。",
  },
  "洗濯": {
    icon: "👕",
    color: "#3b5bdb",
    soft: "#dfe6ff",
    description:
      "洗剤の選び方・干し方・シミ抜き・部屋干しのニオイ対策など、洗濯の困りごとを解決します。",
    shortSummary: "洗剤選び・干し方・シミ抜き・部屋干し対策のまとめ。",
  },
  "収納・片づけ": {
    icon: "🗂️",
    color: "#ae3ec9",
    soft: "#f5e3fb",
    description:
      "散らかりにくい収納の考え方と、部屋別・アイテム別の片づけ方法をまとめています。",
    shortSummary: "散らかりにくい収納の考え方と、部屋別の片づけ方法。",
  },
  "節約・家計": {
    icon: "💰",
    color: "#e8590c",
    soft: "#ffe8d9",
    description:
      "食費・光熱費・固定費の見直しなど、無理なく続けられる節約と家計管理の方法を紹介します。",
    shortSummary: "食費・光熱費・固定費の見直しと、家計管理の続け方。",
  },
  "食・料理": {
    icon: "🍳",
    color: "#d6336c",
    soft: "#ffe3ec",
    description:
      "作り置き・時短レシピ・食材の保存方法など、毎日のごはんづくりを助ける情報をまとめています。",
    shortSummary: "作り置き・時短レシピ・食材の保存方法のまとめ。",
  },
  "住まい・インテリア": {
    icon: "🛋️",
    color: "#f08c00",
    soft: "#fff3d6",
    description:
      "模様替え・レイアウト・住環境の整え方など、暮らしやすい部屋づくりのヒントを紹介します。",
    shortSummary: "模様替え・レイアウト・住環境の整え方のヒント。",
  },
  "生活家電": {
    icon: "🔌",
    color: "#087f5b",
    soft: "#d8f5e9",
    description:
      "洗濯機・掃除機・調理家電など、生活家電のタイプ別の違いと選び方・使い方をまとめています。",
    shortSummary: "生活家電のタイプ別の違いと、選び方・使い方。",
  },
  "暮らしの知恵": {
    icon: "💡",
    color: "#5c7cfa",
    soft: "#e5ebff",
    description:
      "手続き・防災・日用品の選び方など、知っておくと暮らしがラクになる基礎知識を紹介します。",
    shortSummary: "手続き・防災・日用品選びなど、暮らしの基礎知識。",
  },
  "睡眠・休息": {
    icon: "🌙",
    color: "#7048e8",
    soft: "#ede6fd",
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
