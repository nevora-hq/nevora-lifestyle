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
            毎日の暮らしを、少しだけ心地よく。生活の知恵とおすすめが見つかるサイト
          </p>
        </div>
      </div>
    </section>
  );
}
