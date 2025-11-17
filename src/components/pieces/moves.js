import { getBishopMoves } from './bishop'
import { getKingMoves } from './king'
import { getKnightMoves } from './knight'
import { getPawnMoves } from './pawn'
import { getQueenMoves } from './queen'
import { getRookMoves } from './rook'

export const pieceMoveGenerators = {
  pawn: getPawnMoves,
  rook: getRookMoves,
  knight: getKnightMoves,
  bishop: getBishopMoves,
  queen: getQueenMoves,
  king: getKingMoves,
}