'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Board from '../components/board'
import { PreloadPieces } from '../components/pieces'

export default function Home() {
  const [isPanned, setIsPanned] = useState(false)
  return (
    <>
      <Canvas camera={{ position: [10, 14, 10], fov: 45, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }} className="w-full h-full">
        <PreloadPieces />
        <Board onPanChange={setIsPanned} />
      </Canvas>
      {isPanned && (
        <div className='fixed bottom-4 right-4 text-white shadow-xl px-2 py-1 pointer-events-none'>
          Click C to reset back to center
        </div>
      )}
    </>
  )
}

