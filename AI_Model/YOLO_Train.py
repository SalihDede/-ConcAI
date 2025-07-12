import os
import torch
import multiprocessing
from dotenv import load_dotenv
from roboflow import Roboflow
from ultralytics import YOLO

def main():
    # .env’den değişkenleri yükle
    load_dotenv()
    api_key = os.getenv("ROBOFLOW_API_KEY")

    # CUDA kontrolü
    print("CUDA available:", torch.cuda.is_available())
    device = 0 if torch.cuda.is_available() else 'cpu'

    # Roboflow’dan dataset’i indir
    rf      = Roboflow(api_key=api_key)
    project = rf.workspace("ai-researcher-wannabe").project("person-detection-9a6mk-3cuox")
    dataset = project.version(1).download("yolov8")

    # Modeli yükle ve eğit
    model = YOLO("yolov8n.pt")
    model.train(
        data=dataset.location + "/data.yaml",
        epochs=50,
        imgsz=512,
        batch=8,
        device=device,
        name="person-detect-cuda"
    )

if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
