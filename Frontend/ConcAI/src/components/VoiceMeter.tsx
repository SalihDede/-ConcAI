import React from 'react';
import './VoiceMeter.css';

interface VoiceMeterProps {
  audioLevel: number;
  isSpeaking: boolean;
}

const VoiceMeter: React.FC<VoiceMeterProps> = ({ audioLevel, isSpeaking }) => {
  const getVoiceStatus = () => {
    return isSpeaking ? 'Speaking...' : 'Ready to speak';
  };

  const getVoiceColor = () => {
    if (audioLevel < 0.3) return '#22c55e'; // Green
    if (audioLevel < 0.7) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="voice-meter-container">
      <div className="voice-meter-header">
        <span className="voice-meter-title">🎤 Voice Level</span>
        <span className="voice-meter-percentage" style={{ color: getVoiceColor() }}>
          {Math.round(audioLevel * 100)}%
        </span>
      </div>
      
      <div className="voice-meter-bar-container">
        <div className="voice-meter-bar-background">
          <div 
            className={`voice-meter-bar ${isSpeaking ? 'speaking' : ''}`}
            style={{ 
              width: `${audioLevel * 100}%`,
              backgroundColor: getVoiceColor()
            }}
          />
        </div>
        
        {/* Volume level indicators */}
        <div className="voice-meter-indicators">
          <div className="voice-meter-indicator" style={{ left: '30%' }}>
            <span className="indicator-line"></span>
            <span className="indicator-label">30%</span>
          </div>
          <div className="voice-meter-indicator" style={{ left: '70%' }}>
            <span className="indicator-line"></span>
            <span className="indicator-label">70%</span>
          </div>
        </div>
      </div>
      
      <div className="voice-meter-status">
        <span className={`voice-status-text ${isSpeaking ? 'speaking' : ''}`}>
          {getVoiceStatus()}
        </span>
      </div>
    </div>
  );
};

export default VoiceMeter;
