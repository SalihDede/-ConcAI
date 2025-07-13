import { useEffect, useRef } from 'react';

interface PositionalAudioProps {
  isEnabled: boolean;
  currentUserPosition: { x: number; y: number; z: number };
  speakers: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    audioStream?: MediaStream;
    isSpeaking: boolean;
    volume: number;
  }>;
}

const PositionalAudio: React.FC<PositionalAudioProps> = ({
  isEnabled,
  currentUserPosition,
  speakers
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const listenerRef = useRef<AudioListener | null>(null);
  const positionalAudioNodesRef = useRef<Map<string, PannerNode>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Initialize 3D audio context
  useEffect(() => {
    if (!isEnabled) return;

    const initializeAudio = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create listener (user's position)
        listenerRef.current = audioContextRef.current.listener;
        
        // Set listener position
        if (listenerRef.current.positionX) {
          listenerRef.current.positionX.setValueAtTime(currentUserPosition.x, audioContextRef.current.currentTime);
          listenerRef.current.positionY.setValueAtTime(currentUserPosition.y, audioContextRef.current.currentTime);
          listenerRef.current.positionZ.setValueAtTime(currentUserPosition.z, audioContextRef.current.currentTime);
        }
        
        // Set listener orientation (facing forward)
        if (listenerRef.current.forwardX) {
          listenerRef.current.forwardX.setValueAtTime(0, audioContextRef.current.currentTime);
          listenerRef.current.forwardY.setValueAtTime(0, audioContextRef.current.currentTime);
          listenerRef.current.forwardZ.setValueAtTime(-1, audioContextRef.current.currentTime);
          listenerRef.current.upX.setValueAtTime(0, audioContextRef.current.currentTime);
          listenerRef.current.upY.setValueAtTime(1, audioContextRef.current.currentTime);
          listenerRef.current.upZ.setValueAtTime(0, audioContextRef.current.currentTime);
        }
        
      } catch (error) {
        console.error('Error initializing 3D audio:', error);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup
      positionalAudioNodesRef.current.clear();
      audioElementsRef.current.forEach(audio => {
        audio.pause();
        audio.remove();
      });
      audioElementsRef.current.clear();
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isEnabled, currentUserPosition]);

  // Update speaker positions and audio
  useEffect(() => {
    if (!isEnabled || !audioContextRef.current) return;

    speakers.forEach(speaker => {
      const { id, position, audioStream, isSpeaking, volume } = speaker;
      
      if (isSpeaking && audioStream) {
        // Create or update positional audio node
        let pannerNode = positionalAudioNodesRef.current.get(id);
        let audioElement = audioElementsRef.current.get(id);

        if (!pannerNode && audioContextRef.current) {
          // Create new panner node
          pannerNode = audioContextRef.current.createPanner();
          
          // Configure panner node for 3D audio
          pannerNode.panningModel = 'HRTF';
          pannerNode.distanceModel = 'inverse';
          pannerNode.refDistance = 1;
          pannerNode.maxDistance = 50;
          pannerNode.rolloffFactor = 2;
          pannerNode.coneInnerAngle = 360;
          pannerNode.coneOuterAngle = 360;
          pannerNode.coneOuterGain = 0.3;
          
          // Set position
          if (pannerNode.positionX) {
            pannerNode.positionX.setValueAtTime(position.x, audioContextRef.current.currentTime);
            pannerNode.positionY.setValueAtTime(position.y, audioContextRef.current.currentTime);
            pannerNode.positionZ.setValueAtTime(position.z, audioContextRef.current.currentTime);
          }
          
          // Create audio element
          audioElement = document.createElement('audio');
          audioElement.srcObject = audioStream;
          audioElement.autoplay = true;
          audioElement.volume = volume;
          
          // Create media source and connect to panner
          const mediaSource = audioContextRef.current.createMediaElementSource(audioElement);
          mediaSource.connect(pannerNode);
          pannerNode.connect(audioContextRef.current.destination);
          
          // Store references
          positionalAudioNodesRef.current.set(id, pannerNode);
          audioElementsRef.current.set(id, audioElement);
        }
        
        // Update position if panner exists
        if (pannerNode && audioContextRef.current) {
          if (pannerNode.positionX) {
            pannerNode.positionX.setValueAtTime(position.x, audioContextRef.current.currentTime);
            pannerNode.positionY.setValueAtTime(position.y, audioContextRef.current.currentTime);
            pannerNode.positionZ.setValueAtTime(position.z, audioContextRef.current.currentTime);
          }
        }
        
        // Update volume
        if (audioElement) {
          audioElement.volume = volume;
        }
        
      } else {
        // Remove audio if not speaking
        const audioElement = audioElementsRef.current.get(id);
        if (audioElement) {
          audioElement.pause();
          audioElement.remove();
          audioElementsRef.current.delete(id);
        }
        positionalAudioNodesRef.current.delete(id);
      }
    });
  }, [isEnabled, speakers]);

  // Update listener position when user moves
  useEffect(() => {
    if (!isEnabled || !listenerRef.current || !audioContextRef.current) return;

    if (listenerRef.current.positionX) {
      listenerRef.current.positionX.setValueAtTime(currentUserPosition.x, audioContextRef.current.currentTime);
      listenerRef.current.positionY.setValueAtTime(currentUserPosition.y, audioContextRef.current.currentTime);
      listenerRef.current.positionZ.setValueAtTime(currentUserPosition.z, audioContextRef.current.currentTime);
    }
  }, [isEnabled, currentUserPosition]);

  // Component doesn't render anything - it's just for audio processing
  return null;
};

export default PositionalAudio;
