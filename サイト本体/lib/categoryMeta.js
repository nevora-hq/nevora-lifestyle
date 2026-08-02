// トップページの「カテゴリで探す」まとめセクション用の表示情報。
// 対象ジャンルはプロジェクト直下のCLAUDE.mdを唯一の情報源とし、
// ここには大カテゴリのみを登録する(中カテゴリ・小カテゴリは記事のtagsやカテゴリページ内の
// 見出しとして扱い、この一覧やホームページには反映しない)。
// 大カテゴリの一覧・分類方針はユーザーとの合意事項であり、CLAUDE.mdの「対象分野」を補足する
// カテゴリ分類表(暮らし/住まい/健康/食/趣味/旅行・お出かけ/時間・習慣/人間関係/ライフスタイル)に準拠する。
const CATEGORY_META = {
  "暮らし": {
    icon: "🧹",
    color: "#4d9a7a",
    soft: "#eafaf0",
    description:
      "家事・時短生活・収納・整理整頓など、日々の暮らしを楽にする工夫をまとめています。",
  },
  "住まい": {
    icon: "🛋️",
    color: "#e8590c",
    soft: "#ffe8d9",
    description:
      "一人暮らし・インテリア・家電・引っ越しなど、住まいを心地よく整えるヒントを紹介します。",
  },
  "健康": {
    icon: "💪",
    color: "#e64980",
    soft: "#ffe3ee",
    description:
      "睡眠・運動・食生活・健康習慣など、心身を健やかに保つための情報をまとめています。",
  },
  "食": {
    icon: "🍳",
    color: "#f08c00",
    soft: "#fff3d6",
    description:
      "簡単レシピ・食材の保存方法・キッチングッズなど、毎日の食を豊かにする情報を紹介します。",
  },
  "趣味": {
    icon: "🎨",
    color: "#7048e8",
    soft: "#ede6fd",
    description:
      "インドア・アウトドアを問わず、日常に彩りを添える趣味の情報をまとめています。",
  },
  "旅行・お出かけ": {
    icon: "🧳",
    color: "#1c7ed6",
    soft: "#e7f5ff",
    description:
      "国内旅行・日帰り旅行・一人旅など、お出かけをもっと楽しむための情報を紹介します。",
  },
  "時間・習慣": {
    icon: "⏱️",
    color: "#0ca678",
    soft: "#e3fcf3",
    description:
      "時間管理・習慣化・集中力・生活効率化など、日々をより良く過ごすコツをまとめています。",
  },
  "人間関係": {
    icon: "🤝",
    color: "#f76707",
    soft: "#ffe9d6",
    description:
      "コミュニケーション・友人関係・恋愛・自分時間など、人とのつながりに関する情報を紹介します。",
  },
  "ライフスタイル": {
    icon: "🏠",
    color: "#495057",
    soft: "#f1f3f5",
    description:
      "ミニマル生活・丁寧な暮らし・自己成長・人生設計など、生き方そのものを見つめ直す情報をまとめています。",
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

// 大カテゴリの一覧(記事がまだ0件のカテゴリもホームページ・カテゴリページに
// 「準備中」として表示するために使う)。
export function getAllCategoryNames() {
  return Object.keys(CATEGORY_META);
}
