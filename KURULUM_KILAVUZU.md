# ConcAI - Kurulum ve Kullanım Kılavuzu

## Hızlı Başlangıç

### 1. Sistemi Başlatma

**Backend (Terminal 1):**
```bash
cd "c:\Users\Deniz\Documents\GitHub\-ConcAI\Backend\FLASK"
python -m pip install -r requirements.txt
python enhanced_video_server.py
```

**Frontend (Terminal 2):**
```bash
cd "c:\Users\Deniz\Documents\GitHub\-ConcAI\Frontend\ConcAI"
npm install
npm run dev
```

### 2. Tarayıcıda Açma
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Sistem Özellikleri

### 🎬 Video İndirme Sistemi
- **Gelişmiş Backend**: `enhanced_video_server.py`
- **YouTube Desteği**: yt-dlp ile güvenilir indirme
- **Gerçek Zamanlı İzleme**: Socket.IO ile canlı progress
- **Video Bilgileri**: Başlık, süre, kanal bilgileri

### 🎭 3D Sinema Deneyimi
- **Koloseum Tasarımı**: Amfi tiyatro düzeni
- **İnteraktif Koltuk Seçimi**: 3D ortamda koltuk seçimi
- **Gerçekçi Aydınlatma**: Sahne ışıkları ve gölgeler
- **Kaliteli Video Oynatma**: 3D perde üzerinde HD oynatma

### 🎮 Kontroller
- **S**: Koltuk seçimi
- **Q/Escape**: Ana menü
- **Mouse**: Kamera hareketi

## API Endpoints

### Video İşlemleri
- `POST /api/video/info` - Video bilgilerini al
- `POST /api/video/download` - İndirme başlat
- `GET /api/video/status/<id>` - İndirme durumu
- `GET /api/video/list` - İndirilen videolar
- `GET /api/video/stream/<filename>` - Video stream

### WebSocket Olayları
- `download_progress` - İndirme ilerlemesi
- `download_complete` - İndirme tamamlandı
- `download_error` - Hata durumu

## Kullanım Adımları

### 1. Video URL Girişi
```
- YouTube URL'sini girin
- Otomatik video bilgileri gösterilir
- "İndir ve İzle" butonuna tıklayın
```

### 2. Video İndirme
```
- Gerçek zamanlı progress takibi
- Video bilgileri gösterimi
- Otomatik format seçimi (MP4)
```

### 3. Koltuk Seçimi
```
- 3D sinema salonunda koltuk seçin
- 5 farklı sıra, toplam 60 koltuk
- Seçiminizi onaylayın
```

### 4. İzleme Deneyimi
```
- 3D koloseum ortamında video izleme
- İnteraktif kamera kontrolü
- Gerçekçi sinema atmosferi
```

## Sorun Giderme

### Backend Sorunları
- **Port 5000 meşgul**: Başka port kullanın
- **yt-dlp hatası**: `pip install --upgrade yt-dlp`
- **Bağımlılık hatası**: `pip install -r requirements.txt`

### Frontend Sorunları
- **Bağlantı hatası**: Backend çalışıyor mu kontrol edin
- **3D render hatası**: WebGL desteği gerekli
- **Video oynatma**: Doğru format/codec kontrol edin

## Geliştirme Notları

### Backend Geliştirme
```python
# enhanced_video_server.py
- Flask + Socket.IO
- yt-dlp entegrasyonu
- Gerçek zamanlı event handling
- Video file management
```

### Frontend Geliştirme
```typescript
// React + Three.js
- 3D scene rendering
- Video texture mapping
- Interactive controls
- Real-time updates
```

## Özelleştirme

### Koltuk Düzeni
```typescript
// App.tsx
const seatsPerRow = [6, 9, 12, 15, 18]; // Sıra başına koltuk
const baseRadius = 8; // Temel yarıçap
const radiusIncrement = 2.5; // Sıra arası mesafe
```

### Video Ayarları
```python
# enhanced_video_server.py
# MP4 kalitesi
command += ['-f', 'best[ext=mp4]']
# MP3 ses kalitesi
command += ['-f', 'bestaudio', '--audio-quality', '0']
```

## Güvenlik Notları

- **CORS**: Frontend-backend iletişimi için gerekli
- **File Upload**: Sadece güvenli URL'ler kabul edilir
- **Rate Limiting**: Aşırı istek koruması
- **Input Validation**: URL format kontrolü

## Performans Optimizasyonu

- **Video Caching**: İndirilen videolar yerel olarak saklanır
- **3D Rendering**: Optimized Three.js kullanımı
- **Memory Management**: Automatic cleanup
- **Network Optimization**: Progressive loading

## Gelecek Özellikler

- [ ] Çoklu kullanıcı desteği
- [ ] VR/AR desteği
- [ ] Ses efektleri
- [ ] Video filtreleri
- [ ] Çoklu video format
- [ ] Sosyal özellikler

---

**Geliştirici**: ConcAI Team
**Versiyon**: 1.0.0
**Tarih**: 2025
