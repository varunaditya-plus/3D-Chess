import { collectRayMoves } from './utils'

const bishopDirections = []

for (let rowDelta = -1; rowDelta <= 1; rowDelta += 1) {
  for (let colDelta = -1; colDelta <= 1; colDelta += 1) {
    for (let layerDelta = -1; layerDelta <= 1; layerDelta += 1) {
      const nonZero = [rowDelta, colDelta, layerDelta].filter(delta => delta !== 0).length
      if (nonZero >= 2) {
        bishopDirections.push({ rowDelta, colDelta, layerDelta })
      }
    }
  }
}

export const getBishopMoves = (piece, occupancy) => collectRayMoves(piece, occupancy, bishopDirections)