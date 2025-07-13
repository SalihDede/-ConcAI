import React, { useEffect, useRef, useState } from 'react';
import './coollesium.css';

interface CoollesiumProps {
  isActive?: boolean;
  videoUrl?: string;
  selectedSeats?: any[];
}

const Coollesium: React.FC<CoollesiumProps> = ({ 
  isActive = false, 
  videoUrl = '', 
  selectedSeats = [] 
}) => {
  console.log('Selected seats:', selectedSeats); // Use the variable to avoid TypeScript warning
  const containerRef = useRef<HTMLDivElement>(null);
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isActive && containerRef.current) {
      // Sahne animasyonlarını başlat
      containerRef.current.classList.add('scene-active');
    }
  }, [isActive]);

  useEffect(() => {
    if (videoUrl) {
      const convertedUrl = convertYouTubeUrl(videoUrl);
      if (convertedUrl) {
        setEmbedUrl(convertedUrl);
        setError('');
        setIsLoading(false);
      } else {
        setError('Geçersiz YouTube URL\'si');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
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

  return (
    <div ref={containerRef} className="coollesium-container">
      {/* Arka Plan Gradient */}
      <div className="background-gradient" />
      
      {/* Spotlights */}
      <div className="spotlight spotlight-left" />
      <div className="spotlight spotlight-right" />
      <div className="spotlight spotlight-center" />
      
      {/* Ana Ekran */}
      <div className="cinema-screen">
        <div className="screen-frame">
          <div className="screen-surface">
            <div className="screen-glow" />
            <div className="screen-content">
              {isLoading && videoUrl && (
                <div className="screen-loading">
                  <div className="loading-spinner"></div>
                  <p>Video hazırlanıyor...</p>
                </div>
              )}
              
              {error && (
                <div className="screen-error">
                  <h3>Hata</h3>
                  <p>{error}</p>
                </div>
              )}
              
              {embedUrl && !isLoading && !error ? (
                <div className="video-container">
                  <iframe
                    src={embedUrl}
                    title="Sinema Videosu"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={handleIframeLoad}
                    className="video-player"
                  />
                </div>
              ) : !videoUrl ? (
                <>
                  <div className="screen-logo">ConcAI</div>
                  <div className="screen-subtitle">Sinema Deneyimi</div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Sahne Zemini */}
      <div className="stage-floor">
        <div className="floor-grid" />
        <div className="floor-reflection" />
      </div>

      {/* Yan Duvarlar */}
      <div className="side-wall side-wall-left">
        <div className="wall-lighting" />
      </div>
      <div className="side-wall side-wall-right">
        <div className="wall-lighting" />
      </div>

      {/* Tavan Aydınlatması */}
      <div className="ceiling-lights">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="ceiling-light" 
            style={{
              left: `${10 + (i * 7)}%`,
              animationDelay: `${i * 200}ms`
            }}
          />
        ))}
      </div>

      {/* Atmosfer Partikülleri */}
      <div className="atmosphere-particles">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5000}ms`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Giriş Aydınlatması */}
      <div className="entrance-lighting">
        <div className="entrance-light entrance-light-left" />
        <div className="entrance-light entrance-light-right" />
      </div>
    </div>
  );
};

export default Coollesium;