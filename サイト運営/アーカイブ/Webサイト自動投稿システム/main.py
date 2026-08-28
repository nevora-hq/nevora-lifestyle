"""Webサイト記事公開の自動化スクリプト(PDCAサイクルの Do/Check/Act 部分)。

Do    : サブエージェント(分析者/ライター/マーケター/法務/レビューアー/編集長)が作成した
        確定稿(サイト運営/記事データ/確定稿/*.md)を読み込み、サイト本体のcontentディレクトリへ配置し、
        Gitでcommit・pushして公開する(pushによりVercelが自動でビルド・デプロイする)
Check : analytics.collect_metrics() でアクセス解析・アフィリエイト成果を記録する
Act   : analytics.build_insights() で過去実績の傾向をまとめ、次回の記事企画(マーケター/project-manager)へ活かす
"""
import argparse
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, "src")

from db import init_db, insert_post, mark_published, mark_failed
from analytics import collect_metrics, build_insights
from publishers.website_publisher import publish_article

ARTICLE_DIR = Path(__file__).resolve().parent.parent.parent / "記事データ"
DRAFT_DIR = ARTICLE_DIR / "確定稿"
DONE_DIR = ARTICLE_DIR / "公開済み"


def run_publish():
    """確定稿フォルダから最も古い記事を1件、サイトへ公開する"""
    if not DRAFT_DIR.exists():
        print(f"確定稿フォルダが見つかりません: {DRAFT_DIR}")
        return

    candidates = sorted(DRAFT_DIR.glob("*.md"), key=lambda f: f.stat().st_mtime)
    if not candidates:
        print(f"公開待ちの確定稿がありません: {DRAFT_DIR}")
        return

    target = candidates[0]
    title = target.stem
    post_id = insert_post(title, str(target))
    print(f"確定稿「{target.name}」を公開します")

    try:
        commit_hash = publish_article(target)
        mark_published(post_id, commit_hash)
        DONE_DIR.mkdir(parents=True, exist_ok=True)
        target.rename(DONE_DIR / target.name)
        print(f"公開完了 (commit={commit_hash})。ファイルを移動しました: {DONE_DIR / target.name}")
    except Exception as e:
        mark_failed(post_id)
        print(f"公開失敗: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="確定稿のサイト公開・アクセス解析収集")
    parser.add_argument("command", choices=["publish", "publish-all", "collect"])
    args = parser.parse_args()

    init_db()

    if args.command == "publish":
        run_publish()
    elif args.command == "publish-all":
        while DRAFT_DIR.exists() and list(DRAFT_DIR.glob("*.md")):
            run_publish()
    elif args.command == "collect":
        collect_metrics()
        print(build_insights())
