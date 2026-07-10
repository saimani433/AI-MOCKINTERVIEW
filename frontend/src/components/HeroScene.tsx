import { Float, MeshDistortMaterial, OrbitControls, Sphere, Text, Torus } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'

function ScoreCard({ position, label, value, color }: { position: [number, number, number]; label: string; value: string; color: string }) {
  return (
    <Float speed={2.4} rotationIntensity={0.18} floatIntensity={0.55}>
      <group position={position} rotation={[0.04, -0.24, 0.02]}>
        <mesh>
          <boxGeometry args={[1.1, 0.62, 0.04]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.45} />
        </mesh>
        <mesh position={[-0.38, 0.13, 0.03]}>
          <boxGeometry args={[0.18, 0.18, 0.02]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
        </mesh>
        <Text position={[0.12, 0.14, 0.05]} fontSize={0.08} anchorX="center" color="#0f172a">{label}</Text>
        <Text position={[0.08, -0.13, 0.05]} fontSize={0.16} anchorX="center" color="#07111f">{value}</Text>
      </group>
    </Float>
  )
}

function InterviewConsole() {
  const group = useRef<Group>(null)
  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y = Math.sin(Date.now() * 0.0007) * 0.11
    group.current.position.y += Math.sin(Date.now() * 0.001) * delta * 0.06
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.75, 2.2, 0.14]} />
        <meshStandardMaterial color="#0f172a" metalness={0.34} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[1.55, 1.95, 0.02]} />
        <meshStandardMaterial color="#101827" emissive="#0f172a" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.76, 0.105]}>
        <boxGeometry args={[1.18, 0.26, 0.026]} />
        <meshStandardMaterial color="#2ee9a6" emissive="#0f766e" emissiveIntensity={0.42} />
      </mesh>
      <Text position={[0, 0.76, 0.13]} fontSize={0.09} anchorX="center" anchorY="middle" color="#052e2b">AI Interview Live</Text>
      {[0.34, 0.05, -0.24].map((y, index) => (
        <group key={y} position={[0, y, 0.11]}>
          <mesh position={[-0.47, 0, 0]}>
            <boxGeometry args={[0.17, 0.17, 0.022]} />
            <meshStandardMaterial color={['#4cc9f0', '#ff7a6b', '#ffc857'][index]} emissive={['#0369a1', '#be123c', '#a16207'][index]} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0.14, 0.04, 0]}>
            <boxGeometry args={[0.76, 0.032, 0.018]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[-0.02, -0.06, 0]}>
            <boxGeometry args={[0.46, 0.026, 0.018]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.78, 0.11]}>
        <boxGeometry args={[0.96, 0.22, 0.03]} />
        <meshStandardMaterial color="#ff7a6b" emissive="#be123c" emissiveIntensity={0.32} />
      </mesh>
      <Text position={[0, -0.78, 0.135]} fontSize={0.08} anchorX="center" anchorY="middle" color="#fff1f2">Generate report</Text>
    </group>
  )
}

function NeuralCore() {
  const ring = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.z += delta * 0.7
  })
  return (
    <group>
      <InterviewConsole />
      <ScoreCard position={[1.75, 0.95, -0.1]} label="Communication" value="91%" color="#2ee9a6" />
      <ScoreCard position={[1.78, -0.75, 0.12]} label="Tech Depth" value="84%" color="#4cc9f0" />
      <ScoreCard position={[-1.68, 1.1, 0.1]} label="Confidence" value="88%" color="#ffc857" />
      <Float speed={1.5} rotationIntensity={0.7} floatIntensity={1.2}>
        <Sphere args={[1.35, 64, 64]} position={[0, 0.02, -0.55]}>
          <MeshDistortMaterial color="#4cc9f0" transparent opacity={0.22} distort={0.2} speed={1.4} roughness={0.24} metalness={0.62} />
        </Sphere>
      </Float>
      <Torus ref={ring} args={[1.86, 0.024, 16, 120]} rotation={[1.18, 0.25, 0.4]}>
        <meshStandardMaterial color="#2ee9a6" emissive="#2ee9a6" emissiveIntensity={0.45} />
      </Torus>
      <Torus args={[2.2, 0.025, 16, 120]} rotation={[0.1, 1.32, 1.2]}>
        <meshStandardMaterial color="#ff7a6b" emissive="#ff7a6b" emissiveIntensity={0.34} />
      </Torus>
      <Torus args={[2.55, 0.02, 16, 120]} rotation={[1.7, 0.4, -0.5]}>
        <meshStandardMaterial color="#ffc857" emissive="#ffc857" emissiveIntensity={0.28} />
      </Torus>
    </group>
  )
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }}>
      <ambientLight intensity={1.2} />
      <pointLight position={[3, 3, 5]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-4, -2, -2]} intensity={1.8} color="#2ee9a6" />
      <NeuralCore />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  )
}
