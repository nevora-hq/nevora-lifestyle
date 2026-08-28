"""公開記事のアクセス解析・アフィリエイト成果の集計とインサイト生成(Check/Actにあたる部分)。

GA4・各ASPのAPI連携は未実装のため、マーケターサブエージェント等が
`サイト運営/記事データ/アクセス解析/metrics.json` に書き出した集計結果を取り込む方式にしている。
形式: [{"title": "確定稿のファイル名(拡張子なし)", "page_views": 0, "affiliate_clicks": 0, "affiliate_conversions": 0}, ...]
"""
import json
from pathlib import Path

from db import get_conn, get_published, insert_metrics

METRICS_FILE = Path(__file__).resolve().parent.parent.parent.parent / "記事データ" / "アクセス解析" / "metrics.json"


def collect_metrics():
    """公開済み記事について、metrics.jsonの最新集計をDBに記録する"""
    if not METRICS_FILE.exists():
        print(f"アクセス解析データが見つかりません: {METRICS_FILE}\n"
              "マーケターサブエージェントにGA4・ASP実績の集計を依頼してください。")
        return

    data = {row["title"]: row for row in json.loads(METRICS_FILE.read_text(encoding="utf-8"))}
    posts = get_published()
    for post in posts:
        m = data.get(post["title"])
        if not m:
            continue
        insert_metrics(
            post["id"],
            m.get("page_views", 0),
            m.get("affiliate_clicks", 0),
            m.get("affiliate_conversions", 0),
        )


def build_insights() -> str:
    """過去の公開実績から、次の記事企画に活かせる傾向をテキストでまとめる"""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT p.title, m.page_views, m.affiliate_clicks, m.affiliate_conversions
            FROM posts p
            JOIN metrics m ON m.post_id = p.id
            ORDER BY m.collected_at DESC
            """
        ).fetchall()

    if not rows:
        return "蓄積されたアクセス解析データがありません。"

    best = sorted(rows, key=lambda r: (r["affiliate_conversions"] or 0) * 10 + (r["page_views"] or 0))[-3:]

    lines = ["成果が良かった記事の傾向:"]
    for r in reversed(best):
        lines.append(
            f"- 「{r['title']}」 PV{r['page_views']} クリック{r['affiliate_clicks']} 成約{r['affiliate_conversions']}"
        )
    return "\n".join(lines)
