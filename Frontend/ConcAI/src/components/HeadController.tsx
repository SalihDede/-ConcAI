import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// İnsan kafa hareket limitleri (radyan cinsinden) - sahne merkezinden başlayarak
const HEAD_LIMITS = {
  // Yukarı-aşağı bakma (pitch) limitleri - sahne merkezinden
  minPitch: -Math.PI / 2.5, // -72 derece (daha fazla aşağı bakma)
  maxPitch: Math.PI / 3,     // 60 derece (daha fazla yukarı bakma)
  
  // Sağa-sola dönme (yaw) limitleri - sahne merkezinden başlayarak daha geniş
  minYaw: -Math.PI * 0.75,   // -135 derece (çok daha geniş sol)
  maxYaw: Math.PI * 0.75,    // 135 derece (çok daha geniş sağ)
}

const MOUSE_SENSITIVITY = 0.002

const HeadController = ({ viewerPosition = [0, 1.8, 0] }: { viewerPosition?: [number, number, number] }) => {
  const { camera, gl } = useThree()
  const isPointerLocked = useRef(false)
  const targetRotation = useRef({ x: 0, y: 0 })
  const currentRotation = useRef({ x: 0, y: 0 })

  // Kamera pozisyonunu izleyicinin oturduğu koltuğa ayarla
  useEffect(() => {
    camera.position.set(viewerPosition[0], viewerPosition[1] + 1.5, viewerPosition[2])
    
    // Sahne merkezine bakış açısını hesapla (başlangıç rotasyonu)
    const stageCenter = new THREE.Vector3(0, 0, -12)
    const cameraPosition = new THREE.Vector3(viewerPosition[0], viewerPosition[1] + 1.5, viewerPosition[2])
    
    // Sahne merkezine doğru yönlendirme hesapla
    const direction = new THREE.Vector3().subVectors(stageCenter, cameraPosition).normalize()
    
    // Y ekseni rotasyonunu (yaw) hesapla - sahne merkezine bakış
    const initialYaw = Math.atan2(direction.x, direction.z)
    
    // X ekseni rotasyonunu (pitch) hesapla - hafif aşağı bakış
    const horizontalDistance = Math.sqrt(direction.x * direction.x + direction.z * direction.z)
    const initialPitch = Math.atan2(-direction.y, horizontalDistance)
    
    // Başlangıç rotasyonunu sahne merkezine ayarla (bu 0 noktası olacak)
    targetRotation.current = { x: initialPitch, y: initialYaw }
    currentRotation.current = { x: initialPitch, y: initialYaw }
    
    // Kamerayı hemen sahne merkezine yönlendir
    camera.rotation.order = 'YXZ'
    camera.rotation.x = initialPitch
    camera.rotation.y = initialYaw
    camera.rotation.z = 0
  }, [camera, viewerPosition])

  // Pointer lock event listeners
  useEffect(() => {
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked.current) return

      const { movementX, movementY } = event

      // Yaw (sağa-sola dönme) hesapla - sahne merkezinden başlayarak limitlerle kısıtla
      targetRotation.current.y -= movementX * MOUSE_SENSITIVITY
      
      // Sahne merkezinden başlayarak geniş açı aralığında clamp
      targetRotation.current.y = Math.max(
        HEAD_LIMITS.minYaw,
        Math.min(HEAD_LIMITS.maxYaw, targetRotation.current.y)
      )

      // Pitch (yukarı-aşağı bakma) hesapla - sahne merkezinden başlayarak limitlerle kısıtla
      targetRotation.current.x -= movementY * MOUSE_SENSITIVITY
      targetRotation.current.x = Math.max(
        HEAD_LIMITS.minPitch,
        Math.min(HEAD_LIMITS.maxPitch, targetRotation.current.x)
      )
    }

    const handleClick = () => {
      gl.domElement.requestPointerLock()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        document.exitPointerLock()
      }
    }

    // Event listener'ları ekle
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyDown)
    gl.domElement.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [gl.domElement])

  // Smooth camera rotation animation
  useFrame(() => {
    if (!isPointerLocked.current) return

    // Lerp current rotation towards target rotation
    const lerpFactor = 0.1
    currentRotation.current.x = THREE.MathUtils.lerp(
      currentRotation.current.x,
      targetRotation.current.x,
      lerpFactor
    )
    currentRotation.current.y = THREE.MathUtils.lerp(
      currentRotation.current.y,
      targetRotation.current.y,
      lerpFactor
    )

    // Apply rotation to camera
    camera.rotation.order = 'YXZ'
    camera.rotation.x = currentRotation.current.x
    camera.rotation.y = currentRotation.current.y
    camera.rotation.z = 0
  })

  return null
}

export default HeadController
