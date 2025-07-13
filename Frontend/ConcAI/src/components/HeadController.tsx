import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Human head movement limits (in radians) - starting from stage center
const HEAD_LIMITS = {
  // Up-down looking (pitch) limits - from stage center
  minPitch: -Math.PI / 2.5, // -72 degrees (more downward looking)
  maxPitch: Math.PI / 3,     // 60 degrees (more upward looking)
  
  // Left-right turning (yaw) limits - starting from stage center, wider
  minYaw: -Math.PI * 0.75,   // -135 degrees (much wider left)
  maxYaw: Math.PI * 0.75,    // 135 degrees (much wider right)
}

const MOUSE_SENSITIVITY = 0.002

const HeadController = ({ viewerPosition = [0, 1.8, 0] }: { viewerPosition?: [number, number, number] }) => {
  const { camera, gl } = useThree()
  const isPointerLocked = useRef(false)
  const targetRotation = useRef({ x: 0, y: 0 })
  const currentRotation = useRef({ x: 0, y: 0 })

  // Kamera pozisyonunu izleyicinin oturduğu koltuğa ayarla (sadece ilk mount'ta çalışsın)
  const initializedRef = useRef(false);
  useEffect(() => {
    camera.position.set(viewerPosition[0], viewerPosition[1] + 1.5, viewerPosition[2]);
    // Sadece ilk mount'ta initial rotation ayarla
    if (!initializedRef.current) {
      const stageCenter = new THREE.Vector3(0, 0, -12);
      const cameraPosition = new THREE.Vector3(viewerPosition[0], viewerPosition[1] + 1.5, viewerPosition[2]);
      const direction = new THREE.Vector3().subVectors(stageCenter, cameraPosition).normalize();
      let initialYaw = Math.atan2(direction.x, direction.z);
      initialYaw += Math.PI; // 180 derece döndür
      const horizontalDistance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
      const initialPitch = Math.atan2(-direction.y, horizontalDistance);
      targetRotation.current = { x: initialPitch, y: initialYaw };
      currentRotation.current = { x: initialPitch, y: initialYaw };
      camera.rotation.order = 'YXZ';
      camera.rotation.x = initialPitch;
      camera.rotation.y = initialYaw;
      camera.rotation.z = 0;
      initializedRef.current = true;
    }
  }, [camera, viewerPosition]);

  // Pointer lock event listeners
  useEffect(() => {
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked.current) return

      const { movementX, movementY } = event

      // Calculate yaw (left-right turning) - constrained by limits starting from stage center
      targetRotation.current.y -= movementX * MOUSE_SENSITIVITY
      // Clamp within wide angle range starting from stage center
      targetRotation.current.y = Math.max(
        HEAD_LIMITS.minYaw,
        Math.min(HEAD_LIMITS.maxYaw, targetRotation.current.y)
      )

      // Calculate pitch (up-down looking) - constrained by limits starting from stage center
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
      // Only Escape key should exit pointer lock, no other key should affect camera
      if (event.code === 'Escape') {
        document.exitPointerLock();
      }
      // Prevent any other key (including V) from affecting camera or pointer lock
      // (No-op for all other keys)
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
