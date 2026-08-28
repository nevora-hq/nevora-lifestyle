import Layout from "../components/Layout";

// 問い合わせはメール直行(mailto)を主動線とする。
// フォーム配信サービス(Formspree)は2026-08-28に廃止した。送信失敗の分岐や
// 「フォームが使えないとき」の代替動線を持たせると導線が二重になるため、
// このページはメールアドレスの明示とmailtoリンクだけで構成する。
const CONTACT_EMAIL = "nevora01123@gmail.com";
const MAIL_SUBJECT = "【生活を豊かにする総合ガイド｜NEVORA】お問い合わせ";
const MAIL_BODY = [
  "※ 以下の項目をご記入のうえ送信してください。",
  "",
  "お名前:",
  "ご連絡先メールアドレス:",
  "お問い合わせ内容:",
  "",
].join("\n");

const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  MAIL_SUBJECT
)}&body=${encodeURIComponent(MAIL_BODY)}`;

export default function Contact() {
  return (
    <Layout
      title="お問い合わせ | 生活を豊かにする総合ガイド｜NEVORA"
      description="生活を豊かにする総合ガイド｜NEVORAへのお問い合わせページです。メールにてご連絡ください。"
      canonicalPath="/contact"
    >
      <h1 className="page-title">お問い合わせ</h1>
      <div className="article-body">
        <p>
          記事内容に関するご意見・ご指摘、掲載情報の訂正依頼、その他のお問い合わせは、
          下記のメールアドレスまでご連絡ください。内容を確認のうえ、必要に応じて運営者よりご返信いたします。
        </p>

        <p className="contact-address">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>

        <p>
          <a href={mailtoHref} className="affiliate-link-btn contact-mail-btn">
            メールソフトで問い合わせを作成する
          </a>
        </p>

        <p className="page-note">
          ボタンを押すと、お使いのメールソフトで件名と記入項目が入った下書きが開きます。
          メールソフトが開かない環境では、上のアドレスをコピーしてご利用ください。
        </p>

        <h2>ご連絡いただく際のお願い</h2>
        <ul>
          <li>お名前(ハンドルネーム可)とご連絡先メールアドレスを本文にご記入ください</li>
          <li>記事に関するご指摘の場合は、対象記事のURLを添えていただけると確認がスムーズです</li>
          <li>
            個別の健康・法律・金銭に関する相談や、個人の状況に応じた判断へのご回答はいたしかねます
          </li>
          <li>内容によっては、返信までにお時間をいただく場合や、返信を差し控える場合があります</li>
        </ul>

        <p className="page-note" style={{ marginBottom: 0 }}>
          お送りいただいた内容は、お問い合わせへの対応のみに利用します。詳しくは
          <a href="/privacy-policy">プライバシーポリシー</a>
          をご確認ください。
        </p>
      </div>
    </Layout>
  );
}
