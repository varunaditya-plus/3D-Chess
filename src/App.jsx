import { Canvas } from '@react-three/fiber'
import Board from './components/board'
import { PreloadPieces } from './components/pieces'

function App() {
  return (
    <Canvas camera={{ position: [10, 14, 10], fov: 45, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }} className="w-full h-full">
      <PreloadPieces />
      <Board />
    </Canvas>
  )
}

export default App