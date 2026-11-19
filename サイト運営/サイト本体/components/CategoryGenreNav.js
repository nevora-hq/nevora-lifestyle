import { CATEGORY_GENRES, genreNavMode } from "../lib/categoryGenres";

// 24x24の線画アイコン(外部ライブラリなし)。ジャンルの icon キーで引く。
const GENRE_ICONS = {
  broom: (
    <>
      <path d="M14 3l-4.5 8" />
      <path d="M6.5 11h6l3 3-2.5 7H5l-1.5-7z" />
      <path d="M8 15l-1 6M11 15l-.5 6" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.4.7-2.4 1.8 0 2.5 5 1.2 5 3.7 0 1.1-1.1 1.8-2.6 1.8-1.1 0-2-.4-2.6-1.200" />
      <path d="M12 6.5V8M12 16v1.500" />
    </>
  ),
  moon: (
    <>
      <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
      <path d="M16 4v3M14.5 5.5h3" />
    </>
  ),
};

function GenreIcon({ id }) {
  return (
    <svg
      className="genre-circle-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GENRE_ICONS[id] || <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

// selected: 選択中のジャンルid(null=すべて)。円は再クリックしてもトグルしない。
export default function CategoryGenreNav({ selected, onSelect }) {
  const n = CATEGORY_GENRES.length;
  const mode = genreNavMode(n);
  if (mode === "none") return null;

  if (mode === "chips") {
    return (
      <nav className="genre-nav genre-nav--chips" aria-label="ジャンルで絞り込む">
        <button
          type="button"
          className={`genre-chip${selected === null ? " is-active" : ""}`}
          aria-pressed={selected === null}
          onClick={() => onSelect(null)}
        >
          すべて
        </button>
        {CATEGORY_GENRES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`genre-chip${selected === g.id ? " is-active" : ""}`}
            style={{ "--g-soft": g.soft, "--g-line": g.line }}
            aria-pressed={selected === g.id}
            onClick={() => onSelect(g.id)}
          >
            {g.label}
          </button>
        ))}
      </nav>
    );
  }

  // 隣の円の中心間距離 ÷ 直径 ≈ 0.7 を保ち、リング外にはみ出さない配置を式で求める
  const s = Math.sin(Math.PI / n);
  const R = 49.5 / (1 + s / 0.7);
  const D = (2 * R * s) / 0.7;

  return (
    <nav className="genre-nav" aria-label="ジャンルで絞り込む">
      <div className="genre-nav-ring">
        {CATEGORY_GENRES.map((g, i) => {
          const angle = ((-90 + (360 / n) * i) * Math.PI) / 180;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const active = selected === g.id;
          return (
            <button
              key={g.id}
              type="button"
              className={`genre-circle${active ? " is-active" : ""}`}
              style={{
                left: `${(50 + R * cos).toFixed(2)}%`,
                top: `${(50 + R * sin).toFixed(2)}%`,
                width: `${D.toFixed(2)}%`,
                "--ox": `${(cos * 14).toFixed(1)}%`,
                "--oy": `${(sin * 14).toFixed(1)}%`,
                "--g-soft": g.soft,
                "--g-line": g.line,
              }}
              aria-pressed={active}
              onClick={() => onSelect(g.id)}
            >
              <span className="genre-circle-body">
                <GenreIcon id={g.icon} />
                <span className="genre-circle-label">{g.label}</span>
                <span className="genre-circle-count">{g.categories.length}カテゴリ</span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className={`genre-hub${selected === null ? " is-active" : ""}`}
          aria-pressed={selected === null}
          aria-label="すべてのカテゴリを表示"
          onClick={() => onSelect(null)}
        >
          <img src="/images/logo-mark.png" alt="" width={40} height={40} className="genre-hub-mark" />
          <span className="genre-hub-name">NEVORA</span>
        </button>
      </div>
    </nav>
  );
}
