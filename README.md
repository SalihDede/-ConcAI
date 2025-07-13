# The Party - Immersive 3D Cinema Experience

🎬 **Advanced AI-powered 3D cinema platform with real-time voice chat and smart video processing**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-19.1+-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://typescriptlang.org)

## 🌟 Features

### 🎭 **3D Cinema Environment**
- **Amphitheater Design**: Realistic cinema hall with curved seating
- **Interactive Seat Selection**: Choose your viewing position in 3D space
- **Dynamic Lighting**: Stage lights with realistic shadows and reflections
- **Immersive Camera Controls**: First-person view with mouse-controlled head movement

### 🎥 **Smart Video System**
- **YouTube Integration**: Download and stream videos with yt-dlp
- **Real-time Progress**: Live download status with Socket.IO
- **3D Video Projection**: High-quality video display on virtual cinema screen
- **Spatial Audio**: Distance and angle-based volume control

### 🗣️ **Voice Chat System**
- **Real-time Voice**: Continuous voice chat without push-to-talk
- **3D Positional Audio**: Voice volume based on seat proximity
- **Voice Level Visualization**: Real-time audio meter overlay
- **Multi-user Support**: Connect with other viewers

### 🤖 **AI-Powered Features**
- **YOLO Person Detection**: Advanced computer vision for crowd analysis
- **Video Processing**: Frame extraction and filtering capabilities
- **Smart Recommendations**: AI-driven content suggestions

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 18+** 
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SalihDede/The_Party
cd The_Party
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Start Backend Server**
```bash
cd Backend/FLASK
python enhanced_video_server.py
```

4. **Install Frontend dependencies**
```bash
cd Frontend/ConcAI
npm install
```

5. **Start Frontend Development Server**
```bash
npm run dev
```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🎮 Controls

| Key | Action |
|-----|--------|
| **Mouse** | Look around (camera movement) |
| **S** | Open seat selection |
| **Q / Escape** | Return to main menu |
| **Click** | Activate mouse look |

## 📁 Project Structure

```
The_Party/
├── Backend/
│   └── FLASK/
│       ├── enhanced_video_server.py  # Main backend server
│       ├── requirements.txt          # Backend dependencies
│       └── start_server.bat         # Windows startup script
├── Frontend/
│   └── ConcAI/
│       ├── src/
│       │   ├── components/          # React components
│       │   │   ├── Scene.tsx        # 3D scene management
│       │   │   ├── VoiceChat.tsx    # Voice chat system
│       │   │   └── HeadController.tsx # Camera controls
│       │   └── App.tsx              # Main application
│       ├── package.json             # Frontend dependencies
│       └── start_frontend.bat       # Windows startup script
├── AI_Model/
│   ├── YOLO_Train.py               # YOLO model training
│   ├── Filter.py                   # Video filtering
│   ├── VideoToFrame.py             # Frame extraction
│   └── 2Dto3D.py                   # 3D conversion
└── Person-detection-1/             # Training dataset
```

## 🛠️ Technology Stack

### Backend
- **Flask** - Python web framework
- **Socket.IO** - Real-time communication
- **yt-dlp** - YouTube video downloading
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **Web Audio API** - Real-time audio processing

### AI/ML
- **YOLOv8** - Object detection
- **PyTorch** - Deep learning framework
- **OpenCV** - Computer vision
- **Ultralytics** - YOLO implementation

## 🌐 API Documentation

### Video Endpoints
- `POST /api/video/info` - Get video information
- `POST /api/video/download` - Start video download
- `GET /api/video/status/<id>` - Check download progress
- `GET /api/video/list` - List downloaded videos
- `GET /api/video/stream/<filename>` - Stream video file

### Real-time Events (Socket.IO)
- `download_progress` - Download progress updates
- `download_complete` - Download completion notification
- `voice_data` - Voice chat data transmission

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `AI_Model` directory:
```env
ROBOFLOW_API_KEY=your_roboflow_api_key
CUDA_VISIBLE_DEVICES=0  # For GPU acceleration
```

### Audio Settings
The voice chat system automatically detects and uses:
- **Echo Cancellation**: Reduces audio feedback
- **Noise Suppression**: Filters background noise
- **Auto Gain Control**: Normalizes audio levels

## 🎯 Use Cases

- **Virtual Cinema**: Watch videos together in a 3D environment
- **Educational Presentations**: Immersive learning experiences
- **Social Viewing**: Connect with friends through spatial voice chat
- **Content Creation**: Record cinematic viewing experiences
- **Research**: Study user behavior in virtual environments

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community** - For excellent 3D web graphics
- **React Three Fiber** - For seamless React-Three.js integration
- **yt-dlp Project** - For robust video downloading capabilities
- **Ultralytics** - For state-of-the-art YOLO implementation
