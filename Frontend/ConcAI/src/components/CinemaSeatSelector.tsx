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
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null)

  // Sandalyeleri sıraya göre grupla
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = []
    }
    acc[seat.row].push(seat)
    return acc
  }, {} as { [key: number]: Seat[] })

  // Sahneye mesafe hesapla
  const getDistanceToStage = (seat: Seat) => {
    const stageCenter = [0, 0, -12]
    const distance = Math.sqrt(
      Math.pow(seat.position.x - stageCenter[0], 2) + 
      Math.pow(seat.position.z - stageCenter[2], 2)
    )
    return Math.round(distance * 10) / 10
  }

  // Sandalye kalitesini belirle
  const getSeatQuality = (seat: Seat) => {
    const distance = getDistanceToStage(seat)
    if (distance < 10) return { level: 'Mükemmel', color: '#4CAF50', stars: '★★★★★' }
    if (distance < 13) return { level: 'Çok İyi', color: '#8BC34A', stars: '★★★★☆' }
    if (distance < 16) return { level: 'İyi', color: '#FFC107', stars: '★★★☆☆' }
    if (distance < 19) return { level: 'Orta', color: '#FF9800', stars: '★★☆☆☆' }
    return { level: 'Uzak', color: '#F44336', stars: '★☆☆☆☆' }
  }

  // Konum açıklaması
  const getPositionDescription = (seat: Seat) => {
    const x = seat.position.x
    if (x < -5) return 'Sol Taraf'
    if (x > 5) return 'Sağ Taraf'
    return 'Merkez'
  }

  // SVG harita için koordinat dönüştürme
  const getMapPosition = (seat: Seat) => {
    const scale = 15
    const centerX = 200
    const centerY = 200
    return {
      x: centerX + (seat.position.x * scale),
      y: centerY + (seat.position.z + 12) * scale
    }
  }

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
        background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '1400px',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: 'white',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
        border: '3px solid #444'
      }}>
        {/* Başlık */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          borderBottom: '3px solid #FFD700',
          paddingBottom: '20px'
        }}>
          <h1 style={{ 
            margin: 0, 
            color: '#FFD700', 
            fontSize: '28px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            🎭 Amfi Tiyatro - Sandalye Seçimi
          </h1>
          <button 
            onClick={onClose}
            style={{
              background: 'linear-gradient(45deg, #dc3545, #c82333)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '45px',
              height: '45px',
              fontSize: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Sahne bilgisi */}
        <div style={{
          background: 'linear-gradient(45deg, #2a2a2a, #3a3a3a)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '30px',
          textAlign: 'center',
          border: '3px solid #FFD700',
          boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
        }}>
          <h2 style={{ 
            margin: '0 0 15px 0', 
            color: '#FFD700', 
            fontSize: '24px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            🎬 SAHNE
          </h2>
          <p style={{ margin: 0, color: '#ccc', fontSize: '16px' }}>
            📍 Merkez Konum: [0, 0, -12] • 📏 Boyut: 16×8 birim • 🎪 Amfi Tiyatro Düzeni
          </p>
        </div>

        {/* Ana içerik - Sol SVG harita, Sağ detaylar */}
        <div style={{ 
          display: 'flex', 
          gap: '30px',
          alignItems: 'flex-start'
        }}>
          {/* Sol panel - SVG Harita */}
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '15px',
            padding: '20px',
            border: '2px solid #444',
            minWidth: '450px'
          }}>
            <h2 style={{
              color: '#FFD700',
              textAlign: 'center',
              marginBottom: '20px',
              fontSize: '1.5em'
            }}>
              🗺️ Amfi Tiyatro Haritası
            </h2>

            {/* SVG Harita */}
            <svg 
              width="400" 
              height="400" 
              style={{ 
                border: '2px solid #444', 
                borderRadius: '10px',
                backgroundColor: '#1a1a1a'
              }}
            >
              {/* Sahne */}
              <rect
                x="170"
                y="20"
                width="60"
                height="30"
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="2"
                rx="5"
              />
              <text
                x="200"
                y="40"
                textAnchor="middle"
                fill="#000"
                fontSize="12"
                fontWeight="bold"
              >
                SAHNE
              </text>

              {/* Amfi çemberi */}
              <circle
                cx="200"
                cy="200"
                r="160"
                fill="none"
                stroke="#333"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Sandalyeler */}
              {seats.map(seat => {
                const mapPos = getMapPosition(seat)
                const quality = getSeatQuality(seat)
                const isHovered = hoveredSeat?.id === seat.id
                const isSelected = selectedSeat?.id === seat.id

                return (
                  <g key={seat.id}>
                    <circle
                      cx={mapPos.x}
                      cy={mapPos.y}
                      r={isHovered || isSelected ? "8" : "6"}
                      fill={isSelected ? '#FFD700' : isHovered ? quality.color : quality.color}
                      stroke={isSelected ? '#FFA500' : isHovered ? '#fff' : 'none'}
                      strokeWidth={isSelected ? "3" : isHovered ? "2" : "0"}
                      style={{ 
                        cursor: 'pointer',
                        filter: isHovered || isSelected ? 'drop-shadow(0 0 8px currentColor)' : 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={() => setHoveredSeat(seat)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      onClick={() => setSelectedSeat(seat)}
                    />
                    
                    {/* Sandalye numarası */}
                    <text
                      x={mapPos.x}
                      y={mapPos.y + 2}
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="bold"
                      style={{ pointerEvents: 'none' }}
                    >
                      {seat.seatNumber}
                    </text>
                  </g>
                )
              })}
              
              {/* Yön göstergesi */}
              <g transform="translate(350, 350)">
                <circle cx="0" cy="0" r="25" fill="#333" stroke="#666" strokeWidth="2"/>
                <text x="0" y="-15" textAnchor="middle" fill="#FFD700" fontSize="10">K</text>
                <text x="0" y="20" textAnchor="middle" fill="#ccc" fontSize="10">G</text>
                <text x="-18" y="5" textAnchor="middle" fill="#ccc" fontSize="10">B</text>
                <text x="18" y="5" textAnchor="middle" fill="#ccc" fontSize="10">D</text>
              </g>
            </svg>

            {/* Kalite göstergeleri */}
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ color: '#FFD700', marginBottom: '10px' }}>🌟 Kalite Seviyeleri:</h3>
              {[
                { level: 'Mükemmel', color: '#4CAF50', stars: '★★★★★' },
                { level: 'Çok İyi', color: '#8BC34A', stars: '★★★★☆' },
                { level: 'İyi', color: '#FFC107', stars: '★★★☆☆' },
                { level: 'Orta', color: '#FF9800', stars: '★★☆☆☆' },
                { level: 'Uzak', color: '#F44336', stars: '★☆☆☆☆' }
              ].map(item => (
                <div key={item.level} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '5px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.color
                  }}></div>
                  <span style={{ color: '#ccc', fontSize: '14px' }}>
                    {item.level} {item.stars}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ panel - Sandalye Detayları ve Seçim */}
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '15px',
            padding: '20px',
            border: '2px solid #444',
            minWidth: '400px',
            maxWidth: '500px'
          }}>
            {/* Seçilen sandalye detayları */}
            {selectedSeat ? (
              <div>
                <h2 style={{
                  color: '#FFD700',
                  textAlign: 'center',
                  marginBottom: '20px',
                  fontSize: '1.5em'
                }}>
                  🪑 Seçilen Sandalye
                </h2>
                
                <div style={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '20px',
                  border: '2px solid #FFD700'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    color: '#fff'
                  }}>
                    <div>
                      <strong style={{ color: '#FFD700' }}>🎫 Sıra:</strong> {selectedSeat.row}
                    </div>
                    <div>
                      <strong style={{ color: '#FFD700' }}>💺 Numara:</strong> {selectedSeat.seatNumber}
                    </div>
                    <div>
                      <strong style={{ color: '#FFD700' }}>📍 Konum:</strong> {getPositionDescription(selectedSeat)}
                    </div>
                    <div>
                      <strong style={{ color: '#FFD700' }}>⭐ Kalite:</strong> 
                      <span style={{ color: getSeatQuality(selectedSeat).color }}>
                        {getSeatQuality(selectedSeat).level}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: '15px',
                    textAlign: 'center',
                    color: getSeatQuality(selectedSeat).color,
                    fontSize: '24px'
                  }}>
                    {getSeatQuality(selectedSeat).stars}
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#333',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#ccc'
                  }}>
                    <div>
                      <strong>📐 X:</strong> {selectedSeat.position.x.toFixed(1)}
                    </div>
                    <div>
                      <strong>📐 Z:</strong> {selectedSeat.position.z.toFixed(1)}
                    </div>
                    <div>
                      <strong>⬆️ Yükseklik:</strong> {selectedSeat.position.y.toFixed(1)}
                    </div>
                    <div>
                      <strong>🧭 Açı:</strong> {Math.round((selectedSeat.rotation * 180) / Math.PI)}°
                    </div>
                  </div>
                </div>

                {/* Seç butonu */}
                <button
                  onClick={() => onSeatSelect(selectedSeat)}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#45a049'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#4CAF50'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  🎭 Bu Sandalyeyi Seç
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🪑</div>
                <h3>Sandalye Seçin</h3>
                <p>Haritadan bir sandalyeye tıklayın</p>
              </div>
            )}

            {/* Sıralara göre hızlı seçim */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#FFD700', marginBottom: '15px' }}>⚡ Hızlı Seçim - Sıralar:</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '10px'
              }}>
                {Object.entries(seatsByRow).map(([row, rowSeats]) => {
                  const rowNumber = parseInt(row)
                  const avgQuality = rowSeats.reduce((sum, seat) => {
                    const stageCenter = [0, 0, -12]
                    const distance = Math.sqrt(
                      Math.pow(seat.position.x - stageCenter[0], 2) + 
                      Math.pow(seat.position.z - stageCenter[2], 2)
                    )
                    return sum + distance
                  }, 0) / rowSeats.length
                  
                  const qualityColor = avgQuality < 10 ? '#4CAF50' : 
                                     avgQuality < 13 ? '#8BC34A' : 
                                     avgQuality < 16 ? '#FFC107' : 
                                     avgQuality < 19 ? '#FF9800' : '#F44336'
                  
                  return (
                    <button
                      key={row}
                      onClick={() => setSelectedSeat(rowSeats[Math.floor(rowSeats.length / 2)])}
                      style={{
                        padding: '10px',
                        backgroundColor: qualityColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      Sıra {rowNumber}
                      <br />
                      ({rowSeats.length} koltuk)
                    </button>
                  )
                })}
              </div>
            </div>

            {/* İpuçları */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#1a1a1a',
              borderRadius: '10px',
              border: '2px solid #333'
            }}>
              <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>💡 İpuçları:</h4>
              <ul style={{ color: '#ccc', fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
                <li>Haritada sandalyelere tıklayarak detayları görün</li>
                <li>Renk kodları kalite seviyesini gösterir</li>
                <li>Merkez koltuklardan daha iyi görüş açısı elde edersiniz</li>
                <li>Ön sıralar daha yakın, arka sıralar daha genel görüş sağlar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatSelector
