// 記事のパーマリンク台帳(2026-11-22 依頼者の決定)。
// 形式: /posts/<大項目>/<中項目>/<小項目>-<連番2桁>
//  - 大項目 = 記事の frontmatter category(10個)に1対1で対応する英小文字の固定語(下の MAJOR_SEGMENTS)
//  - 中項目 = その大項目の中の話題のまとまり、小項目 = 記事の題材。小項目の連番は、同じ「大/中/小」が複数あるときに
//    01, 02… と振って重複を避ける(1本だけなら 01)。
//  - この分類は URL にだけ使う。サイトの画面(カテゴリ一覧・パンくず・ナビなど)には出さない。
//    画面上のカテゴリは従来どおり frontmatter の category を使う。
//  - 台帳のキーは、記事ファイル名(.mdなし)から先頭の日付「YYYY-MM-DD_」を除いたもの。
//    公開キュー(scripts/queue.js)が公開予定日に合わせてファイル名の日付を変えても、台帳を直さずに済む。
//  - 記事を足したときは、PERMALINKS に1行足す。scripts/verify-permalinks.js が、未登録・重複・
//    大項目と category の食い違い・書式の誤り・欠番を検出する。
//    未登録の記事は、旧形式の /posts/<slug> で出る(検査では不合格にする)。
//  - 記事ファイル名(slug)・画像パスは変えない。記事本文中の /posts/<slug> リンクは、描画時にこの台帳で新URLへ置き換える。
const MAJOR_SEGMENTS = {
  "家事・時短": "chores",
  "掃除": "cleaning",
  "洗濯": "laundry",
  "収納・片づけ": "storage",
  "節約・家計": "money",
  "食・料理": "food",
  "住まい・インテリア": "home",
  "生活家電": "appliances",
  "暮らしの知恵": "tips",
  "睡眠・休息": "sleep",
};

