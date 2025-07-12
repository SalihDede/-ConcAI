import React, { useState } from 'react';
import StepNavigator from './components/StepNavigator';
import UrlInput from './components/UrlInput';
import SeatSelection from './components/SeatSelection';
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

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
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
      title: 'Onay',
      isCompleted: false,
      isActive: currentStep === 3
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
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedSeats = seats.filter(seat => seat.isSelected);

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
              <p><strong>Video URL:</strong> {videoUrl}</p>
              <p><strong>Seçili Koltuklar:</strong></p>
              <div className="selected-seats">
                {selectedSeats.map(seat => (
                  <span key={seat.id} className="seat-tag">
                    {String.fromCharCode(64 + seat.row)}{seat.number}
                  </span>
                ))}
              </div>
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
            <button className="nav-button confirm">
              Rezervasyonu Onayla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;