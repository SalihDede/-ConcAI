import React, { useState } from 'react'

interface Seat {
  id: number
  row: number
  seatNumber: number
  position: { x: number; y: number; z: number }
  rotation: number
  isSelected: boolean
}

interface SeatSelectorProps {
  seats: Seat[]
  onSeatSelect: (seat: Seat) => void
  onClose: () => void
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ seats, onSeatSelect, onClose }) => {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)




  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#222',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '700px',
        color: 'white',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
        border: '3px solid #444',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ color: '#FFD700', marginBottom: '20px' }}>Seat Selection</h2>
        <svg width="600" height="350" style={{ background: '#181818', borderRadius: '16px', marginBottom: '24px', display: 'block' }}>
          {/* Stage */}
          <rect x="200" y="30" width="200" height="30" rx="10" fill="#FFD700" stroke="#FFA500" strokeWidth="3" />
          <text x="300" y="50" textAnchor="middle" fill="#222" fontSize="18" fontWeight="bold">STAGE</text>
          {/* Seats */}
          {seats.map(seat => {
            // 3D pozisyonları SVG'ye ölçekle, menüde daha önde göstermek için z'ye offset ekle
            const scale = 18;
            const centerX = 300;
            const centerY = 210;
            const zMenuOffset = -7; // Pulls seats forward in the menu (negative value)
            const x = centerX + seat.position.x * scale;
            const y = centerY + (seat.position.z + 12 + zMenuOffset) * scale * 0.6;
            return (
              <g key={seat.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={selectedSeat?.id === seat.id ? 18 : 13}
                  fill={selectedSeat?.id === seat.id ? '#FFD700' : '#444'}
                  stroke={selectedSeat?.id === seat.id ? '#FFA500' : '#888'}
                  strokeWidth={selectedSeat?.id === seat.id ? 4 : 2}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setSelectedSeat(seat)}
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fill={selectedSeat?.id === seat.id ? '#222' : '#fff'}
                  fontSize="13"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {seat.row}-{seat.seatNumber}
                </text>
              </g>
            );
          })}
        </svg>
        <button
          onClick={() => selectedSeat && onSeatSelect(selectedSeat)}
          disabled={!selectedSeat}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: selectedSeat ? '#4CAF50' : '#888',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: selectedSeat ? 'pointer' : 'not-allowed',
            marginTop: '20px',
            transition: 'all 0.3s',
            boxShadow: selectedSeat ? '0 4px 15px rgba(76, 175, 80, 0.3)' : 'none',
          }}
        >
          Go to Selected Seat
        </button>
        <button
          onClick={onClose}
          style={{
            marginTop: '16px',
            background: '#c82333',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default SeatSelector
