import cv2
import os

def video_to_frames(video_path, output_folder):
    if not os.path.exists(video_path):
        print("❌ Video dosyası bulunamadı:", video_path)
        return

    os.makedirs(output_folder, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("❌ Video açılamadı:", video_path)
        return

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_filename = os.path.join(output_folder, f"frame_{frame_count:06d}.jpg")
        cv2.imwrite(frame_filename, frame)
        frame_count += 1

    cap.release()
    print(f"✅ {frame_count} kare kaydedildi: {output_folder}")

# Örnek kullanım:
video_to_frames("Data/Ornek-Veri-1-RGB.mp4", "Data/frames")