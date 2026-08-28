// 記事末尾に表示する注記。製品の仕様・価格・サービス内容は変化するため、
// 記事執筆時点の情報である旨と、公式情報の確認を促す文言を表示する。
// スタイルは記事本文中の注意ボックス(lib/posts.jsのblockquote変換)と同じ
// .warning-box系を流用し、既存の見た目のトーンと統一する。
//
// opt-out方式: 全記事デフォルト表示とし、frontmatterに `disclaimer: none` が
// 明示されている記事のみ非表示にする。
export function shouldShowArticleDisclaimer(disclaimer) {
  return disclaimer !== "none";
}

export default function ArticleDisclaimer() {
  return (
    <div className="warning-box">
      <span className="warning-box-icon" aria-hidden="true">
        ⚠️
      </span>
      <div className="warning-box-body">
        <p className="warning-box-label">注意</p>
        <p>
          本記事は執筆時点の情報をもとにした一般的な情報提供を目的としています。住まいの設備・家電・洗剤などの扱い方は製品や環境によって条件が異なるため、実際に試す際はメーカーの取扱説明書・公式サイトで最新の情報をご確認ください。
        </p>
      </div>
    </div>
  );
}
