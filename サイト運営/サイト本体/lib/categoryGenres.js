// トップページ「カテゴリで探す」の円形ナビ用ジャンル定義。
// カテゴリを増減したら、ここの categories を編集するだけで円形ナビに反映される。
// - 全カテゴリ(lib/categoryMeta.js の MAJOR_CATEGORIES)が必ずどれか1つのジャンルに入ること
// - ジャンル数は3〜6が見やすい(7以上ならチップ表示に切り替える)
// - icon は components/CategoryGenreNav.js の GENRE_ICONS のキー
// - soft は円の薄い背景色、line は選択時の枠色(文字色は常に --color-text)
export const CATEGORY_GENRES = [
  {
    id: "housework",
    label: "家事・掃除・洗濯",
    icon: "broom",
    soft: "#d9f0e4",
    line: "#2f8a66",
    categories: ["家事・時短", "掃除", "洗濯"],
  },
  {
    id: "home",
    label: "住まいと道具",
    icon: "home",
    soft: "#f6e6c9",
    line: "#b07a22",
    categories: ["収納・片づけ", "住まい・インテリア", "生活家電"],
  },
  {
    id: "money-food",
    label: "お金と食",
    icon: "coin",
    soft: "#f8dccf",
    line: "#c0603a",
    categories: ["節約・家計", "食・料理"],
  },
  {
    id: "wisdom",
    label: "知恵と休息",
    icon: "moon",
    soft: "#dde1f5",
    line: "#5563b8",
    categories: ["暮らしの知恵", "睡眠・休息"],
  },
];

// 円形ナビを出す条件。ジャンル数が3〜6のときだけ円、それ以外はチップ表示。
export function genreNavMode(count) {
  if (count < 2) return "none";
  return count <= 6 ? "ring" : "chips";
}
