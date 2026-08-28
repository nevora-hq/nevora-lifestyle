// カテゴリ別のマスコットキャラクター設定。
// NEVORA公式マスコット体系。大カテゴリ10種 + サイト全体のメインマスコット
// 「ネヴォミンちゃん」で構成する。各キャラは normalImage(挨拶)/
// researchImage(補足)/matomeImage(振り返り)の3ポーズを持つ。
// 新ジャンル追加時はこのファイルに追記するだけで拡張できる設計を維持する。

const KARUMIN = {
  name: "カルミンちゃん",
  normalImage: "/images/mascot/karumin-normal.svg",
  researchImage: "/images/mascot/karumin-research.svg",
  matomeImage: "/images/mascot/karumin-matome.svg",
  comments: [
    "家事は完璧を目指すより、続けられる形にするのが一番だよ。",
    "先に段取りを決めておくと、同じ作業でもぐっとラクになるよ。",
  ],
  introComments: [
    "こんにちは、カルミンだよ!今日は家事をラクにするお話をするね。",
    "カルミン、参上!一緒に軽やかな毎日を目指そう。",
  ],
  outroComments: [
    "今日からできる小さな一歩、一緒に踏み出してみようね。",
    "無理せず自分のペースで、応援してるよ!",
  ],
};

const HIKAMIN = {
  name: "ヒカミンちゃん",
  normalImage: "/images/mascot/hikamin-normal.svg",
  researchImage: "/images/mascot/hikamin-research.svg",
  matomeImage: "/images/mascot/hikamin-matome.svg",
  comments: [
    "汚れは種類によって落とし方が違うから、まず正体を見きわめよう。",
    "こまめに落とすほうが、まとめて頑張るより結局ラクなんだ。",
  ],
  introComments: [
    "こんにちは、ヒカミンだよ!今日は掃除のコツを紹介するね。",
    "ヒカミン、参上!一緒にピカピカにしていこう。",
  ],
  outroComments: [
    "気になるところから少しずつ、で大丈夫だよ。",
    "最後まで読んでくれてありがとう!また次の記事でね。",
  ],
};

const SARAMIN = {
  name: "サラミンちゃん",
  normalImage: "/images/mascot/saramin-normal.svg",
  researchImage: "/images/mascot/saramin-research.svg",
  matomeImage: "/images/mascot/saramin-matome.svg",
  comments: [
    "洗剤の量は多いほどいいわけじゃないよ。表示どおりが基本だよ。",
    "干し方を変えるだけで、乾き方もニオイも変わるんだ。",
  ],
  introComments: [
    "こんにちは、サラミンです。今日は洗濯の話をしますね。",
    "サラミン、参上!洗濯の困りごとを一緒に解決しよう。",
  ],
  outroComments: [
    "洗濯表示もチェックしながら、無理のない方法を選んでね。",
    "今日の内容、次の洗濯から試してみてね。",
  ],
};

const KURUMIN = {
  name: "クルミンちゃん",
  normalImage: "/images/mascot/kurumin-normal.svg",
  researchImage: "/images/mascot/kurumin-research.svg",
  matomeImage: "/images/mascot/kurumin-matome.svg",
  comments: [
    "収納は増やす前に、まず減らすところから考えると失敗しにくいよ。",
    "使う場所の近くにしまうのが、散らからない一番のコツだよ。",
  ],
  introComments: [
    "こんにちは、クルミンだよ!今日は片づけのお話をするね。",
    "クルミン、参上!一緒にすっきりまとめていこう。",
  ],
  outroComments: [
    "一か所ずつで大丈夫。終わったところから暮らしがラクになるよ。",
    "読んでくれてありがとう!またね。",
  ],
};

const KIRAMIN = {
  name: "キラミンちゃん",
  normalImage: "/images/mascot/kiramin-normal.svg",
  researchImage: "/images/mascot/kiramin-research.svg",
  matomeImage: "/images/mascot/kiramin-matome.svg",
  comments: [
    "節約は我慢より、固定費の見直しから始めると続きやすいよ。",
    "金額の大きいところから手をつけるのが、効率のいいやり方だよ。",
  ],
  introComments: [
    "こんにちは、キラミンです。今日は家計と節約の話をしますね。",
    "キラミン、参上!ムリなく続く方法を一緒に探そう。",
  ],
  outroComments: [
    "続けられる範囲でどうぞ。積み重ねが一番効きますよ。",
    "今日の内容が、家計の見直しのヒントになれば嬉しいです。",
  ],
};

const MOCHIMIN = {
  name: "モチミンちゃん",
  normalImage: "/images/mascot/mochimin-normal.svg",
  researchImage: "/images/mascot/mochimin-research.svg",
  matomeImage: "/images/mascot/mochimin-matome.svg",
  comments: [
    "作り置きは、保存の仕方までセットで考えると失敗しにくいよ。",
    "食材は買い方より、使い切り方を決めておくとムダが減るよ。",
  ],
  introComments: [
    "こんにちは、モチミンだよ!今日はごはんづくりのお話をするね。",
    "モチミン、参上!毎日の食事づくりを一緒にラクにしよう。",
  ],
  outroComments: [
    "無理のない範囲で、作れそうなものから試してみてね。",
    "最後まで読んでくれてありがとう!",
  ],
};

