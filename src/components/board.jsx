import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { ChessPiece, backRowOrder } from './pieces'
import { pieceMoveGenerators } from './pieces/moves'
import { createOccupancyMap } from './pieces/utils'

const layerHeights = Array.from({ length: 8 }, (_, i) => -3.5 + i)
const boardSize = 8
let pieceIdCounter = 0

const createPiece = (type, color, row, col, layer = 0) => ({ id: `${color}-${type}-${pieceIdCounter += 1}`, type, color, row, col, layer })

const buildInitialPieces = () => {
  const pieces = []
  backRowOrder.forEach((type, col) => {
    pieces.push(createPiece(type, 'white', 0, col))
    pieces.push(createPiece(type, 'brown', 7, col))
  })
  for (let col = 0; col < boardSize; col += 1) {
    pieces.push(createPiece('pawn', 'white', 1, col))
    pieces.push(createPiece('pawn', 'brown', 6, col))
  }
  return pieces
}

const getWorldPosition = ({ layer, row, col }) => {
  const x = -3.5 + col
  const z = -3.5 + row
  const clampedLayer = Math.max(0, Math.min(layerHeights.length - 1, layer))
  const y = layerHeights[clampedLayer] + 0.01
  return [x, y, z]
}

function CheckerLayer({ height, texture, showChecker }) {
  return (
    <group position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {showChecker ? (
        <mesh raycast={null}>
          <planeGeometry args={[8, 8, 8, 8]} />
          <meshStandardMaterial map={texture} transparent opacity={1} roughness={0.5} metalness={0.1} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  )
}

function Grid3D() {
  const geometry = useMemo(() => {
    const gridSize = 8
    const halfSize = gridSize / 2
    const topY = layerHeights[7] + 1
    const positions = []

    // Grid lines in X direction (along Z axis, varying Y)
    for (let layer = 0; layer < 8; layer += 1) {
      const y = layerHeights[layer]
      for (let row = 0; row <= 8; row += 1) {
        const z = -halfSize + (row * gridSize / 8)
        positions.push(-halfSize, y, z, halfSize, y, z)
      }
    }

    for (let row = 0; row <= 8; row += 1) {
      const z = -halfSize + (row * gridSize / 8)
      positions.push(-halfSize, topY, z, halfSize, topY, z)
    }

    // Grid lines in Z direction (along X axis, varying Y)
    for (let layer = 0; layer < 8; layer += 1) {
      const y = layerHeights[layer]
      for (let col = 0; col <= 8; col += 1) {
        const x = -halfSize + (col * gridSize / 8)
        positions.push(x, y, -halfSize, x, y, halfSize)
      }
    }

    for (let col = 0; col <= 8; col += 1) {
      const x = -halfSize + (col * gridSize / 8)
      positions.push(x, topY, -halfSize, x, topY, halfSize)
    }

    // Vertical lines (along Y axis)
    for (let row = 0; row <= 8; row += 1) {
      const z = -halfSize + (row * gridSize / 8)
      for (let col = 0; col <= 8; col += 1) {
        const x = -halfSize + (col * gridSize / 8)
        positions.push(x, layerHeights[0], z, x, topY, z)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])

  useEffect(
    () => () => { geometry.dispose() },
    [geometry],
  )

  return (
    <lineSegments geometry={geometry} raycast={null}>
      <lineBasicMaterial color="#f5f5f5" transparent opacity={0.15} />
    </lineSegments>
  )
}

function Board({ onPanChange }) {
  const [pieces, setPieces] = useState(() => buildInitialPieces())
  const [selectedPieceId, setSelectedPieceId] = useState(null)
  const [availableMoves, setAvailableMoves] = useState([])
  const gl = useThree(state => state.gl)
  const camera = useThree(state => state.camera)
  const cameraControlsRef = useRef(null)
  const isDraggingRef = useRef(false)
  const pointerDownPosRef = useRef(null)
  const wasPannedRef = useRef(false)
  const initialPositionRef = useRef([10, 14, 10])
  
  const boxCenter = useMemo(() => {
    const xCenter = 0 // Middle of board (-3.5 to 3.5)
    const zCenter = 0 // Middle of board (-3.5 to 3.5)
    const yCenter = (layerHeights[0] + layerHeights[layerHeights.length - 1]) / 2 // Middle of layers
    return [xCenter, yCenter, zCenter]
  }, [])

  useEffect(() => {
    if (cameraControlsRef.current) {
      const controls = cameraControlsRef.current
      controls.setTarget(...boxCenter)
      initialPositionRef.current = [camera.position.x, camera.position.y, camera.position.z]
      controls.mouseButtons.middle = 2 // PAN
      controls.mouseButtons.right = 2 // PAN
    }
  }, [camera, boxCenter])

  useFrame(() => {
    if (cameraControlsRef.current && onPanChange) {
      const target = cameraControlsRef.current.getTarget(new THREE.Vector3())
      const isPanned = Math.abs(target.x - boxCenter[0]) > 0.01 || Math.abs(target.y - boxCenter[1]) > 0.01 || Math.abs(target.z - boxCenter[2]) > 0.01
      if (isPanned !== wasPannedRef.current) {
        wasPannedRef.current = isPanned
        onPanChange(isPanned)
      }
    }
  })

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'c' || e.key === 'C') {
        if (cameraControlsRef.current) {
          const controls = cameraControlsRef.current
          controls.setTarget(...boxCenter)
          controls.setLookAt(...initialPositionRef.current, ...boxCenter, true)
          wasPannedRef.current = false
          if (onPanChange) onPanChange(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onPanChange, boxCenter])

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

  const getPieceScale = type => (type === 'rook' ? 0.6 : 0.5) // rook model is a bit smaller than the rest

  const occupancy = useMemo(() => createOccupancyMap(pieces), [pieces])

  const handlePiecePointerOver = useCallback(event => {
    event.stopPropagation()
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePiecePointerOut = useCallback(event => {
    event.stopPropagation()
    document.body.style.cursor = 'default'
  }, [])

  const handlePiecePointerDown = useCallback(event => {
    event.stopPropagation()
    isDraggingRef.current = false
    pointerDownPosRef.current = { x: event.clientX, y: event.clientY }
  }, [])

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (pointerDownPosRef.current) {
        const dx = e.clientX - pointerDownPosRef.current.x
        const dy = e.clientY - pointerDownPosRef.current.y
        if (Math.sqrt(dx * dx + dy * dy) > 5) {
          isDraggingRef.current = true
        }
      }
    }
    const handlePointerUp = () => {
      pointerDownPosRef.current = null
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  const handlePieceClick = useCallback(
    (event, piece) => {
      event.stopPropagation()
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        return
      }
      if (selectedPieceId === piece.id) {
        setSelectedPieceId(null)
        setAvailableMoves([])
        return
      }
      const generator = pieceMoveGenerators[piece.type]
      if (!generator) {
        setSelectedPieceId(null)
        setAvailableMoves([])
        return
      }
      const moves = generator(piece, occupancy)
      setSelectedPieceId(piece.id)
      setAvailableMoves(moves)
    },
    [occupancy, selectedPieceId],
  )

  const handleMoveSelection = useCallback(
    (event, targetPosition) => {
      event.stopPropagation()
      setPieces(prevPieces => {
        const movingPiece = prevPieces.find(piece => piece.id === selectedPieceId)
        if (!movingPiece) { return prevPieces }
        const withoutMoving = prevPieces.filter(piece => piece.id !== movingPiece.id)
        const withoutCaptured = withoutMoving.filter(
          piece => !(piece.layer === targetPosition.layer && piece.row === targetPosition.row && piece.col === targetPosition.col),
        )
        return [...withoutCaptured, { ...movingPiece, ...targetPosition }]
      })
      setSelectedPieceId(null)
      setAvailableMoves([])
      document.body.style.cursor = 'default'
    },
    [selectedPieceId],
  )

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 12, 6]} intensity={1} />
      <Grid3D />
      {layerHeights.map((height, idx) => (
        <CheckerLayer
          key={height}
          height={height}
          texture={checkerTexture}
          showChecker={idx === 0}
        />
      ))}
      {pieces.map(piece => (
        <ChessPiece
          key={piece.id}
          type={piece.type}
          color={piece.color}
          position={getWorldPosition(piece)}
          scale={getPieceScale(piece.type)}
          onPointerOver={handlePiecePointerOver}
          onPointerOut={handlePiecePointerOut}
          onPointerDown={handlePiecePointerDown}
          onClick={event => handlePieceClick(event, piece)}
        />
      ))}
      {availableMoves.map(move => {
        const [x, y, z] = getWorldPosition(move)
        return (
          <mesh
            key={`move-${move.layer}-${move.row}-${move.col}`}
            position={[x, y + 0.3, z]}
            onClick={event => handleMoveSelection(event, move)}
            onPointerOver={event => {
              event.stopPropagation()
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={event => {
              event.stopPropagation()
              document.body.style.cursor = 'default'
            }}
          >
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshStandardMaterial color="#6ee7ff" emissive="#46c5ff" emissiveIntensity={0.6} transparent opacity={0.9} />
          </mesh>
        )
      })}
      <CameraControls
        ref={cameraControlsRef}
        minDistance={6}
        maxDistance={30}
        polarRotateSpeed={0.8}
        azimuthRotateSpeed={0.8}
        dollySpeed={0.8}
        panSpeed={0.8}
        touches={{
          one: 0, // ROTATE
          two: 2, // PAN
          three: 1, // DOLLY
        }}
      />
    </>
  )
}

export default Board