import { isEnemyAt, isSquareEmpty, isWithinBounds, offsetPosition } from './utils'

const forwardDirection = {
  white: 1,
  brown: -1,
}

export const getPawnMoves = (piece, occupancy) => {
  const moves = []
  const rowDelta = forwardDirection[piece.color] ?? 1

  // Starting rows: white pawns start at row 1, brown pawns start at row 6
  const startingRow = piece.color === 'white' ? 1 : 6
  const startingLayer = 0
  const isOnStartingRow = piece.row === startingRow
  const isOnStartingLayer = piece.layer === startingLayer

  // One space forward
  const forwardStep = offsetPosition(piece, { rowDelta })
  if (isWithinBounds(forwardStep) && isSquareEmpty(occupancy, forwardStep)) {
    moves.push(forwardStep)

    // Two spaces forward on first move (only if one space forward is empty)
    if (isOnStartingRow) {
      const doubleForwardStep = offsetPosition(piece, { rowDelta: rowDelta * 2 })
      if (isWithinBounds(doubleForwardStep) && isSquareEmpty(occupancy, doubleForwardStep)) {
        moves.push(doubleForwardStep)
      }
    }
  }

  // One space up
  const upwardStep = offsetPosition(piece, { layerDelta: 1 })
  if (isWithinBounds(upwardStep) && isSquareEmpty(occupancy, upwardStep)) {
    moves.push(upwardStep)

    // Two spaces up on first move (only from starting layer and if one space up is empty)
    if (isOnStartingLayer) {
      const doubleUpwardStep = offsetPosition(piece, { layerDelta: 2 })
      if (isWithinBounds(doubleUpwardStep) && isSquareEmpty(occupancy, doubleUpwardStep)) {
        moves.push(doubleUpwardStep)
      }
    }
  }

  // Same-layer diagonal captures (standard chess)
  const captureOffsets = [
    { rowDelta, colDelta: 1 },
    { rowDelta, colDelta: -1 },
  ]

  captureOffsets.forEach(offset => {
    const target = offsetPosition(piece, offset)
    if (isWithinBounds(target) && isEnemyAt(occupancy, target, piece.color)) {
      moves.push(target)
    }
  })

  // Forward and diagonal (up and diagonal)
  const upwardDiagonalCaptures = [
    { rowDelta, colDelta: 1, layerDelta: 1 },
    { rowDelta, colDelta: -1, layerDelta: 1 },
  ]

  upwardDiagonalCaptures.forEach(offset => {
    const target = offsetPosition(piece, offset)
    if (isWithinBounds(target) && isEnemyAt(occupancy, target, piece.color)) {
      moves.push(target)
    }
  })

  // Forward and straight on the layer above (up and straight next)
  const upwardStraightCapture = { rowDelta, colDelta: 0, layerDelta: 1 }
  const upwardStraightTarget = offsetPosition(piece, upwardStraightCapture)
  if (isWithinBounds(upwardStraightTarget) && isEnemyAt(occupancy, upwardStraightTarget, piece.color)) {
    moves.push(upwardStraightTarget)
  }

  return moves
}