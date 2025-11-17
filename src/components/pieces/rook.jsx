import { collectRayMoves } from './utils'

const rookDirections = [
  { rowDelta: 1 },
  { rowDelta: -1 },
  { colDelta: 1 },
  { colDelta: -1 },
  { layerDelta: 1 },
  { layerDelta: -1 },
]

export const getRookMoves = (piece, occupancy) => collectRayMoves(piece, occupancy, rookDirections)