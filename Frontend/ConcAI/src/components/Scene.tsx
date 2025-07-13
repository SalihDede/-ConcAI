import HeadController from './HeadController'
import { Html } from '@react-three/drei'

// Seat interface
interface Seat {
  id: number
  row: number
  seatNumber: number
  position: { x: number; y: number; z: number }
  rotation: number
  isSelected: boolean
}

// Scene props interface
interface SceneProps {
  seats: Seat[]
  currentViewerSeat: Seat
  videoUrl: string // Bu artık lokal video URL'si olacak
  videoTitle?: string
  isSeatSelectorOpen?: boolean
}

// Cinema seat component
const CinemaSeat = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat base */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      
      {/* Seat backrest */}
      <mesh position={[0, 0.8, -0.3]} castShadow>
        <boxGeometry args={[0.7, 1.0, 0.1]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      
      {/* Seat armrests */}
      <mesh position={[-0.35, 0.6, 0]} castShadow>
        <boxGeometry args={[0.1, 0.6, 0.6]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.35, 0.6, 0]} castShadow>
        <boxGeometry args={[0.1, 0.6, 0.6]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  )
}

// Stage platform
const Stage = () => {
  return (
    <group position={[0, 0, -12]}>
      {/* Main stage platform */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[16, 0.6, 8]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      
      {/* Stage back wall */}
      <mesh position={[0, 4, -4]} castShadow>
        <boxGeometry args={[16, 8, 0.3]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      
      {/* Stage side walls */}
      <mesh position={[-8, 4, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[8, 8, 0.3]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[8, 4, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[8, 8, 0.3]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
    </group>
  )
}

// Video oynatma ekranı
import { useRef, useEffect } from 'react'


const ProjectionScreenWithVideo = ({ videoUrl, videoTitle, viewerPosition, viewerRotationY, isSeatSelectorOpen }: { videoUrl: string; videoTitle?: string; viewerPosition: [number, number, number]; viewerRotationY: number; isSeatSelectorOpen: boolean }) => {
  const isLocalVideo = videoUrl.startsWith('http://localhost:5000/api/video/stream/');
  const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ses seviyesini mesafe ve açıya göre ayarla
  const updateVolume = () => {
    if (!videoRef.current) return;
    if (isSeatSelectorOpen) {
      videoRef.current.volume = 0.2; // Menü açıkken sabit düşük ses
      return;
    }
    const screenPos = { x: 0, y: 4.5, z: -12 };
    const [vx, , vz] = viewerPosition;
    const distance = Math.sqrt((vx - screenPos.x) ** 2 + (vz - screenPos.z) ** 2);
    const minDist = 6, maxDist = 20;
    let distanceVolume = 1 - (distance - minDist) / (maxDist - minDist);
    distanceVolume = Math.max(0.15, Math.min(1, distanceVolume));
    const dx = screenPos.x - vx;
    const dz = screenPos.z - vz;
    const targetAngle = Math.atan2(dx, dz);
    let angleDiff = Math.abs(viewerRotationY - targetAngle);
    angleDiff = Math.min(angleDiff, Math.abs(2 * Math.PI - angleDiff));
    let angleVolume = angleDiff / (Math.PI / 1.2);
    angleVolume = Math.max(0.15, Math.min(1, angleVolume));
    const finalVolume = distanceVolume * angleVolume;
    videoRef.current.volume = finalVolume;
  };

  useEffect(() => {
    updateVolume();
  }, [viewerPosition, viewerRotationY, isSeatSelectorOpen]);

  // Video yüklendiğinde de sesi ayarla
  const handleLoadedMetadata = () => {
    updateVolume();
  };

  const getEmbedUrl = (url: string) => {
    if (isYouTubeUrl) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&controls=1`;
      }
    }
    return url;
  };

  return (
    <group position={[0, 4.5, -12]}>
      {/* Perde çerçevesi */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[12, 6, 0.1]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Perde içi (ekran alanı) */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[11, 5.5, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} />
      </mesh>

      {/* Video oynatıcı */}
      <Html
        center
        transform
        position={[0, 0, 0.03]}
        style={{
          width: '440px',
          height: '220px',
          pointerEvents: 'all',
        }}
      >
        {isLocalVideo ? (
          // Lokal video dosyası için HTML5 video element
          <video
            ref={videoRef}
            src={videoUrl}
            width="440"
            height="220"
            controls
            autoPlay
            onLoadedMetadata={handleLoadedMetadata}
            style={{
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'black',
              display: 'block',
            }}
          />
        ) : (
          // YouTube veya diğer embed videolar için iframe
          <iframe
            src={getEmbedUrl(videoUrl)}
            width="440"
            height="220"
            frameBorder="0"
            allowFullScreen
            style={{
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'black',
              display: 'block',
            }}
          />
        )}
      </Html>

      {/* Video başlık plakası */}
      {videoTitle && (
        <Html
          center
          transform
          position={[0, -3.5, 0.03]}
          style={{
            width: '400px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            maxWidth: '400px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {videoTitle}
          </div>
        </Html>
      )}
    </group>
  );
};

// Floor - for more natural appearance
const Floor = () => {
  return (
    <>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[25]} />
        <meshStandardMaterial color="#3A3A3A" />
      </mesh>
      
      {/* Stage front floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -8]} receiveShadow>
        <boxGeometry args={[20, 8]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>
    </>
  )
}

// Amphitheater steps - surrounding the stage
const AmphitheaterSteps = () => {
  const steps: any[] = []
  const seatsPerRow = [6, 9, 12, 15, 18]
  
  seatsPerRow.forEach((_, rowIndex) => {
    const radius = 8 + (rowIndex * 2.5)
    const heightIncrement = 0.32
    const height = 0.2 + (rowIndex * heightIncrement)
    const stepHeight = 0.4
    
    steps.push(
      <mesh key={rowIndex} rotation={[-Math.PI / 2, 0, 0]} position={[0, height - stepHeight/2, 0]} receiveShadow>
        <ringGeometry args={[radius - 1, radius + 1.5, 32, 1, -Math.PI/1.2, Math.PI/1.2]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
    )
  })
  
  return <>{steps}</>
}

// Dış duvarlar - daha gerçekçi koloseum
const ColosseumWalls = () => {
  const walls = []
  const radius = 22
  const segments = 20
  
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius
    
    walls.push(
      <mesh key={i} position={[x, 4, z]} rotation={[0, angle, 0]} castShadow>
        <boxGeometry args={[2, 8, 0.8]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    )
    
    if (i % 2 === 0) {
      walls.push(
        <mesh key={`pillar-${i}`} position={[x * 0.9, 5, z * 0.9]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 10]} />
          <meshStandardMaterial color="#A0805A" />
        </mesh>
      )
    }
  }
  
  return <>{walls}</>
}

import { useThree } from '@react-three/fiber'
const Scene = ({ seats, currentViewerSeat, videoUrl, videoTitle, isSeatSelectorOpen }: SceneProps) => {
  const { camera } = useThree();
  const viewerRotationY = camera.rotation.y;
  const viewerPosition: [number, number, number] = [currentViewerSeat.position.x, currentViewerSeat.position.y + 1.5, currentViewerSeat.position.z];
  return (
    <>
      {/* Main stage light - brightness increased */}
      <spotLight
        position={[0, 15, -8]}
        angle={Math.PI / 6}
        penumbra={0.2}
        intensity={4.5}
        castShadow
        target-position={[0, 1, -12]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Ambient lighting - brightness increased */}
      <directionalLight
        position={[15, 20, 15]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      
      {/* Stage side lights - brightness increased */}
      <pointLight position={[-8, 6, -10]} intensity={1.8} color="#FFD700" />
      <pointLight position={[8, 6, -10]} intensity={1.8} color="#FFD700" />
      
      {/* Ceiling light - brightness increased */}
      <pointLight position={[0, 12, 0]} intensity={1.2} color="#FFFFFF" />
      
      {/* General ambient light added */}
      <ambientLight intensity={0.4} color="#FFFFFF" />

      {/* Floor and structures */}
      <Floor />
      <AmphitheaterSteps />
      <ColosseumWalls />
      <Stage />

      {/* Video oynatma ekranı */}
      <ProjectionScreenWithVideo videoUrl={videoUrl} videoTitle={videoTitle} viewerPosition={viewerPosition} viewerRotationY={viewerRotationY} isSeatSelectorOpen={!!isSeatSelectorOpen} />

      {/* Amphitheater seats */}
      {seats.map((seat, index) => {
        if (seat.row === currentViewerSeat.row && seat.seatNumber === currentViewerSeat.seatNumber) {
          return null
        }
        
        return (
          <CinemaSeat
            key={index}
            position={[seat.position.x, seat.position.y, seat.position.z]}
            rotation={[0, seat.rotation, 0]}
          />
        )
      })}
      
      {/* Head movement controller */}
      <HeadController viewerPosition={[currentViewerSeat.position.x, currentViewerSeat.position.y + 1.5, currentViewerSeat.position.z]} />
    </>
  )
}

export default Scene
