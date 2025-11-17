import { isEnemyAt, isSquareEmpty, isWithinBounds, offsetPosition } from './utils'

const knightOffsets = [
  { rowDelta: 2, colDelta: 1 },
  { rowDelta: 2, colDelta: -1 },
  { rowDelta: -2, colDelta: 1 },
  { rowDelta: -2, colDelta: -1 },
  { layerDelta: 2, colDelta: 1 },
  { layerDelta: 2, colDelta: -1 },
  { layerDelta: -2, colDelta: 1 },
  { layerDelta: -2, colDelta: -1 },
]

export const getKnightMoves = (piece, occupancy) =>
  knightOffsets
    .map(offset => offsetPosition(piece, offset))
    .filter(isWithinBounds)
    .filter(coords => isSquareEmpty(occupancy, coords) || isEnemyAt(occupancy, coords, piece.color))