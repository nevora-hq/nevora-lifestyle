export default function HeroBanner() {
  return (
    <section className="hero-banner">
      <img
        src="/images/hero/home-hero.webp"
        alt=""
        className="hero-banner-img"
        fetchPriority="high"
      />
      <div className="hero-banner-overlay">
        <div className="container hero-banner-inner">
          <p className="hero-banner-eyebrow">WEB MAGAZINE</p>
          <h1 className="hero-banner-title">暮らしを豊かにする総合ガイド｜NEVORA</h1>
          <p className="hero-banner-lead">
            暮らし・住まい・健康・食・趣味など、日々の生活を豊かにする情報をわかりやすく解説します。
          </p>
        </div>
      </div>
    </section>
  );
}
