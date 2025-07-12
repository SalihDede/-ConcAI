import HeadController from './HeadController'

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

// Beyaz projeksiyon perdesi
const ProjectionScreen = () => {
  return (
    <group position={[0, 4, -11.8]}>
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
    </group>
  )
}

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

const Scene = ({ seats, currentViewerSeat }: SceneProps) => {
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
      <ProjectionScreen />

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
