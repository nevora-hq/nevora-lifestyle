# -*- coding: utf-8 -*-
"""
pinterest-pins-生活/manifest.csv(generate-pinterest-pins.jsが出力)の内容を、
pinterest-pins-生活/pinterest-生活.xlsx(ユーザーが美容サイト版から複製した実体)の
末尾の空き行に追記する。

  python scripts/append_pinterest_rows.py

列構成(A〜I。ユーザーが用意した美容サイト版と同じ):
  A: 投稿日(数式 =DATE(2026,9,11)+INT((ROW()-ROW($A$2))/2) をそのままコピーする)
  B: 投稿時間(行の偶奇で "21:00〜21:30" / "7:00〜7:30" を交互に。既存行のパターンを継続する)
  C: 画像名(slug)
  D: 記事URL
  E: ステータス(新規行は必ず「未投稿」。既存行は変更しない)
  F: カテゴリ名
  G: ボード名
  H: ピンタイトル案
  I: ピン説明文案

追記位置は固定行番号ではなく、C列(画像名)が空になっている最初の行から。
すでにC列にそのslugがある行はスキップする(二重追記防止)。
xlsxの他の書式・行(美容サイトのサンプル行等)は変更しない。
"""
import csv
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("openpyxlが見つかりません。`pip install openpyxl` を実行してください。", file=sys.stderr)
    sys.exit(1)

PIN_DIR = Path(__file__).resolve().parents[3] / "pinterest-pins-生活"
MANIFEST_PATH = PIN_DIR / "manifest.csv"
XLSX_PATH = PIN_DIR / "pinterest-生活.xlsx"
FORMULA = "=DATE(2026,9,11)+INT((ROW()-ROW($A$2))/2)"


def load_manifest():
    with open(MANIFEST_PATH, "r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))
    return rows[1:]  # header除く: slug,url,category,board,pinTitle,pinDescription


def main():
    if not MANIFEST_PATH.exists():
        print(f"[pins] manifest.csvが見つかりません: {MANIFEST_PATH}", file=sys.stderr)
        sys.exit(1)
    if not XLSX_PATH.exists():
        print(f"[pins] pinterest-生活.xlsxが見つかりません: {XLSX_PATH}", file=sys.stderr)
        sys.exit(1)

    manifest_rows = load_manifest()
    wb = openpyxl.load_workbook(XLSX_PATH)
    ws = wb.active

    existing_slugs = set()
    last_used_row = 1
    for r in range(2, ws.max_row + 1):
        slug = ws.cell(row=r, column=3).value
        if slug:
            existing_slugs.add(slug)
            last_used_row = r

    next_row = last_used_row + 1
    added = 0
    for slug, url, category, board, pin_title, pin_desc in manifest_rows:
        if slug in existing_slugs:
            continue
        r = next_row
        time_slot = "21:00〜21:30" if r % 2 == 0 else "7:00〜7:30"
        ws.cell(row=r, column=1, value=FORMULA)
        ws.cell(row=r, column=2, value=time_slot)
        ws.cell(row=r, column=3, value=slug)
        ws.cell(row=r, column=4, value=url)
        ws.cell(row=r, column=5, value="未投稿")
        ws.cell(row=r, column=6, value=category)
        ws.cell(row=r, column=7, value=board)
        ws.cell(row=r, column=8, value=pin_title)
        ws.cell(row=r, column=9, value=pin_desc)
        next_row += 1
        added += 1

    wb.save(XLSX_PATH)
    print(f"[pins] pinterest-生活.xlsxに{added}行追記(開始行{last_used_row + 1})")


if __name__ == "__main__":
    main()
