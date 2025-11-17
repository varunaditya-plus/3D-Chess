export const BOARD_LIMIT = 8

export const toKey = ({ layer, row, col }) => `${layer}-${row}-${col}`

export const isWithinBounds = ({ layer, row, col }) =>
  layer >= 0 && layer < BOARD_LIMIT && row >= 0 && row < BOARD_LIMIT && col >= 0 && col < BOARD_LIMIT

export const offsetPosition = ({ layer, row, col }, { layerDelta = 0, rowDelta = 0, colDelta = 0 }) => ({
  layer: layer + layerDelta,
  row: row + rowDelta,
  col: col + colDelta,
})

export const createOccupancyMap = pieces => {
  const map = new Map()
  pieces.forEach(piece => {
    map.set(toKey(piece), piece)
  })
  return map
}

export const getPieceAt = (occupancy, coords) => occupancy.get(toKey(coords))

export const isSquareEmpty = (occupancy, coords) => !getPieceAt(occupancy, coords)

export const isEnemyAt = (occupancy, coords, color) => {
  const target = getPieceAt(occupancy, coords)
  return Boolean(target && target.color !== color)
}

export const collectRayMoves = (piece, occupancy, directions) => {
  const moves = []
  directions.forEach(direction => {
    let next = offsetPosition(piece, direction)
    while (isWithinBounds(next)) {
      const occupant = getPieceAt(occupancy, next)
      if (!occupant) {
        moves.push(next)
      } else {
        if (occupant.color !== piece.color) { moves.push(next) }
        break
      }
      next = offsetPosition(next, direction)
    }
  })
  return moves
}

export const collectSingleStepMoves = (piece, occupancy, directions) =>
  directions
    .map(direction => offsetPosition(piece, direction))
    .filter(isWithinBounds)
    .filter(coords => {
      const occupant = getPieceAt(occupancy, coords)
      return !occupant || occupant.color !== piece.color
    })

