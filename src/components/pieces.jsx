'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

export const backRowOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

export function ChessPiece({ type, color, position, scale = 0.5, onClick, onPointerDown, onPointerOver, onPointerOut }) {
  const { scene } = useGLTF(`/${type}/scene.gltf`)
  const clonedScene = useMemo(() => scene.clone(), [scene])
  const materialRef = useRef(null)
  const groupRef = useRef(null)

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
    if (groupRef.current) {
      groupRef.current.position.set(...position)
    }
  }, [position])

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