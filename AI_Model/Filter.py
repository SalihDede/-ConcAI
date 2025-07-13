from ultralytics import YOLO
import cv2, numpy as np
from pathlib import Path

# 0) Path’ler
script_dir = Path(__file__).parent.resolve()
frames_dir = script_dir / "Data" / "frames"
runs_dir   = script_dir.parent / "runs"
seg_model  = "yolov8n-seg.pt"

# 1) Modeli yükle
model = YOLO(seg_model)

# 2) Çıktı dizini
out_dir = runs_dir / "segmented"
out_dir.mkdir(exist_ok=True, parents=True)

# 3) Frame’leri işle
for img_path in sorted(frames_dir.iterdir()):
    if img_path.suffix.lower() not in [".jpg", ".png"]:
        continue

    img = cv2.imread(str(img_path))
    h, w = img.shape[:2]

    # inference
    results = model.predict(source=str(img_path), device=0, imgsz=512, conf=0.25)
    masks   = results[0].masks.data.cpu().numpy()   # shape: (N, H', W')

    # tüm insan maskelerini 1/0 olarak birleştir
    full_mask = np.zeros((h, w), dtype=np.uint8)
    for m in masks:
        m_resized = cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)
        human_px  = (m_resized > 0.5).astype(np.uint8)
        full_mask = np.maximum(full_mask, human_px)

    # broadcast ile 3 kanala çıkar ve direkt çarp
    mask3     = np.stack([full_mask]*3, axis=-1)
    segmented = img * mask3     # = 0 veya orijinal piksel değerleri

    # *255 kaldırıldı!
    cv2.imwrite(str(out_dir / img_path.name), segmented)
    print("Saved:", img_path.name)

print("Segmentasyon tamamlandı:", out_dir)
