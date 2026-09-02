#!/usr/bin/env python3
"""เขียน <lastmod> ใน sitemap.xml จากวันที่ commit ล่าสุดของไฟล์นั้นจริง ๆ

ไม่ใช้วันที่ build เพราะ lastmod ควรบอกว่า "เนื้อหาหน้านี้เปลี่ยนล่าสุดเมื่อไหร่"
ถ้าประทับวัน build ทุกครั้ง Google จะเลิกเชื่อค่านี้ไปเลย
"""
import re, subprocess, sys, pathlib

SITE = "https://khokret.site/"
ROOT = pathlib.Path(__file__).resolve().parent.parent


def page_for(loc: str) -> str:
    path = loc[len(SITE):] if loc.startswith(SITE) else loc.lstrip("/")
    return path or "index.html"


def last_commit_date(path: str) -> str | None:
    r = subprocess.run(["git", "log", "-1", "--format=%cs", "--", path],
                       cwd=ROOT, capture_output=True, text=True)
    return r.stdout.strip() or None


def rewrite(xml: str) -> tuple[str, int]:
    changed = 0

    def one(m):
        nonlocal changed
        block = m.group(0)
        loc = re.search(r"<loc>([^<]*)</loc>", block)
        if not loc:
            return block
        d = last_commit_date(page_for(loc.group(1)))
        if not d:
            return block
        new = re.sub(r"<lastmod>[^<]*</lastmod>", f"<lastmod>{d}</lastmod>", block)
        if new != block:
            changed += 1
        return new

    return re.sub(r"<url>.*?</url>", one, xml, flags=re.S), changed


def selfcheck():
    sample = ("<url><loc>https://khokret.site/</loc>"
              "<lastmod>1999-01-01</lastmod></url>")
    out, n = rewrite(sample)
    assert "1999-01-01" not in out, "lastmod ไม่ถูกแทนที่"
    assert re.search(r"<lastmod>\d{4}-\d{2}-\d{2}</lastmod>", out), "รูปแบบวันที่เพี้ยน"
    assert n == 1, f"ควรเปลี่ยน 1 รายการ ได้ {n}"
    assert page_for("https://khokret.site/") == "index.html"
    assert page_for("https://khokret.site/eat/cafe.html") == "eat/cafe.html"
    print("selfcheck ok")


if __name__ == "__main__":
    if "--check" in sys.argv:
        selfcheck()
    else:
        f = ROOT / "sitemap.xml"
        out, n = rewrite(f.read_text(encoding="utf-8"))
        f.write_text(out, encoding="utf-8")
        print(f"updated {n} lastmod")