const IROMIN = {
  name: "イロミンちゃん",
  normalImage: "/images/mascot/iromin-normal.svg",
  researchImage: "/images/mascot/iromin-research.svg",
  matomeImage: "/images/mascot/iromin-matome.svg",
  comments: [
    "部屋の印象は、色の数を絞るだけでもぐっと落ち着くよ。",
    "家具は置く前に、通り道の幅を測っておくと失敗しにくいよ。",
  ],
  introComments: [
    "こんにちは、イロミンだよ!今日は部屋づくりのお話をするね。",
    "イロミン登場!居心地のいい部屋、一緒に考えよう。",
  ],
  outroComments: [
    "今の部屋でできそうなところから、試してみてね。",
    "読んでくれてありがとう!またね。",
  ],
};

const DENMIN = {
  name: "デンミンちゃん",
  normalImage: "/images/mascot/denmin-normal.svg",
  researchImage: "/images/mascot/denmin-research.svg",
  matomeImage: "/images/mascot/denmin-matome.svg",
  comments: [
    "家電は高機能かどうかより、使う頻度に合っているかで選ぼう。",
    "設置スペースと電源の位置は、買う前に必ず確認しておこうね。",
  ],
  introComments: [
    "こんにちは、デンミンです。今日は生活家電の話をしますね。",
    "デンミン、参上!自分に合う一台を一緒に探しましょう。",
  ],
  outroComments: [
    "仕様は必ずメーカーの公式情報も確認してくださいね。",
    "今日の内容が、次の買い替えの参考になりますように。",
  ],
};

const MANAMIN = {
  name: "マナミンちゃん",
  normalImage: "/images/mascot/manamin-normal.svg",
  researchImage: "/images/mascot/manamin-research.svg",
  matomeImage: "/images/mascot/manamin-matome.svg",
  comments: [
    "仕組みを知っておくと、情報に振り回されにくくなるよ。",
    "基礎を押さえておくと、新しい情報も理解しやすくなるんだ。",
  ],
  introComments: [
    "こんにちは、マナミンです。今日は暮らしの基礎知識をおさらいしますね。",
    "マナミン、参上。一緒に基本からしっかり学んでいきましょう。",
  ],
  outroComments: [
    "基礎が分かると、これからの情報収集がもっと楽になりますよ。",
    "今日学んだこと、ぜひ覚えておいてくださいね。",
  ],
};

const NEMUMIN = {
  name: "ネムミンちゃん",
  normalImage: "/images/mascot/nemumin-normal.svg",
  researchImage: "/images/mascot/nemumin-research.svg",
  matomeImage: "/images/mascot/nemumin-matome.svg",
  comments: [
    "眠りの質は、寝具より先に部屋の明るさと温度から見直すといいよ。",
    "休む時間をあらかじめ決めておくと、生活のリズムが整いやすいよ。",
  ],
  introComments: [
    "こんにちは、ネムミンだよ。今日は睡眠と休息のお話をするね。",
    "ネムミン、参上。ゆっくり整えていこうね。",
  ],
  outroComments: [
    "体調に不安があるときは、無理せず専門家に相談してね。",
    "今日もおつかれさま。ゆっくり休んでね。",
  ],
};

// サイト全体のメインマスコット。カテゴリを横断する案内・ホームページで使用する。
export const NEVOMIN = {
  name: "ネヴォミンちゃん",
  normalImage: "/images/mascot/nevomin-normal.svg",
  researchImage: "/images/mascot/nevomin-research.svg",
  matomeImage: "/images/mascot/nevomin-matome.svg",
  comments: [
    "気になるテーマは、カテゴリからも探せるよ。",
    "迷ったときは、担当のミンたちに聞いてみてね。",
  ],
  introComments: [
    "こんにちは、ネヴォミンです。NEVORAへようこそ。",
    "ようこそ、NEVORAへ。ここでは色んな「ミン」たちが案内役をしていますよ。",
  ],
  outroComments: [
    "気になるカテゴリがあれば、担当のミンたちが待っていますよ。",
    "また会いましょう。今日も読んでくれてありがとう。",
  ],
  // ホームページ冒頭専用の自己紹介コメント(トップページのみで使用)。
  homeComment:
    "はじめまして、ネヴォミンだよ!このサイトでは毎日の暮らしに役立つ情報を、カテゴリー担当のなかまたちと一緒に紹介しているよ。気になるジャンルから読んでみてね。",
};

const CATEGORY_MASCOTS = {
  "家事・時短": KARUMIN,
  "掃除": HIKAMIN,
  "洗濯": SARAMIN,
  "収納・片づけ": KURUMIN,
  "節約・家計": KIRAMIN,
  "食・料理": MOCHIMIN,
  "住まい・インテリア": IROMIN,
  "生活家電": DENMIN,
  "暮らしの知恵": MANAMIN,
  "睡眠・休息": NEMUMIN,
};

function pickFrom(list, seed) {
  if (!Array.isArray(list) || list.length === 0) return "";
  const sum = String(seed)
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return list[sum % list.length];
}

function pickComment(mascot, seed) {
  return pickFrom(mascot.comments, seed);
}

export function getCategoryMascot(categoryName, seed = categoryName, overrideComment = "") {
  const mascot = CATEGORY_MASCOTS[categoryName];
  if (!mascot) return null;
  return { ...mascot, comment: overrideComment || pickComment(mascot, seed) };
}

// 記事冒頭の挨拶コメント(normalポーズ)を取得する。
export function getMascotIntroComment(mascot, seed) {
  return pickFrom(mascot.introComments, seed);
}

// 記事末尾の振り返りコメント(matomeポーズ)を取得する。
export function getMascotOutroComment(mascot, seed) {
  return pickFrom(mascot.outroComments, seed);
}
