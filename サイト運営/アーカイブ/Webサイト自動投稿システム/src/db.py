import sqlite3
from contextlib import contextmanager

from config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                 -- 記事タイトル(確定稿ファイル名)
    file_path TEXT NOT NULL,             -- 確定稿ファイルのパス
    status TEXT NOT NULL DEFAULT 'draft',-- draft / published / failed
    commit_hash TEXT,                    -- 公開時のGitコミットハッシュ
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    published_at TEXT
);

CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    collected_at TEXT NOT NULL DEFAULT (datetime('now')),
    page_views INTEGER DEFAULT 0,
    affiliate_clicks INTEGER DEFAULT 0,
    affiliate_conversions INTEGER DEFAULT 0
);
"""


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)


def insert_post(title: str, file_path: str) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO posts (title, file_path) VALUES (?, ?)",
            (title, file_path),
        )
        return cur.lastrowid


def mark_published(post_id: int, commit_hash: str):
    with get_conn() as conn:
        conn.execute(
            "UPDATE posts SET status = 'published', commit_hash = ?, published_at = datetime('now') WHERE id = ?",
            (commit_hash, post_id),
        )


def mark_failed(post_id: int):
    with get_conn() as conn:
        conn.execute("UPDATE posts SET status = 'failed' WHERE id = ?", (post_id,))


def insert_metrics(post_id: int, page_views: int, affiliate_clicks: int, affiliate_conversions: int):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO metrics (post_id, page_views, affiliate_clicks, affiliate_conversions) VALUES (?, ?, ?, ?)",
            (post_id, page_views, affiliate_clicks, affiliate_conversions),
        )


def get_published():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM posts WHERE status = 'published'").fetchall()
        return [dict(r) for r in rows]
