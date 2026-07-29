// カテゴリ別のマスコットキャラクター設定。
// 現状はジャンル(対象分野はプロジェクト直下のCLAUDE.mdが唯一の情報源)全体で
// ライフスタイルブランチのみ「ホムラちゃん」を割り当てている。
// 実際のカテゴリ名はキーワード調査・記事制作が進み次第確定するため、
// カテゴリページ設計時にCATEGORY_MASCOTSのキーを実際のカテゴリ名に合わせて追記・修正すること
// (未登録カテゴリはnullを返し、マスコットは非表示になる)。
const HOMURA = {
  name: "ホムラちゃん",
  normalImage: "/images/mascot/homura-normal.svg",
  researchImage: "/images/mascot/homura-research.svg",
  comments: [
    "小さな工夫の積み重ねが、暮らしの快適さを大きく変えるよ。",
    "無理に完璧を目指さず、続けられるやり方を見つけるのがコツだよ。",
    "自分に合った暮らし方を、一緒に探していこうね。",
  ],
};

const CATEGORY_MASCOTS = {
  "ライフスタイル": HOMURA,
};

function pickComment(mascot, seed) {
  const sum = String(seed)
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return mascot.comments[sum % mascot.comments.length];
}

export function getCategoryMascot(categoryName, seed = categoryName, overrideComment = "") {
  const mascot = CATEGORY_MASCOTS[categoryName];
  if (!mascot) return null;
  return { ...mascot, comment: overrideComment || pickComment(mascot, seed) };
}
