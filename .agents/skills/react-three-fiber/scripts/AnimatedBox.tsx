import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * High-Performance Animation Component
 * Mutates refs inside useFrame to avoid React re-renders.
 */
export const AnimatedBox = (props: JSX.IntrinsicElements['mesh']) => {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state, delta) => {
    // Perform mutations here
    meshRef.current.rotation.x += delta
    meshRef.current.rotation.y += delta * 0.5
    
    // Example of sine wave oscillation
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5
  })

  return (
    <mesh {...props} ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}
