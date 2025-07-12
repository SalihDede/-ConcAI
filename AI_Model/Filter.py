import os
from pathlib import Path

import cv2
import numpy as np
import torch
from ultralytics import YOLO

# 0) Path’leri tanımla
script_dir = Path(__file__).parent.resolve()   # script’in olduğu klasör
root_dir   = script_dir.parent                 # bir üst dizin (runs burada)
frames_dir = script_dir / "Data" / "frames"    # Data/frames
runs_dir   = root_dir / "runs"                 # proje kökündeki runs

# 1) CUDA ayarı
device = 0 if torch.cuda.is_available() else 'cpu'
print(f"Using device: {device}")

# 2) Ağırlık dosyasını bul
exp_dir = runs_dir / "detect" / "person-detect-cuda3"
wdir    = exp_dir / "weights"
# best.pt veya last.pt kontrolü
if   (wdir / "best.pt").exists(): weight_file = wdir / "best.pt"
elif (wdir / "last.pt").exists(): weight_file = wdir / "last.pt"
else: raise FileNotFoundError(f"No .pt in {wdir}")
print("Loading weights from", weight_file)

# 3) Modeli yükle
model = YOLO(str(weight_file))

# 4) Çıktı dizinini oluştur
filtered_dir = runs_dir / "filtered"
filtered_dir.mkdir(parents=True, exist_ok=True)

# 5) Frame’leri işle
for img_path in sorted(frames_dir.iterdir()):
    if img_path.suffix.lower() not in [".jpg", ".png", ".bmp"]:
        continue

    img = cv2.imread(str(img_path))
    h, w = img.shape[:2]

    # tespit
    results = model.predict(
        source=str(img_path),
        device=device,
        imgsz=512,
        conf=0.25,
        save=False
    )
    boxes = results[0].boxes.xyxy.cpu().numpy()

    # maske
    mask = np.zeros((h, w), dtype=np.uint8)
    for x1, y1, x2, y2 in boxes:
        x1, y1, x2, y2 = map(int, (x1, y1, x2, y2))
        mask[y1:y2, x1:x2] = 255

    # filtrelenmiş görüntü
    mask3    = cv2.merge([mask, mask, mask])
    filtered = cv2.bitwise_and(img, mask3)

    # kaydet
    out_path = filtered_dir / img_path.name
    cv2.imwrite(str(out_path), filtered)
    print("Saved", out_path)

print("İşlem tamamlandı. Çıktılar:", filtered_dir)
