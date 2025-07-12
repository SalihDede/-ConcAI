import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stats } from '@react-three/drei';
import StepNavigator from './components/StepNavigator';
import UrlInput from './components/UrlInput';
import SeatSelection from './components/SeatSelection';
import Scene from './components/Scene';
import { CinemaUI } from './components/CinemaUI';
import CinemaSeatSelector from './components/CinemaSeatSelector';
import './App.css';

interface Step {
  id: number;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface Seat {
  id: string;
  row: number;
  number: number;
  isAvailable: boolean;
  isSelected: boolean;
  isVip?: boolean;
}

interface CinemaSeat {
  id: number;
  row: number;
  seatNumber: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  isSelected: boolean;
}

// Helper function to create amphitheater seating
const createAmphitheaterSeating = (): CinemaSeat[] => {
  const seats: CinemaSeat[] = []
  const centerPoint = { x: 0, y: 0, z: -12 }
  const seatsPerRow = [6, 9, 12, 15, 18]
  const baseRadius = 8
  const radiusIncrement = 2.5
  
  let seatIdCounter = 1
  
  seatsPerRow.forEach((seatCount, rowIndex) => {
    const radius = baseRadius + (rowIndex * radiusIncrement)
    const angleRange = Math.PI * 0.85
    const angleStart = -angleRange / 2
    const angleStep = angleRange / (seatCount - 1)
    
    for (let i = 0; i < seatCount; i++) {
      const angle = angleStart + (i * angleStep)
      const x = centerPoint.x + Math.sin(angle) * radius
      const z = centerPoint.z + Math.cos(angle) * radius
      const y = 0.1 + (rowIndex * 0.32)
      
      const seatRotation = Math.atan2(centerPoint.x - x, centerPoint.z - z)
      
      seats.push({
        id: seatIdCounter++,
        row: rowIndex + 1,
        seatNumber: i + 1,
        position: { x, y, z },
        rotation: seatRotation,
        isSelected: false
      })
    }
  })
  
  return seats
}

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [showCinemaSeatSelector, setShowCinemaSeatSelector] = useState(false);
  
  // 3D sinema için koltuklar
  const cinemaSeats = createAmphitheaterSeating();
  const [currentViewerSeat, setCurrentViewerSeat] = useState(() => {
    // 3. sıra (12 koltuklu sıra), ortadaki koltuk (6. veya 7. koltuk) - varsayılan
    return cinemaSeats.find(seat => seat.row === 3 && seat.seatNumber === 6) || cinemaSeats[17]
  });
  
  const [seats, setSeats] = useState<Seat[]>(() => {
    // Örnek koltuk düzeni oluştur
    const seatData: Seat[] = [];
    for (let row = 1; row <= 8; row++) {
      for (let seatNum = 1; seatNum <= 12; seatNum++) {
        seatData.push({
          id: `${row}-${seatNum}`,
          row,
          number: seatNum,
          isAvailable: Math.random() > 0.3, // %70 müsait
          isSelected: false,
          isVip: row >= 6 // Son 3 sıra VIP
        });
      }
    }
    return seatData;
  });

  const steps: Step[] = [
    {
      id: 1,
      title: 'Video URL',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      id: 2,
      title: 'Koltuk Seçimi',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      id: 3,
      title: 'Rezervasyon',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
    {
      id: 4,
      title: 'Sinema',
      isCompleted: false,
      isActive: currentStep === 4
    }
  ];

  const handleUrlSubmit = (url: string) => {
    setVideoUrl(url);
    setCurrentStep(2);
  };

  const handleSeatSelect = (seatId: string) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        seat.id === seatId 
          ? { ...seat, isSelected: !seat.isSelected }
          : seat
      )
    );
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmReservation = () => {
    setCurrentStep(4);
  };

  // 3D Sinema koltuk seçim fonksiyonu
  const handleCinemaSeatSelect = (selectedSeat: CinemaSeat) => {
    setCurrentViewerSeat(selectedSeat);
    setShowCinemaSeatSelector(false);
  };

  // S tuşu ile seçim ekranını açma
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'KeyS' && currentStep === 4 && !showCinemaSeatSelector) {
        setShowCinemaSeatSelector(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showCinemaSeatSelector, currentStep]);

  const selectedSeats = seats.filter(seat => seat.isSelected);

  // Eğer 4. adımda isek, 3D Sinema salonu göster
  if (currentStep === 4) {
    return (
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {/* Sandalye Seçim Ekranı - Canvas dışında render et */}
        {showCinemaSeatSelector && (
          <CinemaSeatSelector 
            seats={cinemaSeats}
            onSeatSelect={handleCinemaSeatSelect}
            onClose={() => setShowCinemaSeatSelector(false)}
          />
        )}

        <Canvas
          camera={{
            position: [0, 3, 18],
            fov: 75,
            near: 0.1,
            far: 1000
          }}
          style={{ background: '#87CEEB' }}
          shadows
        >
          <Suspense fallback={null}>
            <Scene 
              seats={cinemaSeats}
              currentViewerSeat={currentViewerSeat}
            />
            <Sky sunPosition={[100, 20, 100]} />
            <Stats />
          </Suspense>
        </Canvas>
        <CinemaUI />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>ConcAI - Sinema Deneyimi</h1>
        <StepNavigator steps={steps} currentStep={currentStep} />
      </div>

      <div className="app-content">
        {currentStep === 1 && (
          <UrlInput onUrlSubmit={handleUrlSubmit} initialUrl={videoUrl} />
        )}

        {currentStep === 2 && (
          <div className="seat-selection-container">
            <div className="step-header">
              <h2>Koltuk Seçimi</h2>
              <p>Video: {videoUrl}</p>
            </div>
            <SeatSelection 
              seats={seats} 
              onSeatSelect={handleSeatSelect}
              maxSeats={6}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="confirmation-container">
            <h2>Rezervasyon Onayı</h2>
            <div className="booking-summary">
              <h3>Seçili Koltuklar</h3>
              <div className="selected-seats">
                {selectedSeats.map(seat => (
                  <span key={seat.id} className="seat-tag">
                    {String.fromCharCode(64 + seat.row)}{seat.number}
                  </span>
                ))}
              </div>
              <p><strong>Video:</strong> {videoUrl}</p>
              <p><strong>Toplam:</strong> {selectedSeats.length} koltuk</p>
            </div>
          </div>
        )}
      </div>

      <div className="app-footer">
        <div className="navigation-buttons">
          {currentStep > 1 && (
            <button onClick={handlePrevStep} className="nav-button prev">
              Geri
            </button>
          )}
          {currentStep === 2 && selectedSeats.length > 0 && (
            <button onClick={handleNextStep} className="nav-button next">
              Devam Et
            </button>
          )}
          {currentStep === 3 && (
            <button onClick={handleConfirmReservation} className="nav-button confirm">
              Rezervasyonu Onayla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;