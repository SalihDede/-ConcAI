import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './UrlInput.css';

interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  uploader: string;
  view_count: number;
  description: string;
}

interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
  initialUrl?: string;
}

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit, initialUrl = '' }) => {
  const [url, setUrl] = useState(initialUrl);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed' | 'failed'>('idle');
  const [downloadedFilename, setDownloadedFilename] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('download_progress', (data: any) => {
      if (data.download_id === downloadId) {
        setDownloadProgress(data.progress);
        setDownloadStatus(data.status);
      }
    });

    newSocket.on('download_complete', (data: any) => {
      if (data.download_id === downloadId) {
        setDownloadStatus('completed');
        // Video indirme tamamlandıktan sonra 3D ortamına geç
        setTimeout(() => {
          if (downloadedFilename) {
            const localVideoUrl = `http://localhost:5000/api/video/stream/${downloadedFilename}`;
            onUrlSubmit(localVideoUrl);
          } else {
            onUrlSubmit(url); // Fallback to original URL
          }
        }, 1000);
      }
    });

    newSocket.on('download_error', (data: any) => {
      if (data.download_id === downloadId) {
        setDownloadStatus('failed');
        console.error('Download failed:', data.error);
      }
    });

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [downloadId, url, onUrlSubmit]);

  const validateUrl = (inputUrl: string) => {
    try {
      const url = new URL(inputUrl);
      return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
    } catch {
      return false;
    }
  };

  const fetchVideoInfo = async (videoUrl: string) => {
    if (!validateUrl(videoUrl)) return;
    
    // setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/video/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (response.ok) {
        const info = await response.json();
        setVideoInfo(info);
      }
    } catch (error) {
      console.error('Video info fetch error:', error);
    } finally {
      // setIsLoading(false);
    }
  };

  const downloadVideo = async () => {
    if (!isValidUrl) return;

    setDownloadStatus('downloading');
    setDownloadProgress(0);

    try {
      const response = await fetch('http://localhost:5000/api/video/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url, 
          format: 'mp4' 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDownloadId(data.download_id);
        setDownloadedFilename(data.filename);
        setVideoInfo(data.video_info);
      } else {
        setDownloadStatus('failed');
      }
    } catch (error) {
      console.error('Download start error:', error);
      setDownloadStatus('failed');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    const isValid = validateUrl(newUrl);
    setIsValidUrl(isValid);
    
    if (isValid) {
      fetchVideoInfo(newUrl);
    } else {
      setVideoInfo(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidUrl && downloadStatus === 'idle') {
      downloadVideo();
    }
  };

  const getProgressText = () => {
    switch (downloadStatus) {
      case 'downloading':
        return `Downloading... ${Math.round(downloadProgress * 100)}%`;
      case 'completed':
        return 'Download completed! Switching to 3D environment...';
      case 'failed':
        return 'Download failed. Please try again.';
      default:
        return '';
    }
  };

  return (
    <div className="url-input-container">
      <h2>Enter YouTube Video URL</h2>
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`url-input ${url ? (isValidUrl ? 'valid' : 'invalid') : ''}`}
            disabled={downloadStatus === 'downloading'}
          />
          <button 
            type="submit" 
            disabled={!isValidUrl || downloadStatus === 'downloading'}
            className="submit-button"
          >
            {downloadStatus === 'downloading' ? 'Downloading...' : 'Download and Watch'}
          </button>
        </div>
        
        {url && !isValidUrl && (
          <p className="error-message">Please enter a valid YouTube URL</p>
        )}
        
        {downloadStatus !== 'idle' && (
          <div className="download-status">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${downloadProgress * 100}%` }}
              />
            </div>
            <p className="progress-text">{getProgressText()}</p>
          </div>
        )}
        
        {videoInfo && (
          <div className="video-info">
            <h3>Video Information:</h3>
            <p><strong>Title:</strong> {videoInfo.title}</p>
            <p><strong>Channel:</strong> {videoInfo.uploader}</p>
            <p><strong>Duration:</strong> {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</p>
            <p><strong>Views:</strong> {videoInfo.view_count?.toLocaleString()} times</p>
            {videoInfo.description && <p><strong>Description:</strong> {videoInfo.description}</p>}
          </div>
        )}
      </form>
    </div>
  );
};

export default UrlInput;
