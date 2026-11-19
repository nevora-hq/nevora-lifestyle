import SectionBand from "./SectionBand";

// 下層ページ冒頭の写真ヒーロー。トップの写真バンド(SectionBand)を再利用し、
// 英語1語(eyebrow)→ h1 → 短い説明(lead)を重ねる。1ページに1つのh1。
// 直下の .page-panel は CSS で少し上に重なる(.page-hero + .container > .page-panel)。
export default function PageHero({ eyebrow, title, lead, variant = 1 }) {
  return (
    <div className="page-hero">
      <SectionBand
        base={`/images/band/band-0${variant === 2 ? 2 : 1}`}
        widths={[640, 1024, 1536]}
        objectPosition="50% 45%"
      >
        {eyebrow && <p className="page-hero-eyebrow">{eyebrow}</p>}
        <h1 className="page-hero-title">{title}</h1>
        {lead && <p className="section-band-lead">{lead}</p>}
      </SectionBand>
    </div>
  );
}
