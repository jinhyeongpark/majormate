"""
Pixel art sprite sheet cutter for MajorMate character assets.
Source: image_01.png (2816x1536, solid green #00FF01 background)
Output: majormate-app/assets/characters/{male|female}/{category}/{category}_NN.png
"""

from PIL import Image
import numpy as np
import os

IMAGE_PATH = "image_01.png"
OUTPUT_BASE = os.path.join("majormate-app", "assets", "characters")

# Pure green background colour sampled from image corners
MIN_CONTENT_PX = 60     # minimum opaque pixels to accept a cell as a real sprite

# (name, y_start, y_end_inclusive, col_skip)
# col_skip: leading columns that contain a category label, not a sprite
CATEGORIES = [
    ("hair",    412,  558, 0),
    ("top",     597,  762, 0),
    ("bottom",  774,  924, 0),
    ("shoes",   943, 1039, 0),
    ("bag",    1076, 1193, 0),
    ("glasses",1200, 1295, 1),   # first column = "안경(Glasses)" label
    ("item",   1340, 1470, 0),
]

# Column boundaries (x_start, x_end inclusive) — 8 sprites per gender
MALE_COLS = [
    ( 110,  253),
    ( 263,  409),
    ( 420,  566),
    ( 577,  722),
    ( 743,  884),
    ( 905, 1050),
    (1062, 1207),
    (1217, 1360),
]

FEMALE_COLS = [
    (1475, 1617),
    (1626, 1774),
    (1782, 1931),
    (1945, 2092),
    (2120, 2264),
    (2274, 2422),
    (2429, 2574),
    (2579, 2719),
]


def remove_background(region_rgb: Image.Image) -> Image.Image:
    """
    Green-channel BFS background removal.

    A pixel is a 'green background candidate' if the G channel clearly
    dominates R and B (works despite JPEG-style compression noise).
    BFS floods from the four cell edges through those candidates only,
    so green elements *enclosed* by the sprite outline are never reached.
    """
    from collections import deque

    arr = np.array(region_rgb.convert("RGBA"), dtype=np.uint8)
    h, w = arr.shape[:2]
    r = arr[:, :, 0].astype(np.int32)
    g = arr[:, :, 1].astype(np.int32)
    b = arr[:, :, 2].astype(np.int32)

    # Green dominance: G is bright AND noticeably stronger than R and B
    is_green = (g > 140) & (g > r * 2) & (g > b * 2)

    visited = np.zeros((h, w), dtype=bool)
    queue: deque = deque()

    def seed(y, x):
        if is_green[y, x] and not visited[y, x]:
            visited[y, x] = True
            queue.append((y, x))

    for x in range(w):
        seed(0,   x)
        seed(h-1, x)
    for y in range(1, h - 1):
        seed(y, 0)
        seed(y, w - 1)

    while queue:
        cy, cx = queue.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                seed(ny, nx)

    arr[visited, 3] = 0
    return Image.fromarray(arr, "RGBA")


def crop_and_save():
    img = Image.open(IMAGE_PATH).convert("RGB")

    genders = [
        ("male",   MALE_COLS),
        ("female", FEMALE_COLS),
    ]

    for gender, cols in genders:
        for cat_name, y1, y2, col_skip in CATEGORIES:
            out_dir = os.path.join(OUTPUT_BASE, gender, cat_name)
            os.makedirs(out_dir, exist_ok=True)

            sprite_idx = 1
            for col_idx, (x1, x2) in enumerate(cols):
                if col_idx < col_skip:
                    continue
                region = img.crop((x1, y1, x2 + 1, y2 + 1))
                transparent = remove_background(region)

                alpha = np.array(transparent)[:, :, 3]
                if int(alpha.sum()) // 255 < MIN_CONTENT_PX:
                    continue

                filename = f"{cat_name}_{sprite_idx:02d}.png"
                transparent.save(os.path.join(out_dir, filename), "PNG")
                sprite_idx += 1

            print(f"  {gender:6s} / {cat_name:8s} → {sprite_idx - 1} sprites")


if __name__ == "__main__":
    print(f"Reading {IMAGE_PATH} …")
    crop_and_save()
    print(f"\nDone! Assets saved under {OUTPUT_BASE}/")