const PERMALINKS = {
  // 家事・時短
  "家事時間の実態と動線から削る時短": "chores/time-saving/kitchen-flow-01",
  "家事の時間はどこに消えているのか": "chores/time-saving/time-breakdown-01",
  "朝バタバタを減らす夜のうちの家事": "chores/routine/night-prep-01",
  "帰宅後に家事が止まる日の夕方30分の順番": "chores/routine/evening-30min-01",
  "洗濯物をたたむ手間を減らす線引き": "chores/routine/folding-01",
  // 掃除
  "お風呂の黒カビを防ぐ乾かす順番": "cleaning/bathroom/black-mold-01",
  "排水口のニオイが上がってくる理由": "cleaning/drain/odor-01",
  "換気扇掃除を大掃除前に始める順番": "cleaning/kitchen/range-hood-01",
  "フローリングのベタつきを拭き掃除で戻す順番": "cleaning/floor/sticky-01",
  "年末の大掃除を場所ごとに割り振る": "cleaning/year-end/room-plan-01",
  // 洗濯
  "タオルの生乾き臭が戻る理由と干し方": "laundry/odor/towel-01",
  "洗剤を増やしても落ちない理由": "laundry/detergent/amount-01",
  "毛布を自宅の洗濯機で洗う前の確認": "laundry/bedding/blanket-01",
  "ダウンジャケットを自宅で洗う前の確認": "laundry/clothes/down-jacket-01",
  "洗濯槽の黒い汚れとにおいの掃除の頻度": "laundry/machine/tub-cleaning-01",
  // 収納・片づけ
  "衣替えの虫食いを防ぐクローゼット収納": "storage/closet/moth-prevention-01",
  "収納の高さを見直す防災の片づけ": "storage/disaster/furniture-fall-01",
  "玄関にコートが溜まる上着の置き場所": "storage/entrance/coat-place-01",
  "洗面所の小物が散らかる置き方の決め方": "storage/washroom/small-items-01",
  "郵便物と書類が溜まるテーブルの置き場所": "storage/paperwork/mail-pile-01",
  // 節約・家計
  "電気代を下げる順番と家庭の用途別内訳": "money/utilities/electricity-order-01",
  "冬にガス代が上がる理由とお湯の使い方": "money/utilities/gas-winter-01",
  "家計の見直しはどの費目から手をつけるか": "money/budget/review-order-01",
  "家計簿が続かない人の記録項目の絞り方": "money/budget/record-items-01",
  "食費が増えた月の内訳の見方": "money/food-cost/monthly-breakdown-01",
  // 食・料理
  "家庭の食品ロスを減らす冷蔵庫の定位置づくり": "food/fridge/forgotten-food-01",
  "作り置きと残り物の温度管理": "food/meal-prep/leftover-judge-01",
  "作り置きは冷ます工程で決まる": "food/meal-prep/cooling-01",
  "米の保存容器は野菜室を測ってから選ぶ": "food/storage/rice-container-01",
  "じゃがいもと玉ねぎの常温保存と芽": "food/storage/potato-onion-01",
  "きのこを買いすぎた時の冷凍保存": "food/freezing/mushroom-01",
  "冷凍ご飯がパサつかない包み方と温め直し": "food/freezing/rice-01",
  // 住まい・インテリア
  "結露は拭くより湿度で止める": "home/humidity/window-condensation-01",
  "床の底冷えをラグと敷き方で和らげる": "home/cold/floor-chill-01",
  "賃貸で壁に傷をつけずに掛ける前の確認": "home/rental/wall-hanging-01",
  "部屋ごとの照明の色の使い分け": "home/lighting/room-colors-01",
  // 生活家電
  "エアコンのフィルター掃除と消費電力": "appliances/air-conditioner/filter-01",
  "暖房の効きをサーキュレーターで整える置き方": "appliances/heating/circulator-01",
  "除湿機は方式で選ぶ": "appliances/dehumidifier/type-01",
  "加湿器の使い始めの手入れ": "appliances/humidifier/start-care-01",
  "電気ケトルの白い汚れの落とし方と頻度": "appliances/kettle/limescale-01",
  // 暮らしの知恵
  "ローリングストックで続ける家庭備蓄": "tips/stockpile/rolling-stock-01",
  "備蓄は水の量から逆算する": "tips/stockpile/water-01",
  "備蓄の食品の品目を決める順番": "tips/stockpile/food-items-01",
  "家庭内の事故はどこで多いのか": "tips/safety/home-accidents-01",
  "出火原因は建物火災に絞ると順位が変わる": "tips/safety/fire-causes-01",
  "ヒートショック対策は入浴前から上がるまでの手順で決まる": "tips/safety/heat-shock-01",
  "冬の静電気を減らすドアノブと服": "tips/winter/static-01",
  "使い捨てカイロの貼る貼らないと低温やけど": "tips/winter/body-warmer-01",
  "宅配便の再配達を減らす受け取り方の選び方": "tips/delivery/redelivery-01",
  // 睡眠・休息
  "眠りの質を上げる寝室環境の整え方": "sleep/bedroom/morning-light-01",
  "寝室の光と温度から整える眠り": "sleep/bedroom/light-temperature-01",
  "休日の寝だめは起床時刻のずれを測って止める": "sleep/rhythm/weekend-lag-01",
  "電気毛布と湯たんぽの使い分け": "sleep/warming/electric-blanket-01",
  "寝る前にスマホを見てしまう人の置き場所": "sleep/habits/phone-place-01",
  "昼寝を夜の眠りに響かせない長さと時刻": "sleep/habits/nap-01",
};

// 記事slug(ファイル名から.mdを除いたもの。日付つき)から、台帳のキー(先頭の日付を除いた名前)を返す。
function keyOf(slug) {
  return String(slug).replace(/^\d{4}-\d{2}-\d{2}_/, "");
}

// 記事slugから、/posts/ 以下のパス(先頭スラッシュなし)を返す。台帳に無い記事はslugそのもの(旧形式)。
function permalinkOf(slug) {
  return PERMALINKS[keyOf(slug)] || slug;
}

// 記事ページのURLパス(先頭スラッシュあり)。
function postPath(slug) {
  return "/posts/" + permalinkOf(slug);
}

// /posts/ 以下のパス(配列または文字列)から記事slugを引く。allSlugs は全記事のslug一覧。見つからなければ null。
function slugFromPermalink(pathParts, allSlugs) {
  const joined = Array.isArray(pathParts) ? pathParts.join("/") : String(pathParts || "");
  const hit = (allSlugs || []).find((s) => permalinkOf(s) === joined);
  if (hit) return hit;
  // 台帳に載っていない記事は、旧形式(slugそのもの)で届く
  return joined.includes("/") ? null : joined;
}

module.exports = { MAJOR_SEGMENTS, PERMALINKS, keyOf, permalinkOf, postPath, slugFromPermalink };
