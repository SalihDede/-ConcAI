# ConcAI - YouTube Video to 3D Cinema Experience

Bu proje, YouTube URL'lerinden videoları indirip 3D sinema ortamında izleme deneyimi sunan bir uygulamadır.

## Özellikler

- 🎬 YouTube URL'lerinden video indirme
- 📱 Gerçek zamanlı indirme durumu takibi
- 🎭 3D Koloseum tarzı sinema salonu
- 🪑 Koltuk seçimi ve rezervasyon sistemi
- 🎮 Klavye kontrolleri (S: Koltuk seçimi, Q/Escape: Ana menü)
- 💻 Modern React Three.js 3D deneyimi

## Sistem Mimarisi

### Backend (Flask)
- **Dosya**: `Backend/FLASK/enhanced_video_server.py`
- **Port**: 5000
- **Özellikler**:
  - YouTube video indirme (yt-dlp)
  - Video bilgilerini alma (başlık, süre, kanal)
  - Gerçek zamanlı indirme durumu (Socket.IO)
  - Video streaming servisi
  - İndirilen videoları yönetme

### Frontend (React + Three.js)
- **Dizin**: `Frontend/ConcAI/`
- **Port**: 5173 (Vite dev server)
- **Özellikler**:
  - YouTube URL giriş arayüzü
  - Gerçek zamanlı indirme durumu
  - 3D sinema salonu (React Three Fiber)
  - Koltuk seçimi sistemi
  - Video oynatma (3D perde üzerinde)

## Kurulum ve Çalıştırma

### Gereksinimler
- Python 3.7+
- Node.js 16+
- yt-dlp
- Modern web tarayıcı

### Hızlı Başlangıç

1. **Backend'i başlat**:
```bash
cd Backend/FLASK
start_server.bat
```

2. **Frontend'i başlat** (yeni terminal):
```bash
cd Frontend/ConcAI
start_frontend.bat
```

3. **Tarayıcıda aç**: http://localhost:5173

### Manuel Kurulum

#### Backend
```bash
cd Backend/FLASK
pip install -r requirements.txt
python enhanced_video_server.py
```

#### Frontend
```bash
cd Frontend/ConcAI
npm install
npm run dev
```

## Kullanım

1. **Video URL Girişi**: YouTube URL'sini girin
2. **İndirme**: Video otomatik olarak indirilir
3. **Koltuk Seçimi**: 3D ortamda koltuk seçin
4. **Rezervasyon**: Seçiminizi onaylayın
5. **İzleme**: 3D sinema salonunda video izleyin

### Klavye Kontrolleri
- **S**: Koltuk seçimi ekranını açar
- **Q/Escape**: Ana menüye döner
- **Mouse**: 3D ortamda görüş açısını değiştirir

## API Endpoints

### Backend API
- `POST /api/video/info` - Video bilgilerini al
- `POST /api/video/download` - Video indirme başlat
- `GET /api/video/status/<id>` - İndirme durumu sorgula
- `GET /api/video/list` - İndirilen videoları listele
- `GET /api/video/stream/<filename>` - Video stream
- `DELETE /api/video/delete/<filename>` - Video sil

### WebSocket Events
- `download_progress` - İndirme ilerlemesi
- `download_complete` - İndirme tamamlandı
- `download_error` - İndirme hatası

## Dosya Yapısı

```
ConcAI/
├── Backend/
│   ├── FLASK/
│   │   ├── enhanced_video_server.py    # Ana Flask server
│   │   ├── requirements.txt            # Python bağımlılıkları
│   │   └── start_server.bat           # Backend başlatma script
│   └── Video-Converter-URL-Based-main/ # Orijinal converter
├── Frontend/
│   └── ConcAI/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Scene.tsx          # 3D sinema sahnesi
│       │   │   ├── UrlInput.tsx       # URL giriş komponenti
│       │   │   ├── CinemaSeatSelector.tsx # Koltuk seçici
│       │   │   └── ...
│       │   ├── App.tsx                # Ana uygulama
│       │   └── ...
│       ├── package.json
│       └── start_frontend.bat         # Frontend başlatma script
└── README.md
```

## Özelleştirme

### Video Formatları
`enhanced_video_server.py` dosyasında video formatlarını değiştirebilirsiniz:
```python
# MP4 için
command += ['-f', 'best[ext=mp4]']

# MP3 için
command += ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3']
```

### 3D Sahne Ayarları
`Scene.tsx` dosyasında 3D ortamı özelleştirebilirsiniz:
- Koltuk sayısı ve düzeni
- Sahne boyutları
- Işık ayarları
- Renk şemaları

### Koltuk Düzeni
`App.tsx` dosyasında koltuk düzenini değiştirebilirsiniz:
```typescript
const seatsPerRow = [6, 9, 12, 15, 18] // Sıra başına koltuk sayısı
const baseRadius = 8                     // Temel yarıçap
const radiusIncrement = 2.5              // Sıra arası mesafe
```

## Sorun Giderme

### Backend Sorunları
- **Port 5000 meşgul**: `enhanced_video_server.py` dosyasında port numarasını değiştirin
- **yt-dlp hatası**: `pip install --upgrade yt-dlp` ile güncelleyin
- **İndirme yavaş**: İnternet bağlantısını kontrol edin

### Frontend Sorunları
- **Socket.IO bağlantı hatası**: Backend'in çalıştığından emin olun
- **3D render hatası**: Tarayıcı WebGL desteğini kontrol edin
- **Video oynatma sorunu**: Video dosyasının doğru formatta olduğundan emin olun

## Teknoloji Stack

### Backend
- **Flask**: Web framework
- **Flask-SocketIO**: Gerçek zamanlı iletişim
- **yt-dlp**: YouTube video indirme
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React 19**: UI framework
- **React Three Fiber**: 3D render engine
- **Three.js**: 3D graphics library
- **Socket.IO Client**: Gerçek zamanlı iletişim
- **Vite**: Build tool

## Gelecek Özellikler

- [ ] Çoklu video format desteği
- [ ] Video kalite seçenekleri
- [ ] Çoklu kullanıcı desteği
- [ ] Ses efektleri
- [ ] VR desteği
- [ ] Video oynatma listesi

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
