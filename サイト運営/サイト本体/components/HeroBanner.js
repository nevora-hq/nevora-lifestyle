// トップページのファーストビュー(雑誌型 full-bleedヒーロー)。
// 画像はLayoutの外側(container外)に描画されるため、CSSを足さなくても画面幅いっぱいに広がる。
// LCP対策として pages/index.js 側で同じURLを rel="preload" しており、
// ここでは lazy を付けず fetchPriority="high" で即時読み込みさせる。
export default function HeroBanner() {
  return (
    <section className="hero-banner">
      {/* srcsetの各幅は scripts/generate-hero-image.js で生成する。
          full-bleed(画面幅いっぱい)のため sizes は 100vw。
          元画像が1717pxのため最大は1600w(それ以上は拡大になるので作らない)。 */}
      <img
        src="/images/hero/home-hero.webp"
        srcSet="/images/hero/home-hero-640.webp 640w, /images/hero/home-hero-1024.webp 1024w, /images/hero/home-hero-1600.webp 1600w"
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
            <h1 className="hero-banner-title">生活を豊かにする総合ガイド｜NEVORA</h1>
            <p className="hero-banner-lead">
              暮らしの悩みや疑問に、信頼できる情報で寄り添う総合ガイド
            </p>
          </div>
        </div>
      </div>
      <div className="hero-banner-mascot">
        <img
          src="/images/mascot/nevomin-normal.svg"
          alt="NEVORA公式マスコット ネヴォミンちゃん"
          width={72}
          height={72}
          loading="eager"
        />
        <span className="hero-banner-mascot-name">ネヴォミン</span>
      </div>
    </section>
  );
}
