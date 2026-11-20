// トップページのファーストビュー(雑誌型 full-bleedヒーロー)。
// 画像はLayoutの外側(container外)に描画されるため、CSSを足さなくても画面幅いっぱいに広がる。
// LCP対策として pages/index.js 側で同じURLを rel="preload" しており、
// ここでは lazy を付けず fetchPriority="high" で即時読み込みさせる。
// リード文の上下に置く飾り罫(装飾のみ。読み上げ対象外)
function HeroOrnament({ bottom = false }) {
  return (
    <div className={bottom ? "hero-banner-orn hero-banner-orn--bottom" : "hero-banner-orn"} aria-hidden="true">
      <svg className="hero-banner-orn-curl" viewBox="0 0 16 16" focusable="false"><path d="M14 8c0-5-9-5-9 1 0 3 4 3 4 0" /></svg>
      <svg className="hero-banner-orn-wave" viewBox="0 0 100 12" preserveAspectRatio="none" focusable="false"><path d="M0 6C14 -1 30 13 46 6S80 -1 100 6" /></svg>
      <svg className="hero-banner-orn-center" viewBox="0 0 44 16" focusable="false">
        <path className="hero-banner-orn-fill" d="M22 1.5l5 6.5-5 6.5-5-6.5z" />
        <path className="hero-banner-orn-fill" d="M3 8c4-5 9-5 14 0-5 5-10 5-14 0zM27 8c5-5 10-5 14 0-4 5-9 5-14 0z" />
      </svg>
      <svg className="hero-banner-orn-wave hero-banner-orn-wave--r" viewBox="0 0 100 12" preserveAspectRatio="none" focusable="false"><path d="M0 6C14 -1 30 13 46 6S80 -1 100 6" /></svg>
      <svg className="hero-banner-orn-curl hero-banner-orn-curl--r" viewBox="0 0 16 16" focusable="false"><path d="M14 8c0-5-9-5-9 1 0 3 4 3 4 0" /></svg>
    </div>
  );
}

export default function HeroBanner() {
  return (
    <section className="hero-banner">
      {/* srcsetの各幅は scripts/generate-hero-image.js で生成する。
          full-bleed(画面幅いっぱい)のため sizes は 100vw。
          元画像が1536pxのため最大は1536w(それ以上は拡大になるので作らない)。 */}
      <img
        src="/images/hero/home-hero.webp"
        srcSet="/images/hero/home-hero-640.webp 640w, /images/hero/home-hero-1024.webp 1024w, /images/hero/home-hero-1536.webp 1536w"
        sizes="100vw"
        alt=""
        className="hero-banner-img"
        fetchPriority="high"
        decoding="async"
      />
      {/* 暖色ウォッシュ→スクリムの順で重ねる(CSSのレイヤー構成コメント参照) */}
      <div className="hero-banner-warm" aria-hidden="true" />
      <div className="hero-banner-scrim" aria-hidden="true" />
      <div className="hero-banner-overlay">
        <div className="hero-banner-inner">
          <div className="hero-banner-copy">
            <p className="hero-banner-eyebrow">WEB MAGAZINE</p>
            <h1 className="hero-banner-title">
              生活を豊かにする<em className="hero-banner-title-em">総合ガイド</em>
              <span className="hero-banner-title-sep">｜</span>
              <span className="hero-banner-title-brand">NEVORA</span>
            </h1>
            <div className="hero-banner-leadwrap">
              <HeroOrnament />
              <p className="hero-banner-lead">
                暮らし<span className="hero-banner-particle">の</span>悩み
                <span className="hero-banner-particle">や</span>疑問
                <span className="hero-banner-particle">に</span>
                、<br className="hero-banner-br" />信頼できる情報<span className="hero-banner-particle">で</span>
                <span className="hero-banner-nobreak">寄り添う総合ガイド</span>
              </p>
              <HeroOrnament bottom />
            </div>
          </div>
        </div>
      </div>
      <div className="hero-banner-mascot">
        <img
          src="/images/mascot/kuramin-normal.svg"
          alt="NEVORA公式マスコット クラミンちゃん"
          width={72}
          height={72}
          loading="eager"
        />
        <span className="hero-banner-mascot-name">クラミン</span>
      </div>
    </section>
  );
}
