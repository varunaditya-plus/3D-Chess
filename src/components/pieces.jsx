import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export const backRowOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

export function ChessPiece({ type, color, position, scale = 0.5, onClick, onPointerDown, onPointerOver, onPointerOut }) {
  const { scene } = useGLTF(`/${type}/scene.gltf`)
  const clonedScene = useMemo(() => scene.clone(), [scene])
  const materialRef = useRef(null)
  const groupRef = useRef(null)
  const targetPosition = useRef(new THREE.Vector3(...position))
  const currentPosition = useRef(new THREE.Vector3(...position))

  useEffect(() => {
    const material = new THREE.MeshStandardMaterial({
      color: color === 'white' ? '#f5f5f5' : '#616366',
      roughness: 0.7,
      metalness: 0.1,
    })
    materialRef.current = material

    clonedScene.traverse(child => {
      if (child.isMesh) { child.material = material }
    })

    return () => {
      if (materialRef.current) { materialRef.current.dispose() }
    }
  }, [clonedScene, color])

  useEffect(() => {
    targetPosition.current.set(...position)
  }, [position])

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(targetPosition.current)
      currentPosition.current.copy(targetPosition.current)
    }
  }, [])

  useFrame(() => {
    if (!groupRef.current) { return }
    currentPosition.current.lerp(targetPosition.current, 0.2)
    if (currentPosition.current.distanceTo(targetPosition.current) < 0.001) {
      currentPosition.current.copy(targetPosition.current)
    }
    groupRef.current.position.copy(currentPosition.current)
  })

  return (
    <group ref={groupRef} scale={scale} rotation={[0, 0, 0]} onPointerDown={onPointerDown} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <primitive object={clonedScene} />
    </group>
  )
}

export function PreloadPieces() {
  useGLTF.preload('/rook/scene.gltf')
  useGLTF.preload('/knight/scene.gltf')
  useGLTF.preload('/bishop/scene.gltf')
  useGLTF.preload('/queen/scene.gltf')
  useGLTF.preload('/king/scene.gltf')
  useGLTF.preload('/pawn/scene.gltf')
  return null
}