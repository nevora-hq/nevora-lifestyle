// トップページの「カテゴリで探す」まとめセクション用の表示情報。
// 対象ジャンルはプロジェクト直下のCLAUDE.mdを唯一の情報源とし、
// カテゴリが増えた場合はここに追記する(未登録カテゴリはdefaultにフォールバック)。
const CATEGORY_META = {
  "ライフスタイル": {
    icon: "🏠",
    color: "#4d9a7a",
    soft: "#eafaf0",
    description:
      "暮らしの工夫や日々の習慣づくりなど、生活を豊かにするヒントをまとめています。",
  },
  "便利グッズ": {
    icon: "🛒",
    color: "#1c7ed6",
    soft: "#e7f5ff",
    description:
      "毎日の暮らしを快適にする便利グッズ・時短アイテムを紹介します。",
  },
  "住まい": {
    icon: "🛋️",
    color: "#e8590c",
    soft: "#ffe8d9",
    description:
      "収納・インテリア・整理整頓など、住まいを心地よく保つ工夫をまとめています。",
  },
  "時短家事": {
    icon: "⏱️",
    color: "#7048e8",
    soft: "#ede6fd",
    description:
      "家事の負担を減らし、自分の時間を増やすための時短術を紹介します。",
  },
};

const DEFAULT_META = {
  icon: "📁",
  color: "#495057",
  soft: "#f1f3f5",
  description: "このカテゴリに関する記事をまとめています。",
};

export function getCategoryMeta(name) {
  return CATEGORY_META[name] || DEFAULT_META;
}
