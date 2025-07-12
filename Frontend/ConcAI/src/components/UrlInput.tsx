import React, { useState } from 'react';

interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
  initialUrl?: string;
}

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit, initialUrl = '' }) => {
  const [url, setUrl] = useState(initialUrl);
  const [isValidUrl, setIsValidUrl] = useState(false);

  const validateUrl = (inputUrl: string) => {
    try {
      new URL(inputUrl);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setIsValidUrl(validateUrl(newUrl));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidUrl) {
      onUrlSubmit(url);
    }
  };

  return (
    <div className="url-input-container">
      <h2>Video URL'sini Girin</h2>
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com/video.mp4"
            className={`url-input ${url ? (isValidUrl ? 'valid' : 'invalid') : ''}`}
          />
          <button 
            type="submit" 
            disabled={!isValidUrl}
            className="submit-button"
          >
            Devam Et
          </button>
        </div>
        {url && !isValidUrl && (
          <p className="error-message">Lütfen geçerli bir URL girin</p>
        )}
      </form>
      
      <div className="url-examples">
        <h3>Örnek URL Formatları:</h3>
        <ul>
          <li>YouTube: https://www.youtube.com/watch?v=...</li>
          <li>Vimeo: https://vimeo.com/...</li>
          <li>Direct Video: https://example.com/video.mp4</li>
        </ul>
      </div>
    </div>
  );
};

export default UrlInput;
