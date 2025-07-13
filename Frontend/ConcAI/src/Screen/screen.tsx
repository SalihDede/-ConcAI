import React, { useState, useEffect } from 'react';
import './screen.css';

interface ScreenProps {
  videoUrl: string;
  selectedSeats: any[];
  onBack: () => void;
}

const Screen: React.FC<ScreenProps> = ({ videoUrl, selectedSeats, onBack }) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (videoUrl) {
      const convertedUrl = convertYouTubeUrl(videoUrl);
      if (convertedUrl) {
        setEmbedUrl(convertedUrl);
        setError('');
      } else {
        setError('Invalid YouTube URL');
      }
    }
  }, [videoUrl]);

  const convertYouTubeUrl = (url: string): string | null => {
    try {
      const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1`;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="screen-container">
        <div className="screen-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={onBack} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="cinema-header">
        <h2>🎬 Cinema Experience Begins!</h2>
        <div className="seat-info">
          <span>Seat(s): </span>
          {selectedSeats.map((seat, index) => (
            <span key={seat.id} className="seat-number">
              {String.fromCharCode(64 + seat.row)}{seat.number}
              {index < selectedSeats.length - 1 && ', '}
            </span>
          ))}
        </div>
      </div>
      
      <div className="screen-content">
        {isLoading && (
          <div className="screen-loading">
            <div className="loading-spinner"></div>
              <p>Preparing video...</p>
          </div>
        )}
        
        {embedUrl && (
          <div className="video-container">
            <iframe
              src={embedUrl}
              title="Cinema Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleIframeLoad}
              className="video-player"
            />
          </div>
        )}
      </div>

      <div className="screen-footer">
        <button onClick={onBack} className="exit-button">
          End Cinema
        </button>
      </div>
    </div>
  );
};

export default Screen;