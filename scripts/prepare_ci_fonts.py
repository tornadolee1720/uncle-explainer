"""GitHub runner only: extract Traditional Chinese face from system Noto CJK TTC.

Why: repo CSS requests NotoSansTC-{Regular,Medium,Bold,Black}.ttf.
Installing fonts-noto-cjk alone does not satisfy these literal file URLs.
This script supplies local static fonts. Do NOT check generated font binaries into git.
"""
from pathlib import Path
from fontTools.ttLib import TTCollection

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "fonts"
SRC = Path("/usr/share/fonts/opentype/noto")
OUT.mkdir(exist_ok=True)


def extract(weight: str, name: str) -> None:
    src = SRC / f"NotoSansCJK-{weight}.ttc"
    if not src.exists():
        raise SystemExit(f"Missing CJK font: {src}")
    collection = TTCollection(str(src))
    faces = [f for f in collection.fonts if f["name"].getDebugName(1) == "Noto Sans CJK TC"]
    if len(faces) != 1:
        raise SystemExit(f"TC face not found exactly once: {src}")
    dest = OUT / name
    faces[0].save(str(dest))
    print(f"TC font ready: {dest.name} ({dest.stat().st_size} bytes)")


extract("Regular", "NotoSansTC-Regular.ttf")
extract("Bold", "NotoSansTC-Bold.ttf")
for alias, original in [
    ("NotoSansTC-Medium.ttf", "NotoSansTC-Regular.ttf"),
    ("NotoSansTC-Black.ttf", "NotoSansTC-Bold.ttf"),
]:
    file = OUT / alias
    if file.exists() or file.is_symlink():
        file.unlink()
    file.symlink_to(original)
    print(f"TC font alias: {alias} -> {original}")
