import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { ChessPiece, backRowOrder } from './pieces'

const layerHeights = Array.from({ length: 8 }, (_, i) => -3.5 + i)

function CheckerLayer({ height, index, isActive, onSelect, texture }) {
  const [isHovered, setIsHovered] = useState(false)
  const pointerDownRef = useRef(null)
  const outlineGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(8, 8, 1, 1)
    const edges = new THREE.EdgesGeometry(geo)
    geo.dispose()
    return edges
  }, [])
  const hoverGeometry = useMemo(() => {
    const size = 8
    const divisions = 8
    const half = size / 2
    const step = size / divisions
    const positions = []

    for (let i = 0; i <= divisions; i += 1) {
      const k = -half + i * step
      positions.push(-half, k, 0, half, k, 0)
      positions.push(k, -half, 0, k, half, 0)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [])

  useEffect(
    () => () => {
      outlineGeometry.dispose()
      hoverGeometry.dispose()
    },
    [outlineGeometry, hoverGeometry],
  )

  return (
    <group position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh
        onPointerDown={e => {
          pointerDownRef.current = { x: e.clientX, y: e.clientY }
        }}
        onClick={e => {
          e.stopPropagation()
          if (pointerDownRef.current) {
            const dx = Math.abs(e.clientX - pointerDownRef.current.x)
            const dy = Math.abs(e.clientY - pointerDownRef.current.y)
            const dragThreshold = 5
            if (dx < dragThreshold && dy < dragThreshold) { onSelect(index) }
            pointerDownRef.current = null
          }
        }}
        onPointerOver={e => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          setIsHovered(true)
        }}
        onPointerOut={e => {
          e.stopPropagation()
          document.body.style.cursor = 'default'
          setIsHovered(false)
        }}
      >
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>

      {isActive ? (
        <mesh>
          <planeGeometry args={[8, 8, 8, 8]} />
          <meshStandardMaterial map={texture} transparent opacity={1} roughness={0.5} metalness={0.1} side={THREE.DoubleSide} />
        </mesh>
      ) : isHovered ? (
        <lineSegments geometry={hoverGeometry}>
          <lineBasicMaterial color="#f5f5f5" transparent opacity={0.4} />
        </lineSegments>
      ) : (
        <lineSegments geometry={outlineGeometry}>
          <lineBasicMaterial color="#f5f5f5" transparent opacity={0.5} />
        </lineSegments>
      )}
    </group>
  )
}

function Board() {
  const [activeLayer, setActiveLayer] = useState(0)
  const gl = useThree(state => state.gl)

  const checkerTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const ctx = canvas.getContext('2d')
    const square = canvas.width / 8
    const colors = ['#f6f6f6', '#0f0f0f']

    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        ctx.fillStyle = colors[(x + y) % 2]
        ctx.fillRect(x * square, y * square, square, square)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    texture.needsUpdate = true
    return texture
  }, [gl])

  useEffect(
    () => () => { checkerTexture.dispose() },
    [checkerTexture],
  )

  const handleSelect = index => {
    setActiveLayer(prev => (prev === index ? null : index))
  }

  const bottomLayerHeight = layerHeights[0]

  const getSquarePosition = (row, col) => {
    const x = -3.5 + col
    const z = -3.5 + row
    return [x, bottomLayerHeight + 0.01, z]
  }

  const getPieceScale = type => (type === 'rook' ? 0.6 : 0.5) // rook model is a bit smaller than the rest

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 12, 6]} intensity={1} />
      {layerHeights.map((height, idx) => (
        <CheckerLayer
          key={height}
          height={height}
          index={idx}
          isActive={activeLayer === idx}
          onSelect={handleSelect}
          texture={checkerTexture}
        />
      ))}
      {backRowOrder.map((type, col) => (
        <ChessPiece
          key={`white-${type}-${col}`}
          type={type}
          color="white"
          position={getSquarePosition(0, col)}
          scale={getPieceScale(type)}
        />
      ))}
      {Array.from({ length: 8 }, (_, col) => (
        <ChessPiece
          key={`white-pawn-${col}`}
          type="pawn"
          color="white"
          position={getSquarePosition(1, col)}
        />
      ))}
      {backRowOrder.map((type, col) => (
        <ChessPiece
          key={`brown-${type}-${col}`}
          type={type}
          color="brown"
          position={getSquarePosition(7, col)}
          scale={getPieceScale(type)}
        />
      ))}
      {Array.from({ length: 8 }, (_, col) => (
        <ChessPiece
          key={`brown-pawn-${col}`}
          type="pawn"
          color="brown"
          position={getSquarePosition(6, col)}
        />
      ))}
      <CameraControls
        minDistance={6}
        maxDistance={30}
        polarRotateSpeed={0.8}
        azimuthRotateSpeed={0.8}
        dollySpeed={0.8}
      />
    </>
  )
}

export default Board