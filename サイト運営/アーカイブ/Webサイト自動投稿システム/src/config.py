from pathlib import Path

# Webサイト/ ルート(このファイルから見て サイト運営/アーカイブ/Webサイト自動投稿システム/src の4つ上)
REPO_ROOT = Path(__file__).resolve().parents[4]

# サイト本体(Next.js)の記事Markdown配置先
SITE_CONTENT_DIR = REPO_ROOT / "サイト運営" / "サイト本体" / "content"

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "posts.db"
