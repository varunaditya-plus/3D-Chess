import { collectRayMoves } from './utils'

const queenDirections = []

for (let rowDelta = -1; rowDelta <= 1; rowDelta += 1) {
  for (let colDelta = -1; colDelta <= 1; colDelta += 1) {
    for (let layerDelta = -1; layerDelta <= 1; layerDelta += 1) {
      if (rowDelta === 0 && colDelta === 0 && layerDelta === 0) { continue }
      queenDirections.push({ rowDelta, colDelta, layerDelta })
    }
  }
}

export const getQueenMoves = (piece, occupancy) => collectRayMoves(piece, occupancy, queenDirections)