"""Cuts subjects out of the salon's photos (transparent WebP) for the layered hero and team designs.

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

# Editorial subjects, trimmed to their visible pixels so they can sit on the bottom edge of a stage.
SUBJECTS = {
    "model-folk": ("in15_0750_r1_crop-opt.jpg", 1300),
    "model-leaf": ("botanical_repair_professional_treatment_-_opt_1.jpg", 1300),
    "model-platinum": ("06_27_-_salon_social-1.jpeg", 1300),
    "model-bob": ("l3-aveda-folklore5-opt.jpg", 1000),
    "bride-curls": ("mariage-cheveux-boucles-1.jpg", 1300),
    "carole": ("carole-st-pierre-opt.jpg", 1000),
}


def clean(im):
    """Drop the faint halo of background the matting leaves behind, so edges stay crisp on dark grounds."""
    im.putalpha(im.getchannel("A").point(lambda v: 0 if v < 48 else min(255, int((v - 48) * 255 / 190))))
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    session = new_session("isnet-general-use")
    for name, (src, height) in SUBJECTS.items():
        im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, src))).convert("RGB")
        im.thumbnail((height, height))
        cut = clean(remove(im, session=session))
        cut = cut.crop(cut.getchannel("A").getbbox())
        cut.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=84, method=6)
        print(name, cut.size)
    for name, src in TEAM.items():
        im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, src))).convert("RGB")
        im = crop_to(im, (4, 5), 0.18).resize((640, 800), Image.LANCZOS)
        cut = clean(remove(im, session=session))
        cut.save(os.path.join(OUT, "team-" + name + ".webp"), "WEBP", quality=82, method=6)
    print(len(TEAM), "team cutouts")


if __name__ == "__main__":
    main()
