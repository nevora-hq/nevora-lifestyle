// カテゴリ別のマスコットキャラクター設定。
// 対象ジャンル(プロジェクト直下のCLAUDE.mdが唯一の情報源)の9つの大カテゴリ全てに
// 公式案内キャラクターを割り当てている。実在の専門家ではなく、サイト独自のブランド
// キャラクター群(「NEVORAのなかまたち」)であり、記事の案内・要点補足を担う。
// カテゴリ名を変更する場合は、CATEGORY_MASCOTSのキーも合わせて更新すること
// (未登録カテゴリはnullを返し、マスコットは非表示になる)。
const CATEGORY_MASCOTS = {
  "暮らし": {
    name: "メバエちゃん",
    role: "暮らし担当",
    normalImage: "/images/mascot/mebae-normal.svg",
    researchImage: "/images/mascot/mebae-research.svg",
    homeIntro:
      "家事の時短ワザや収納・整理整頓のコツをまとめているよ。毎日の家事をちょっとでも楽にしたい人にぴったりだよ。",
    comments: [
      "小さな工夫の積み重ねが、暮らしの快適さを大きく変えるよ。",
      "無理に完璧を目指さず、続けられるやり方を見つけるのがコツだよ。",
      "まずはひとつ、今日から真似できそうなことを見つけてみてね。",
    ],
  },
  "住まい": {
    name: "マドカちゃん",
    role: "住まい担当",
    normalImage: "/images/mascot/madoka-normal.svg",
    researchImage: "/images/mascot/madoka-research.svg",
    homeIntro:
      "一人暮らしの部屋づくりや家電・引っ越しのヒントを紹介しているよ。住まいをもっと心地よくしたい人におすすめだよ。",
    comments: [
      "部屋は、自分がいちばんくつろげる形にしていいんだよ。",
      "模様替えは小さな一歩からでOK。まずは配置から見直してみよっか。",
      "住まいの心地よさは、日々のご機嫌にも直結するよ。",
    ],
  },
  "健康": {
    name: "リズムちゃん",
    role: "健康担当",
    normalImage: "/images/mascot/rizumu-normal.svg",
    researchImage: "/images/mascot/rizumu-research.svg",
    homeIntro:
      "睡眠・運動・食生活など、心と体を整える習慣をまとめているよ。無理なく健康を保ちたい人にぴったりだよ。",
    comments: [
      "頑張りすぎず、自分の体のリズムを大切にしてね。",
      "小さな習慣の見直しが、体調の変化につながることもあるよ。",
      "気になる症状があるときは、無理せず専門家にも相談してね。",
    ],
  },
  "食": {
    name: "ホカホカくん",
    role: "食担当",
    normalImage: "/images/mascot/hokahoka-normal.svg",
    researchImage: "/images/mascot/hokahoka-research.svg",
    homeIntro:
      "簡単レシピやキッチングッズ、食材保存のコツを紹介しているよ。毎日の食事をもっと楽しみたい人におすすめだよ。",
    comments: [
      "毎日の食事、たまには手を抜いても大丈夫だよ。",
      "ちょっとした工夫で、食卓がぐっと楽しくなるよ。",
      "好きな食べ物があるって、それだけで幸せなことだよね。",
    ],
  },
  "趣味": {
    name: "イロハちゃん",
    role: "趣味担当",
    normalImage: "/images/mascot/iroha-normal.svg",
    researchImage: "/images/mascot/iroha-research.svg",
    homeIntro:
      "インドア・アウトドアを問わず、暮らしを彩る趣味の情報をまとめているよ。新しい楽しみを見つけたい人にぴったりだよ。",
    comments: [
      "好きなことに没頭する時間は、暮らしの彩りになるよ。",
      "上手じゃなくても、楽しめたらそれでいいんだよ。",
      "新しい趣味との出会いは、いくつになってもワクワクするね。",
    ],
  },
  "旅行・お出かけ": {
    name: "ソラトくん",
    role: "旅行・お出かけ担当",
    normalImage: "/images/mascot/sorato-normal.svg",
    researchImage: "/images/mascot/sorato-research.svg",
    homeIntro:
      "国内旅行や日帰りお出かけの情報を紹介しているよ。次の休みの予定を考えたい人におすすめだよ。",
    comments: [
      "近場のお出かけでも、新しい発見はたくさんあるよ。",
      "計画をしっかり立てておくと、当日をもっと楽しめるよ。",
      "次はどこに行こうか、考えてるだけでワクワクするね。",
    ],
  },
  "時間・習慣": {
    name: "コツコツちゃん",
    role: "時間・習慣担当",
    normalImage: "/images/mascot/kotsukotsu-normal.svg",
    researchImage: "/images/mascot/kotsukotsu-research.svg",
    homeIntro:
      "時間管理や習慣化、集中力アップのコツをまとめているよ。日々をより良く過ごしたい人にぴったりだよ。",
    comments: [
      "今日の一歩が、明日を少しずつ変えていくよ。",
      "完璧じゃなくていいから、まずは続けることを大事にしようね。",
      "時間の使い方を見直すだけで、気持ちにも余裕が生まれるよ。",
    ],
  },
  "人間関係": {
    name: "ムスビちゃん",
    role: "人間関係担当",
    normalImage: "/images/mascot/musubi-normal.svg",
    researchImage: "/images/mascot/musubi-research.svg",
    homeIntro:
      "友人関係や恋愛、自分時間など人とのつながりに関する情報を紹介しているよ。人間関係の悩みを軽くしたい人におすすめだよ。",
    comments: [
      "その気持ち、わかるよ。無理に合わせすぎなくて大丈夫。",
      "自分の気持ちを大切にすることも、良い関係づくりの一歩だよ。",
      "つながりは急がなくていい。ゆっくり育てていこうね。",
    ],
  },
  "ライフスタイル": {
    name: "ミチルちゃん",
    role: "ライフスタイル担当",
    normalImage: "/images/mascot/michiru-normal.svg",
    researchImage: "/images/mascot/michiru-research.svg",
    homeIntro:
      "ミニマル生活や丁寧な暮らし、自分らしい生き方のヒントをまとめているよ。生き方を見つめ直したい人にぴったりだよ。",
    comments: [
      "自分のペースでいいんだよ。人と比べなくて大丈夫。",
      "「自分らしさ」は、少しずつ育てていくものだよ。",
      "生き方に正解はないから、心地よい形を探していこうね。",
    ],
  },
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
  return {
    ...mascot,
    comment: overrideComment || pickComment(mascot, seed),
    homeIntro: mascot.homeIntro || pickComment(mascot, seed),
  };
}

export function getAllCategoryMascots() {
  return Object.entries(CATEGORY_MASCOTS).map(([category, mascot]) => ({
    category,
    ...mascot,
  }));
}
