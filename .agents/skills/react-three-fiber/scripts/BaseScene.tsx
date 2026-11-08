import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'

/**
 * Standard R3F Scene Boilerplate
 * Includes: Camera, Lighting, Controls, and Environment
 */
export const BaseScene = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 5, 10], fov: 45 }}
    >
      <color attach="background" args={['#050505']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
      <pointLight position={[-10, -10, -10]} />

      {/* Environment & Helpers */}
      <Environment preset="city" />
      <OrbitControls makeDefault />
      
      {/* Scene Content */}
      <React.Suspense fallback={null}>
        {children}
      </React.Suspense>
    </Canvas>
  )
}
