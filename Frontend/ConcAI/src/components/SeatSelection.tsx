import React from 'react';

interface Seat {
  id: string;
  row: number;
  number: number;
  isAvailable: boolean;
  isSelected: boolean;
  isVip?: boolean;
}

interface SeatSelectionProps {
  seats: Seat[];
  onSeatSelect: (seatId: string) => void;
  maxSeats?: number;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ seats, onSeatSelect, maxSeats = 6 }) => {
  // Koltukları satırlara göre grupla
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  const selectedSeatsCount = seats.filter(seat => seat.isSelected).length;

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable) return;
    
    if (!seat.isSelected && selectedSeatsCount >= maxSeats) {
      alert(`En fazla ${maxSeats} koltuk seçebilirsiniz!`);
      return;
    }
    
    onSeatSelect(seat.id);
  };

  return (
    <div className="seat-selection">
      <div className="screen">
        <div className="screen-text">PERDE</div>
      </div>
      
      <div className="seats-container">
        {Object.keys(seatsByRow)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(row => (
            <div key={row} className="seat-row">
              <div className="row-label">{String.fromCharCode(64 + parseInt(row))}</div>
              <div className="seats">
                {seatsByRow[parseInt(row)]
                  .sort((a, b) => a.number - b.number)
                  .map(seat => (
                    <div
                      key={seat.id}
                      className={`seat ${seat.isVip ? 'vip' : ''} ${
                        !seat.isAvailable ? 'occupied' : seat.isSelected ? 'selected' : 'available'
                      }`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {seat.number}
                    </div>
                  ))}
              </div>
              <div className="row-label">{String.fromCharCode(64 + parseInt(row))}</div>
            </div>
          ))}
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <div className="seat available small"></div>
          <span>Müsait</span>
        </div>
        <div className="legend-item">
          <div className="seat selected small"></div>
          <span>Seçili</span>
        </div>
        <div className="legend-item">
          <div className="seat occupied small"></div>
          <span>Dolu</span>
        </div>
        <div className="legend-item">
          <div className="seat vip available small"></div>
          <span>VIP</span>
        </div>
      </div>

      <div className="selected-seats-info">
        <p>Seçili Koltuklar: {selectedSeatsCount}/{maxSeats}</p>
        <div className="selected-seats-list">
          {seats
            .filter(seat => seat.isSelected)
            .map(seat => (
              <span key={seat.id} className="selected-seat-tag">
                {String.fromCharCode(64 + seat.row)}{seat.number}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
