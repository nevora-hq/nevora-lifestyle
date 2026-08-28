"""確定稿MarkdownをサイトのcontentディレクトリへコピーしてGitでcommit・pushする"""
import shutil
import subprocess
from pathlib import Path

from config import REPO_ROOT, SITE_CONTENT_DIR


def publish_article(md_path: Path) -> str:
    """記事Markdownをサイト本体のcontentディレクトリへ配置し、Git公開してコミットハッシュを返す

    pushによりVercelが自動でビルド・デプロイする。
    """
    SITE_CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    dest = SITE_CONTENT_DIR / md_path.name
    shutil.copy2(md_path, dest)

    _run_git(["add", str(dest)])
    _run_git(["commit", "-m", f"記事公開: {md_path.stem}"])
    _run_git(["push"])

    return _run_git(["rev-parse", "HEAD"]).strip()


def _run_git(args: list[str]) -> str:
    result = subprocess.run(
        ["git", *args], cwd=REPO_ROOT, capture_output=True, text=True, encoding="utf-8"
    )
    if result.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} 失敗: {result.stderr.strip()}")
    return result.stdout
