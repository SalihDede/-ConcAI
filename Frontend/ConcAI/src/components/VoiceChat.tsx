import React, { useEffect, useRef } from 'react';
import PositionalAudio from './PositionalAudio';
import './VoiceChat.css';

interface VoiceChatProps {
  isEnabled: boolean;
  currentSeat: {
    row: number;
    seatNumber: number;
    position: { x: number; y: number; z: number };
  };
  setAudioLevel: React.Dispatch<React.SetStateAction<number>>;
  setIsSpeaking: React.Dispatch<React.SetStateAction<boolean>>;
}

interface VoiceUser {
  id: string;
  name: string;
  seat: {
    row: number;
    seatNumber: number;
    position: { x: number; y: number; z: number };
  };
  isSpeaking: boolean;
  audioLevel: number;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ isEnabled, currentSeat, setAudioLevel, setIsSpeaking }) => {
  const [connectedUsers, setConnectedUsers] = React.useState<VoiceUser[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize voice chat
  const initializeVoiceChat = async () => {
    try {
      // Get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      localStreamRef.current = stream;
      
      // Create audio context for voice detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);
      
      // setIsVoiceEnabled removed
      startVoiceDetection();
      
    } catch (error) {
      console.error('Error initializing voice chat:', error);
      alert('Microphone access denied. Voice chat will not work.');
    }
  };

  // Start voice level detection
  const startVoiceDetection = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const detectVoice = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
      
      setAudioLevel(normalizedLevel);
      
      // Consider speaking if volume is above threshold
      const speakingThreshold = 0.1;
      const currentlySpeaking = normalizedLevel > speakingThreshold;
      setIsSpeaking(currentlySpeaking);
      
      animationFrameRef.current = requestAnimationFrame(detectVoice);
    };
    
    detectVoice();
  };


  // Initialize voice chat when component mounts
  useEffect(() => {
    if (isEnabled) {
      initializeVoiceChat();
    }

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isEnabled]);

  // Simulate connected users for demo (in real app, this would come from WebSocket)
  useEffect(() => {
    const simulateUsers = () => {
      const demoUsers: VoiceUser[] = [
        {
          id: '1',
          name: 'User 1',
          seat: { row: 2, seatNumber: 4, position: { x: -2, y: 0.1, z: -10 } },
          isSpeaking: false,
          audioLevel: 0
        },
        {
          id: '2',
          name: 'User 2',
          seat: { row: 3, seatNumber: 8, position: { x: 3, y: 0.1, z: -12 } },
          isSpeaking: false,
          audioLevel: 0
        },
        {
          id: '3',
          name: 'User 3',
          seat: { row: 1, seatNumber: 2, position: { x: -4, y: 0.1, z: -8 } },
          isSpeaking: false,
          audioLevel: 0
        }
      ];
      
      setConnectedUsers(demoUsers);
    };

    if (isEnabled) {
      simulateUsers();
    }
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="voice-chat-container">
      <div className="voice-chat-ui">
        <div className="voice-status">
          <div className={`microphone-indicator ${true ? 'enabled' : 'disabled'}`}>
            <span className="mic-icon">🎤</span>
            <span className="mic-status">
              {'Ready to speak'}
            </span>
          </div>
        </div>

        <div className="connected-users">
          <h4>Connected Users ({connectedUsers.length})</h4>
          <div className="current-user-info">
            <p>You are in Row {currentSeat.row}, Seat {currentSeat.seatNumber}</p>
          </div>
          <div className="users-list">
            {connectedUsers.map(user => (
              <div key={user.id} className={`user-item ${user.isSpeaking ? 'speaking' : ''}`}>
                <span className="user-name">{user.name}</span>
                <span className="user-seat">Row {user.seat.row}, Seat {user.seat.seatNumber}</span>
                {user.isSpeaking && <span className="speaking-indicator">🗣️</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="voice-controls">
          <p className="voice-instructions">
            <strong>Hold V key</strong> to talk to other viewers
          </p>
          {true && (
            <button onClick={initializeVoiceChat} className="enable-voice-btn">
              Enable Voice Chat
            </button>
          )}
        </div>
      </div>
      
      <PositionalAudio
        isEnabled={true}
        currentUserPosition={currentSeat.position}
        speakers={connectedUsers.map(user => ({
          id: user.id,
          position: user.seat.position,
          isSpeaking: user.isSpeaking,
          volume: user.audioLevel
        }))}
      />
    </div>
  );
};

export default VoiceChat;
