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
}

// Sinema koltuğu bileşeni
const CinemaSeat = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Koltuk oturağı */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      
      {/* Koltuk sırtlığı */}
      <mesh position={[0, 0.8, -0.3]} castShadow>
        <boxGeometry args={[0.7, 1.0, 0.1]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      
      {/* Koltuk kolçakları */}
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

// Sahne platformu
const Stage = () => {
  return (
    <group position={[0, 0, -12]}>
      {/* Ana sahne platformu */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[16, 0.6, 8]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      
      {/* Sahne arka duvarı */}
      <mesh position={[0, 4, -4]} castShadow>
        <boxGeometry args={[16, 8, 0.3]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      
      {/* Sahne yan duvarları */}
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

const ProjectionScreenWithVideo = ({ videoUrl, videoTitle, viewerPosition, viewerRotationY }: { videoUrl: string; videoTitle?: string; viewerPosition: [number, number, number]; viewerRotationY: number }) => {
  const isLocalVideo = videoUrl.startsWith('http://localhost:5000/api/video/stream/');
  const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ses seviyesini mesafe ve açıya göre ayarla
  useEffect(() => {
    if (!videoRef.current) return;
    // Sahne merkezi (perde) noktası
    const screenPos = { x: 0, y: 4.5, z: -12 };
    const [vx, , vz] = viewerPosition;
    // Mesafe (daha uzaksa ses azalır)
    const distance = Math.sqrt((vx - screenPos.x) ** 2 + (vz - screenPos.z) ** 2);
    // 6 birimden yakınsa tam ses, 20 birimden uzaktaysa minimum ses
    const minDist = 6, maxDist = 20;
    let distanceVolume = 1 - (distance - minDist) / (maxDist - minDist);
    distanceVolume = Math.max(0.15, Math.min(1, distanceVolume));

    // Kullanıcı bakış açısı ile perde arasındaki açı farkı (daha çok bakıyorsa ses yüksek)
    // Kullanıcıdan perdeye vektör
    const dx = screenPos.x - vx;
    const dz = screenPos.z - vz;
    const targetAngle = Math.atan2(dx, dz); // Sahneye bakış açısı
    let angleDiff = Math.abs(viewerRotationY - targetAngle);
    // Açıyı [0, pi] aralığına çek
    angleDiff = Math.min(angleDiff, Math.abs(2 * Math.PI - angleDiff));
    // 0 rad (doğrudan bakıyor) ise tam ses, pi/2 ve üstü ise düşük ses
    let angleVolume = 1 - angleDiff / (Math.PI / 1.2); // 0~1 arası
    angleVolume = Math.max(0.15, Math.min(1, angleVolume));

    // Son ses: mesafe ve açı çarpımı
    const finalVolume = distanceVolume * angleVolume;
    videoRef.current.volume = finalVolume;
  }, [viewerPosition, viewerRotationY, videoUrl]);

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

// Zemin - daha doğal görünüm için
const Floor = () => {
  return (
    <>
      {/* Ana zemin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[25]} />
        <meshStandardMaterial color="#3A3A3A" />
      </mesh>
      
      {/* Sahne önü zemin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -8]} receiveShadow>
        <boxGeometry args={[20, 8]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>
    </>
  )
}

// Amfi tiyatro basamakları - sahneyi çevreleyen
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
const Scene = ({ seats, currentViewerSeat, videoUrl, videoTitle }: SceneProps) => {
  // Kamera yönünü almak için useThree
  const { camera } = useThree();
  // Kamera yönü (Y ekseni, yani yatay bakış açısı)
  const viewerRotationY = camera.rotation.y;
  const viewerPosition: [number, number, number] = [currentViewerSeat.position.x, currentViewerSeat.position.y + 1.5, currentViewerSeat.position.z];
  return (
    <>
      {/* Ana sahne ışığı - parlaklık artırıldı */}
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
      
      {/* Çevresel aydınlatma - parlaklık artırıldı */}
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
      
      {/* Sahne yan ışıkları - parlaklık artırıldı */}
      <pointLight position={[-8, 6, -10]} intensity={1.8} color="#FFD700" />
      <pointLight position={[8, 6, -10]} intensity={1.8} color="#FFD700" />
      
      {/* Tavan ışığı - parlaklık artırıldı */}
      <pointLight position={[0, 12, 0]} intensity={1.2} color="#FFFFFF" />
      
      {/* Genel ortam ışığı eklendi */}
      <ambientLight intensity={0.4} color="#FFFFFF" />

      {/* Zemin ve yapılar */}
      <Floor />
      <AmphitheaterSteps />
      <ColosseumWalls />
      <Stage />

      {/* Video oynatma ekranı */}
      <ProjectionScreenWithVideo videoUrl={videoUrl} videoTitle={videoTitle} viewerPosition={viewerPosition} viewerRotationY={viewerRotationY} />

      {/* Amfi tiyatro koltukları */}
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
      
      {/* Kafa hareket kontrolcüsü */}
      <HeadController viewerPosition={[currentViewerSeat.position.x, currentViewerSeat.position.y + 1.5, currentViewerSeat.position.z]} />
    </>
  )
}

export default Scene
