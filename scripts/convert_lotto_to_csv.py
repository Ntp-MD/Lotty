"""
LottoLens — convert_lotto_to_csv.py
แปลงข้อมูลจาก vicha-w/thai-lotto-archive เป็น CSV ตรงกับ schema ของ draws table

วิธีใช้:
1. git clone https://github.com/vicha-w/thai-lotto-archive.git
2. วาง script นี้ไว้ใน folder เดียวกับ thai-lotto-archive/
3. pip install pandas
4. python convert_lotto_to_csv.py
5. ได้ไฟล์ draws_import.csv — import เข้า Supabase ได้เลย

Schema output:
draw_date, first, last2, last3f, last3b, second, third, fourth, fifth, near1
"""

import os
import csv
from datetime import datetime

LOTTO_DIR = "./thai-lotto-archive/lottonumbers"
OUTPUT_FILE = "./draws_import.csv"

def parse_lotto_file(filepath: str) -> dict | None:
    filename = os.path.basename(filepath)
    # filename format: YYYY-MM-DD.txt
    name = filename.replace(".txt", "")
    try:
        draw_date = datetime.strptime(name, "%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError:
        return None

    data = {
        "draw_date": draw_date,
        "first":   "",
        "last2":   "",
        "last3f":  "",
        "last3b":  "",
        "second":  [],
        "third":   [],
        "fourth":  [],
        "fifth":   [],
        "near1":   [],
    }

    with open(filepath, encoding="utf-8") as f:
        lines = f.read().splitlines()

    for line in lines[1:]:  # skip first line (source URL)
        parts = line.strip().split()
        if len(parts) < 2:
            continue
        label = parts[0]
        numbers = parts[1:]

        if label == "FIRST":
            data["first"] = numbers[0] if numbers else ""
        elif label == "TWO":
            data["last2"] = numbers[0] if numbers else ""
        elif label == "THREE_FIRST":
            data["last3f"] = numbers[0] if numbers else ""
        elif label == "THREE_LAST":
            data["last3b"] = numbers[0] if numbers else ""
        elif label == "THREE":
            # before Sep 2015 — use as last3b
            if numbers:
                data["last3b"] = numbers[0]
        elif label == "SECOND":
            data["second"] = numbers
        elif label == "THIRD":
            data["third"] = numbers
        elif label == "FOURTH":
            data["fourth"] = numbers
        elif label == "FIFTH":
            data["fifth"] = numbers
        elif label == "NEAR_FIRST":
            data["near1"] = numbers

    # Skip rows missing critical fields
    if not data["first"] or not data["last2"]:
        return None

    # Fill missing text fields
    if not data["last3f"]:
        data["last3f"] = ""
    if not data["last3b"]:
        data["last3b"] = ""

    # Format arrays as Postgres array literal: [val1,val2,...]
    for key in ("second", "third", "fourth", "fifth", "near1"):
        arr = data[key]
        data[key] = "[" + ",".join(arr) + "]" if arr else "[]"

    return data


def main():
    if not os.path.isdir(LOTTO_DIR):
        print(f"ERROR: ไม่พบ folder {LOTTO_DIR}")
        print("กรุณา git clone https://github.com/vicha-w/thai-lotto-archive.git ก่อน")
        return

    files = sorted(os.listdir(LOTTO_DIR))
    rows = []

    for fname in files:
        fpath = os.path.join(LOTTO_DIR, fname)
        row = parse_lotto_file(fpath)
        if row:
            rows.append(row)

    if not rows:
        print("ไม่พบข้อมูล")
        return

    # Write SQL INSERT file instead of CSV to handle arrays correctly
    sql_file = OUTPUT_FILE.replace(".csv", ".sql")
    with open(sql_file, "w", encoding="utf-8") as f:
        f.write("INSERT INTO draws (draw_date, first, last2, last3f, last3b, second, third, fourth, fifth, near1) VALUES\n")
        lines = []
        for r in rows:
            def pg_arr(val):
                return f"ARRAY{val}::TEXT[]" if val != "[]" else "ARRAY[]::TEXT[]"
            line = (
                f"  ('{r['draw_date']}', '{r['first']}', '{r['last2']}', "
                f"'{r['last3f']}', '{r['last3b']}', "
                f"{pg_arr(r['second'])}, {pg_arr(r['third'])}, "
                f"{pg_arr(r['fourth'])}, {pg_arr(r['fifth'])}, {pg_arr(r['near1'])})"
            )
            lines.append(line)
        f.write(",\n".join(lines))
        f.write("\nON CONFLICT (draw_date) DO NOTHING;\n")

    print(f"สำเร็จ! {len(rows)} งวด → {sql_file}")
    print("นำ draws_import.sql ไปรันใน Supabase Dashboard → SQL Editor")


if __name__ == "__main__":
    main()
