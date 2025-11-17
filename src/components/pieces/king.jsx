import { collectSingleStepMoves } from './utils'

const kingDirections = []

for (let rowDelta = -1; rowDelta <= 1; rowDelta += 1) {
  for (let colDelta = -1; colDelta <= 1; colDelta += 1) {
    for (let layerDelta = -1; layerDelta <= 1; layerDelta += 1) {
      if (rowDelta === 0 && colDelta === 0 && layerDelta === 0) { continue }
      kingDirections.push({ rowDelta, colDelta, layerDelta })
    }
  }
}

export const getKingMoves = (piece, occupancy) => collectSingleStepMoves(piece, occupancy, kingDirections)