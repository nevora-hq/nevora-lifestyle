import Layout from "../components/Layout";
import { buildAboutPersonJsonLd, buildOrganizationJsonLd } from "../lib/structuredData";

// 制作プロセスの各工程。実際の制作フローに存在する工程のみを記載する
// (docs/two-layer-design-spec.md準拠: 存在しない工程を足さない)。
const PROCESS_STEPS = [
  { label: "リサーチ", note: "テーマ・キーワードを調査します" },
  { label: "執筆・構成(AI活用)", note: "記事の下書き・構成を作成します" },
  { label: "出典確認", note: "内容の裏付けとなる出典を確認します(一次情報を優先)" },
  { label: "法務チェック", note: "薬機法・景品表示法などの観点で表現を確認します" },
  { label: "編集レビュー", note: "構成・論理・読みやすさを編集部が確認します" },
  { label: "公開", note: "内容を最終確認した上で公開します" },
];

// このページの最終更新日。内容を書き換えたときは必ず更新する。
const LAST_UPDATED = "2026年8月24日";

export default function About() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const organizationJsonLd = buildOrganizationJsonLd(siteUrl);
  const personJsonLd = buildAboutPersonJsonLd(siteUrl);

  return (
    <Layout
      title="運営者情報・編集方針 | 生活を豊かにする総合ガイド｜NEVORA"
      description="生活を豊かにする総合ガイド｜NEVORAの運営者情報と編集方針です。運営者・出典の扱い・AIの利用範囲・広告ポリシーを公開しています。"
      canonicalPath="/about"
      jsonLd={[organizationJsonLd, personJsonLd].filter(Boolean)}
    >
      <h1 className="page-title">運営者情報・編集方針</h1>
      <div className="article-body">
        <p>
          NEVORAは、家事・掃除・洗濯・収納・節約・料理をはじめとする暮らしの疑問に対して、公的機関・業界団体・メーカー公表情報などの確認できる情報源に基づいて答えることを目的とした、生活情報の総合ガイドです。
        </p>

        <h2>サイト概要</h2>
        <table className="compare-table">
          <tbody>
            <tr>
              <th style={{ width: "30%" }}>サイト名</th>
              <td>生活を豊かにする総合ガイド｜NEVORA</td>
            </tr>
            <tr>
              <th>URL</th>
              <td>https://nevora-beauty.com/</td>
            </tr>
            <tr>
              <th>運営者</th>
              <td>眞井 虹輝(まない こうき)</td>
            </tr>
            <tr>
              <th>運営形態</th>
              <td>個人運営</td>
            </tr>
            <tr>
              <th>所在地</th>
              <td>東京都新宿区</td>
            </tr>
            <tr>
              <th>開設</th>
              <td>2026年7月</td>
            </tr>
            <tr>
              <th>お問い合わせ</th>
              <td>
                <a href="/contact">お問い合わせページ</a>
                (nevora01123@gmail.com)
              </td>
            </tr>
          </tbody>
        </table>

        <h2>運営者について</h2>
        <p>
          <strong>眞井 虹輝(まない こうき)</strong>
        </p>
        <p>
          大学で医学を学び(医学部卒)、卒業後はWeb制作の分野で6年にわたりサイトの企画・制作に携わってきました。NEVORAでは、医学部で身につけた「一次情報・学術情報にあたって確かめる」姿勢と、Web制作の経験を組み合わせ、AIを活用した制作体制のもとで記事の企画・確認・運営までを一人で担っています。
        </p>
        <p>
          本サイトに関するご意見・取材・お仕事のご依頼は、
          <a href="/contact">お問い合わせページ</a>
          に記載のメールアドレスまでご連絡ください。
        </p>

        <h2>NEVORAが大切にしていること</h2>
        <p>
          暮らしの情報は、「これだけでOK」「劇的に変わる」といった強い言葉があふれる一方で、その根拠が示されないまま広がっていくことが少なくありません。NEVORAは、断定できることと断定できないことを区別し、<strong>出典を示せる情報だけを記事にする</strong>ことを運営の軸にしています。
        </p>
        <ul>
          <li>
            記事内の重要な事実には、消費者庁・国民生活センター・経済産業省などの公的機関、業界団体の公表資料、メーカーの公式発表といった確認可能な出典を記載します
          </li>
          <li>「個人の感想」と「確認された事実」を混在させず、体験談を事実のように扱いません</li>
          <li>住宅設備・家電・洗剤など、扱い方を誤ると事故につながりうる内容では、メーカーの取扱説明書・公式情報の確認を促す書き方を徹底します</li>
        </ul>

        <h2>制作プロセスの開示</h2>
        <p>記事は、次のような流れで制作・公開しています。</p>

        <ol className="about-process-steps" aria-label="記事制作の6つの工程">
          {PROCESS_STEPS.map((step, i) => (
            <li key={step.label}>
              <span className="about-process-num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="about-process-body">
                <span className="about-process-label">{step.label}</span>
                <span className="about-process-note">{step.note}</span>
              </span>
            </li>
          ))}
        </ol>

        <h2>AIの利用について</h2>
        <p>
          NEVORAでは、記事の下書き・図解・診断コンテンツの制作に<strong>AI(生成AI)を活用しています</strong>。これを隠すのではなく、どのように使い、どこを人間が担っているかを明示することが、読者への誠実さだと考えています。
        </p>

        <h3>AIが担っている工程</h3>
        <ul>
          <li>検索意図の分析と記事構成の設計</li>
          <li>本文の下書き生成</li>
          <li>図解・比較スライド・セルフ診断コンテンツの生成</li>
        </ul>

        <h3>人間(運営者)が担っている工程</h3>
        <ul>
          <li>
            <strong>出典の実在確認</strong>
            :記事内で引用する公的資料・発表資料に実際にアクセスし、記載内容と一致しているかを確認します
          </li>
          <li>
            <strong>公開可否の判断</strong>
            :誤解が事故・故障・金銭的な損失につながりうるテーマは、表現を確認・修正のうえ公開しています
          </li>
          <li>
            <strong>記事の更新・削除の判断</strong>
            :情報が古くなった記事、出典が更新された記事は、修正または非公開の対応を行います
          </li>
        </ul>
        <p>
          AIは「速く・分かりやすく書く」ための道具であり、<strong>掲載する内容の責任はすべて運営者にあります。</strong>
        </p>

        <h2>出典・引用のルール</h2>
        <ul>
          <li>一次情報(公的機関・学会・メーカー公式)を優先し、まとめサイト・個人ブログのみを根拠とした記述は行いません</li>
          <li>出典は記事末尾の「出典」欄に、発行元・資料名・発表日とあわせてリンクを記載します</li>
          <li>統計や件数などの数値は、出典資料に記載された数値をそのまま用い、切り取りによって印象が変わる編集を行いません</li>
        </ul>

        <h2>安全に関わる情報の取り扱い</h2>
        <ul>
          <li>
            本サイトの記事は一般的な情報提供を目的としており、<strong>製品の取扱説明書やメーカーの案内に代わるものではありません</strong>
          </li>
          <li>住まいの設備・家電・洗剤の扱いは製品や環境によって条件が異なるため、記事内では必ず公式情報の確認を促しています</li>
          <li>
            資格や許可が必要な作業(電気工事・ガス設備の工事など)については、制度上の位置づけを出典とともに記載し、読者自身での実施をすすめる表現は行いません
          </li>
        </ul>

        <h2>広告・アフィリエイトポリシー</h2>
        <ul>
          <li>本サイトではアフィリエイト広告(Amazonアソシエイト・ASP等)を利用する場合があります</li>
          <li>広告を含む箇所には「PR」表記を付し、広告であることが分からない形での掲載は行いません</li>
          <li>
            <strong>広告報酬の有無や単価は、記事内の評価・掲載順・結論に影響させません</strong>
          </li>
          <li>広告主から金銭を受け取って評価を変更する、いわゆるステルスマーケティングは一切行いません</li>
        </ul>

        <h2>訂正・更新について</h2>
        <ul>
          <li>
            記事の誤りにお気づきの場合は、
            <a href="/contact">お問い合わせページ</a>
            に記載のメールアドレスまでご連絡ください
          </li>
          <li>誤りが確認された場合は速やかに訂正し、内容に重要な変更があった記事には更新日を記載します</li>
          <li>出典元の資料が更新・撤回された場合は、記事の修正または公開停止で対応します</li>
        </ul>
        <p>
          なお、誤字脱字の修正など、内容の実質的な変更を伴わない軽微な修正については、最終更新日を変更しない場合があります。
        </p>

        <h2>免責事項・プライバシーポリシー</h2>
        <p>
          当サイトに掲載する情報については、正確性・安全性を保証するものではありません。詳細は
          <a href="/terms">免責事項・利用規約</a>
          をご確認ください。個人情報の取り扱いについては
          <a href="/privacy-policy">プライバシーポリシー</a>
          をご確認ください。
        </p>

        <p className="about-last-updated">最終更新日:{LAST_UPDATED}</p>
      </div>
    </Layout>
  );
}
