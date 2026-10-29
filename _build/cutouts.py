"""Cuts the team portraits out of their backgrounds (transparent WebP), so they can sit on brand-coloured cards.

Needs:  pip install "rembg[cpu]"   (only to regenerate; the outputs are committed)
Run:    python3 _build/cutouts.py <folder-with-originals>
Writes: assets/img/cut/
"""
import os
import sys

from PIL import Image, ImageOps
from rembg import new_session, remove

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from images import TEAM, crop_to  # noqa: E402

SRC = sys.argv[1] if len(sys.argv) > 1 else "originals"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img", "cut")


def clean(im):
    """Drop the faint halo of background the matting leaves behind, so edges stay crisp on dark grounds."""
    im.putalpha(im.getchannel("A").point(lambda v: 0 if v < 48 else min(255, int((v - 48) * 255 / 190))))
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    session = new_session("isnet-general-use")
    for name, src in TEAM.items():
        im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, src))).convert("RGB")
        im = crop_to(im, (4, 5), 0.18).resize((640, 800), Image.LANCZOS)
        cut = clean(remove(im, session=session))
        cut.save(os.path.join(OUT, "team-" + name + ".webp"), "WEBP", quality=82, method=6)
    print(len(TEAM), "team cutouts")


if __name__ == "__main__":
    main()
